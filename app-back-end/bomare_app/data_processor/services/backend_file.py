import pandas as pd
import pickle
import json
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from datetime import datetime
import os

script_dir = os.path.dirname(os.path.abspath(__file__))  # Folder where script lives


def predict_feeder_errors_detailed(
    feeder_setup_path,
    historical_merged_path =os.path.join(script_dir, 'PartUsage.csv'),
    pipeline_path= os.path.join(script_dir, 'bomare_best_pipeline.pkl'),
    file_prefix='predictions_output'
):
    # Get the current date in YYYY-MM-DD format
    current_date = datetime.now().strftime('%Y-%m-%d')
    
    # Create dynamic file names with the current date
    excel_output_path = f'{file_prefix}_{current_date}.xlsx'
    csv_output_path = f'{file_prefix}_{current_date}.csv'
    json_output_path = f'{file_prefix}_{current_date}.json'
    
    # Store all output paths for return value
    output_paths = {
        'excel': excel_output_path,
        'csv': csv_output_path,
        'json': json_output_path
    }

    print("---- Starting prediction process ----")
    
    # 1) Load historical merged data
    try:
        print(f"Loading historical data from {historical_merged_path}")
        hist = pd.read_csv(historical_merged_path)
        print(f"Historical data loaded: {hist.shape[0]} rows, {hist.shape[1]} columns")
        print(f"Historical data columns: {hist.columns.tolist()}")
    except Exception as e:
        print(f"❌ Error loading historical data: {e}")

    # Sample of historical data
    print("\nSample of historical data:")
    print(hist.head(2))
    
    # 2) Load new feeder setup with error handling
    print(f"\nLoading feeder setup from {feeder_setup_path}")
    try:
        # Try loading with comma delimiter first
        fs = pd.read_csv(feeder_setup_path, skiprows=2, skipfooter=2)
    except Exception as e:
        print(f"First load attempt failed: {e}")
        # Try with different delimiters
        try:
            fs = pd.read_csv(feeder_setup_path, skiprows=2, skipfooter=2, sep=None, engine='python')
        except Exception as e2:
            print(f"Second load attempt failed: {e2}")
            # Final attempt with very permissive settings
            fs = pd.read_csv(feeder_setup_path, skiprows=2, skipfooter=2, engine="python", on_bad_lines="skip")
    
    print(f"Feeder setup loaded: {fs.shape[0]} rows, {fs.shape[1]} columns")
    print(f"Feeder setup columns: {fs.columns.tolist()}")
    
    # Sample of feeder setup data
    print("\nSample of feeder setup data:")
    print(fs.head(2))
    
    # 3) Check for required columns
    required_columns = ['ModuleNumber', 'Location', 'PartNumber']
    module_col = None
    location_col = None
    part_number_col = None
    
    # Find actual column names (case-insensitive)
    for col in fs.columns:
        if col.lower() == 'modulenumber':
            module_col = col
        elif col.lower() == 'location':
            location_col = col
        elif col.lower() == 'partnumber':
            part_number_col = col
    
    missing_cols = []
    if not module_col:
        missing_cols.append('ModuleNumber')
    if not location_col:
        missing_cols.append('Location')
    if not part_number_col:
        missing_cols.append('PartNumber')
    
    if missing_cols:
        raise KeyError(f"Required columns missing in the FeederSetup file: {missing_cols}")
    
    print(f"\nUsing columns: Module={module_col}, Location={location_col}, PartNumber={part_number_col}")
    
    # 4) Normalize & explode Position
    print("\nCreating and normalizing Position column")
    fs['Position'] = (
        fs[module_col].astype(str).str.lstrip('0').replace('', '0')
        .map(lambda m: f"M{m}") + '-' +
        fs[location_col].astype(str).str.replace("'", "").str.lstrip('0').replace('', '0')
    )
    
    # Before explode, check if Position contains multiple values
    has_multiple = fs['Position'].str.contains(',').any()
    print(f"Positions contain multiple values: {has_multiple}")
    
    if has_multiple:
        print("Exploding Position column with multiple values")
        fs = fs.assign(Position=fs['Position'].str.split(',')).explode('Position').reset_index(drop=True)
    
    print(f"After position processing: {fs.shape[0]} rows")
    print("Position sample values:", fs['Position'].head(5).tolist())
    
    # 5) Merge with historical features
    print("\nMerging with historical features")
    print(f"Keys for merge: Position and {part_number_col}")
    
    # Check for matching keys before merge
    fs_keys = set(zip(fs['Position'], fs[part_number_col]))
    hist_keys = set()
    if 'Position' in hist.columns and part_number_col in hist.columns:
        hist_keys = set(zip(hist['Position'], hist[part_number_col]))
    
    common_keys = fs_keys.intersection(hist_keys)
    print(f"Keys in feeder setup: {len(fs_keys)}")
    print(f"Keys in historical data: {len(hist_keys)}")
    print(f"Common keys: {len(common_keys)}")
    
    # Perform merge
    df = pd.merge(fs, hist, on=['Position', part_number_col], how='left')
    print(f"After merge: {df.shape[0]} rows, {df.shape[1]} columns")
    
    # Check for NaN values after merge
    nan_count = df.isna().sum().sum()
    print(f"Total NaN values after merge: {nan_count}")
    
    # 6) Load pipeline
    print("\nLoading ML pipeline")
    try:
        with open(pipeline_path, 'rb') as f:
            pipeline = pickle.load(f)
        print("Pipeline loaded successfully")
    except Exception as e:
        print(f"Error loading pipeline: {e}")
        raise
    
    # 7) Extract feature names from pipeline
    pre = pipeline.named_steps['pre']
    num_feats = pre.transformers_[0][2]
    cat_feats = pre.transformers_[1][2]
    features = list(num_feats) + list(cat_feats)
    
    print(f"\nFeatures required by the model:")
    print(f"Numeric features ({len(num_feats)}): {num_feats}")
    print(f"Categorical features ({len(cat_feats)}): {cat_feats}")
    
    # 8) Check for missing columns and handle them
    missing = [c for c in features if c not in df.columns]
    if missing:
        print(f"\nWARNING: Missing columns in merged DataFrame: {missing}")
        print("Adding missing columns with NaN values")
        for col in missing:
            df[col] = float('nan')
    
    # Debug file creation removed
    
    # Add a custom 'Error'=0 column if not present
    if 'Error' not in df.columns:
        print("Adding 'Error' column with default 0 values")
        df['Error'] = 0
    
    # Check if HasError column is needed
    if 'HasError' not in df.columns:
        print("Creating 'HasError' column")
        df['HasError'] = (df['Error'] > 0).astype(int)
    
    # 9) Predict
    print("\nRunning prediction")
    X = df[features]
    
    # Check for inf values
    inf_count = np.isinf(X.select_dtypes(include=['float64', 'int64']).values).sum()
    if inf_count > 0:
        print(f"WARNING: Found {inf_count} infinity values in features")
        # Replace inf with NaN
        X = X.replace([np.inf, -np.inf], np.nan)
    
    # Print feature statistics
    print("\nFeature statistics:")
    for col in features:
        if col in X.columns:
            if X[col].dtype in ['float64', 'int64']:
                print(f"{col}: min={X[col].min()}, max={X[col].max()}, mean={X[col].mean()}, null={X[col].isna().sum()}")
            else:
                print(f"{col}: unique values={X[col].nunique()}, null={X[col].isna().sum()}")
                if X[col].nunique() < 10:
                    print(f"  Values: {X[col].dropna().unique().tolist()}")
    
    # Make predictions
    try:
        print("\nPredicting probabilities...")
        df['ErrorProbability'] = pipeline.predict_proba(X)[:, 1]
        
        print("Probability statistics:")
        print(f"Min: {df['ErrorProbability'].min()}")
        print(f"Max: {df['ErrorProbability'].max()}")
        print(f"Mean: {df['ErrorProbability'].mean()}")
        print(f"Distribution: {np.percentile(df['ErrorProbability'], [0, 25, 50, 75, 90, 95, 99, 100])}")
        
        print("\nPredicting classes...")
        df['PredictedError'] = pipeline.predict(X)
        
        # Check prediction distribution
        error_count = df['PredictedError'].sum()
        error_rate = error_count / len(df)
        print(f"Predicted errors: {error_count} out of {len(df)} ({error_rate:.2%})")
        
        # If all predictions are 0, try lowering threshold
        if error_count == 0:
            print("\nWARNING: No errors predicted. Trying lower threshold...")
            # Get top 5% as errors
            threshold = np.percentile(df['ErrorProbability'], 95)
            df['PredictedError'] = (df['ErrorProbability'] >= threshold).astype(int)
            print(f"Using threshold {threshold:.4f} for top 5%")
            print(f"New predicted errors: {df['PredictedError'].sum()} ({df['PredictedError'].mean():.2%})")
        
    except Exception as e:
        print(f"Error during prediction: {e}")
        import traceback
        traceback.print_exc()
        raise
    
    # 10) Compute metrics
    metrics = {}  # Initialize as empty dict instead of string
    
    # Check both 'ActualError' and 'Error' columns, prioritizing 'ActualError' if both exist
    error_col = None
    if 'ActualError' in df.columns:
        error_col = 'ActualError'
    elif 'Error' in df.columns:
        error_col = 'Error'
        
    if error_col:
        try:
            # Check for NaN values and handle them
            nan_count = df[error_col].isna().sum()
            if nan_count > 0:
                print(f"\nWARNING: Found {nan_count} NaN values in {error_col} column")
                # Only use rows where the truth value is not NaN
                valid_mask = ~df[error_col].isna()
                if valid_mask.sum() > 0:
                    print(f"Using {valid_mask.sum()} valid rows for metrics calculation")
                    y_true = df.loc[valid_mask, error_col]
                    y_pred = df.loc[valid_mask, 'PredictedError']
                    
                    # Convert multiclass labels to binary (0 or 1)
                    # This fixes the "Target is multiclass but average='binary'" error
                    y_true_binary = (y_true > 0).astype(int)
                    
                    metrics = {
                        'accuracy': float(accuracy_score(y_true_binary, y_pred)),
                        'precision': float(precision_score(y_true_binary, y_pred, zero_division=0)),
                        'recall': float(recall_score(y_true_binary, y_pred, zero_division=0)),
                        'f1_score': float(f1_score(y_true_binary, y_pred, zero_division=0)),
                        'valid_samples': int(valid_mask.sum()),
                        'total_samples': int(len(df)),
                        'nan_samples': int(nan_count)
                    }
                    print(f"\nPerformance metrics (using {error_col} column, {valid_mask.sum()} valid samples):")
                    for k, v in metrics.items():
                        if k not in ['valid_samples', 'total_samples', 'nan_samples']:
                            print(f"{k}: {v:.4f}")
                else:
                    raise ValueError(f"No valid values in {error_col} column after removing NaN values")
            else:
                # No NaN values, use all rows
                y_true = df[error_col]
                y_pred = df['PredictedError']
                
                # Convert multiclass labels to binary (0 or 1)
                y_true_binary = (y_true > 0).astype(int)
                
                metrics = {
                    'accuracy': float(accuracy_score(y_true_binary, y_pred)),
                    'precision': float(precision_score(y_true_binary, y_pred, zero_division=0)),
                    'recall': float(recall_score(y_true_binary, y_pred, zero_division=0)),
                    'f1_score': float(f1_score(y_true_binary, y_pred, zero_division=0)),
                    'valid_samples': int(len(df)),
                    'total_samples': int(len(df)),
                    'nan_samples': 0
                }
                print(f"\nPerformance metrics (using {error_col} column):")
                for k, v in metrics.items():
                    if k not in ['valid_samples', 'total_samples', 'nan_samples']:
                        print(f"{k}: {v:.4f}")
        except Exception as e:
            print(f"\nError calculating metrics: {e}")
            # Fallback to zeros with error note
            metrics = {
                'accuracy': 0.0,
                'precision': 0.0,
                'recall': 0.0,
                'f1_score': 0.0,
                'note': f'Error calculating metrics: {str(e)}'
            }
    else:
        print("\nNo ActualError or Error column found for metrics calculation")
        # Initialize with zeros instead of a string message
        metrics = {
            'accuracy': 0.0,
            'precision': 0.0,
            'recall': 0.0,
            'f1_score': 0.0,
            'note': 'No error truth labels available in feeder setup for performance scoring.'
        }
    
    # 11) Summary statistics
    summary = {
        'TotalRows': len(df),
        'PredictedErrors': int(df['PredictedError'].sum()),
        'ErrorRate': float(df['PredictedError'].mean())
    }
    print("\nSummary statistics:")
    for k, v in summary.items():
        print(f"{k}: {v}")
    
    # 12) Pivot tables
    print("\nGenerating pivot tables")
    
    # Determine shape column
    part_shape_col = None
    for col_name in ['PartShapeName', 'Shape']:
        if col_name in df.columns:
            part_shape_col = col_name
            break
    
    if part_shape_col:
        print(f"Using {part_shape_col} for shape analysis")
        by_shape = df.pivot_table(index=part_shape_col, values='PredictedError', aggfunc=['count', 'sum', 'mean'])
    else:
        print("No shape column found")
        by_shape = pd.DataFrame()
    
    by_part = df.pivot_table(index=part_number_col, values='PredictedError', aggfunc=['count', 'sum', 'mean'])
    by_position = df.pivot_table(index='Position', values='PredictedError', aggfunc=['count', 'sum', 'mean'])
    
    # Extract Module for grouping
    df['Module'] = df['Position'].str.extract(r'(M\d+)', expand=False)
    by_module = df.pivot_table(index='Module', values='PredictedError', aggfunc=['count', 'sum', 'mean'])
    by_module.columns = ['TotalCount', 'ErrorCount', 'ErrorRate']
    by_module = by_module.sort_values('ErrorCount', ascending=False)
    
    # Top shapes and parts with errors
    print("\nIdentifying top error patterns")
    if part_shape_col and df['PredictedError'].sum() > 0:
        top_shapes = df[df['PredictedError'] == 1].groupby(part_shape_col).size().sort_values(ascending=False).head(5).to_dict()
        print(f"Top shapes with errors: {len(top_shapes)}")
    else:
        top_shapes = {}
    
    if df['PredictedError'].sum() > 0:
        top_parts = df[df['PredictedError'] == 1].groupby(part_number_col).size().sort_values(ascending=False).head(5).to_dict()
        print(f"Top parts with errors: {len(top_parts)}")
    else:
        top_parts = {}
    
    # Top modules and part numbers with errors
    if df['PredictedError'].sum() > 0:
        module_part_errors = (
            df[df['PredictedError'] == 1]
            .groupby(['Module', part_number_col])
            .size()
            .reset_index(name='ErrorCount')
            .sort_values(['Module', 'ErrorCount'], ascending=[True, False])
        )
        
        # Top 5 part numbers per module
        module_top_parts = {}
        for mod in module_part_errors['Module'].unique():
            top_parts_mod = (
                module_part_errors[module_part_errors['Module'] == mod]
                .head(5)
                .set_index(part_number_col)['ErrorCount']
                .to_dict()
            )
            module_top_parts[mod] = top_parts_mod
        
        print(f"Modules with errors: {len(module_top_parts)}")
    else:
        module_top_parts = {}
    
    # Top modules summary
    top_modules = {}
    for mod in by_module.head(5).index:
        top_modules[mod] = {
            'ErrorCount': int(by_module.loc[mod, 'ErrorCount']),
            'TopErrorPartNumbers': module_top_parts.get(mod, {})
        }
    
    # 13) Write predictions to Excel
    print(f"\nWriting results to {excel_output_path}")
    try:
        with pd.ExcelWriter(excel_output_path) as writer:
            df.to_excel(writer, sheet_name="Predictions", index=False)
            pd.DataFrame([summary]).to_excel(writer, sheet_name="Overview", index=False)
            
            if not by_shape.empty:
                by_shape.to_excel(writer, sheet_name="ByShape")
                
            by_part.to_excel(writer, sheet_name="ByPart")
            by_position.to_excel(writer, sheet_name="ByPosition")
            
        print(f"Excel file created: {excel_output_path}")
    except Exception as e:
        print(f"Error writing Excel file: {e}")
    
    # Also save full prediction CSV
    print(f"Writing CSV to {csv_output_path}")
    df.to_csv(csv_output_path, index=False)
    
    # 14) JSON Output
    json_output = {
        'model_performance': metrics,
        'error_summary': summary,
        'top_shapes': {shape: {'ErrorCount': int(count)} for shape, count in top_shapes.items()},
        'top_modules': top_modules,
        'top_error_partnumbers': top_parts,
        'output_files': output_paths  # Add output file paths to JSON
    }
    
    # Save JSON output to file
    print(f"Writing JSON to {json_output_path}")
    try:
        # Convert any non-serializable objects to strings
        def json_serializer(obj):
            try:
                return float(obj) if isinstance(obj, (np.float32, np.float64)) else str(obj)
            except:
                return str(obj)
        
        with open(json_output_path, 'w') as f:
            json.dump(json_output, f, indent=2, default=json_serializer)
        print(f"JSON file created: {json_output_path}")
    except Exception as e:
        print(f"Error writing JSON file: {e}")
    
    print("\n---- Prediction process complete ----")
    
    # Return both the json output and the file paths
    return {
        'json_output': json_output,
        'output_paths': output_paths
    }

