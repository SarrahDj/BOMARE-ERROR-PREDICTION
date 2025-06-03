import pandas as pd 
import pickle
import json
import numpy as np
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from datetime import datetime
import os
import warnings

# Suppress the ParserWarning
warnings.filterwarnings("ignore", category=pd.errors.ParserWarning)
script_dir = os.path.dirname(os.path.abspath(__file__))  # Folder where script lives

def predict_feeder_errors(
    feeder_setup_path,
    historical_merged_path =os.path.join(script_dir, 'PartUsage.csv'),
    pipeline_path=os.path.join(script_dir,'bomare_best_pipeline.pkl'),
    file_prefix='predictions_output'
):
    # Get the current date and time in YYYY-MM-DD_HH-MM-SS format
    current_datetime = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    
    # Create output directory with timestamp
    output_dir = f'{file_prefix}_{current_datetime}'
    os.makedirs(output_dir, exist_ok=True)
    
    # Create dynamic file names with the current date inside the folder
    excel_output_path = os.path.join(output_dir, f'{file_prefix}_{current_datetime}.xlsx')
    csv_output_path = os.path.join(output_dir, f'{file_prefix}_{current_datetime}.csv')
    json_output_path = os.path.join(output_dir, f'{file_prefix}_{current_datetime}.json')
    predictions_excel_path = os.path.join(output_dir, f'predictions_with_data_{current_datetime}.xlsx')
    predictions_csv_path = os.path.join(output_dir, f'predictions_with_data_{current_datetime}.csv')
    
    # Store all output paths for return value
    output_paths = {
        'folder': output_dir,
        'excel': excel_output_path,
        'csv': csv_output_path,
        'json': json_output_path,
        'predictions_excel': predictions_excel_path,
        'predictions_csv': predictions_csv_path
    }

    # 1) Load historical merged data
    hist = pd.read_csv(historical_merged_path)
    # 2) Load feeder setup
    try:
        fs = pd.read_csv(feeder_setup_path, skiprows=2, skipfooter=2)
    except:
        fs = pd.read_csv(feeder_setup_path, skiprows=2, skipfooter=2, sep=None, engine='python', on_bad_lines='skip')

    # Store original feeder setup for predictions output
    fs_original = fs.copy()

    # Identify key columns
    cols = {col.lower(): col for col in fs.columns}
    module_col = cols.get('modulenumber')
    location_col = cols.get('location')
    part_number_col = cols.get('partnumber')
    # Normalize Position
    fs['Position'] = (fs[module_col].astype(str).str.lstrip('0').replace('', '0').map(lambda m: f"M{m}") + '-' + 
                      fs[location_col].astype(str).str.replace("'","").str.lstrip('0').replace('', '0'))
    if fs['Position'].str.contains(',').any():
        fs = fs.assign(Position=fs['Position'].str.split(',')).explode('Position').reset_index(drop=True)

    # Merge
    hist_keys = set(zip(hist['Position'], hist[part_number_col])) if 'Position' in hist.columns else set()
    df = pd.merge(fs, hist, on=['Position', part_number_col], how='left')

    # Load pipeline
    with open(pipeline_path, 'rb') as f:
        pipeline = pickle.load(f)
    pre = pipeline.named_steps['pre']
    features = list(pre.transformers_[0][2]) + list(pre.transformers_[1][2])
    for c in features:
        if c not in df.columns:
            df[c] = np.nan
    if 'Error' not in df.columns:
        df['Error'] = 0
    df['HasError'] = (df['Error'] > 0).astype(int)

    # Predict
    X = df[features].replace([np.inf, -np.inf], np.nan)
    df['ErrorProbability'] = pipeline.predict_proba(X)[:, 1]
    df['PredictedError'] = pipeline.predict(X)
    if df['PredictedError'].sum() == 0:
        thresh = np.percentile(df['ErrorProbability'], 95)
        df['PredictedError'] = (df['ErrorProbability'] >= thresh).astype(int)

    # Create predictions dataframe with original data + predictions
    # First, create Position column for original data if needed
    if 'Position' not in fs_original.columns:
        fs_original['Position'] = (fs_original[module_col].astype(str).str.lstrip('0').replace('', '0').map(lambda m: f"M{m}") + '-' + 
                                   fs_original[location_col].astype(str).str.replace("'","").str.lstrip('0').replace('', '0'))
    
    # Merge predictions back to original data
    predictions_df = pd.merge(
        fs_original, 
        df[['Position', part_number_col, 'ErrorProbability', 'PredictedError']], 
        on=['Position', part_number_col], 
        how='left'
    )
    
    # Fill NaN values in prediction columns
    predictions_df['ErrorProbability'] = predictions_df['ErrorProbability'].fillna(0)
    predictions_df['PredictedError'] = predictions_df['PredictedError'].fillna(0)

    # Metrics
    error_col = 'ActualError' if 'ActualError' in df.columns else 'Error'
    y_true = (df[error_col] > 0).astype(int)
    y_pred = df['PredictedError']
    metrics = {
        'accuracy': float(accuracy_score(y_true, y_pred)),
        'precision': float(precision_score(y_true, y_pred, zero_division=0)),
        'recall': float(recall_score(y_true, y_pred, zero_division=0)),
        'f1_score': float(f1_score(y_true, y_pred, zero_division=0)),
        'total_samples': int(len(df)),
        'total_errors': int(df['PredictedError'].sum()),
        'error_rate': float(df['PredictedError'].mean())
    }

    # Additional summaries
    total_parts = len(df)
    unique_parts = int(df[part_number_col].nunique())
    unique_feeders = int(df['Position'].nunique())
    most_used_feeder = df['Position'].mode().iloc[0]
    part_count_per_feeder = df.groupby('Position')[part_number_col].count().to_dict()

    # Shapes, Packages
    shape_col = next((c for c in ['PartShapeName','Shape'] if c in df.columns), None)
    unique_shapes = int(df[shape_col].nunique()) if shape_col else 0
    shape_dist = df[shape_col].value_counts(normalize=True).to_dict() if shape_col else {}
    most_common_shape = df[shape_col].mode().iloc[0] if shape_col and not df[shape_col].mode().empty else None

    pkg_col = 'PackageName' if 'PackageName' in df.columns else None
    unique_pkgs = int(df[pkg_col].nunique()) if pkg_col else 0
    package_dist = df[pkg_col].value_counts(normalize=True).to_dict() if pkg_col else {}
    most_common_package = df[pkg_col].mode().iloc[0] if pkg_col and not df[pkg_col].mode().empty else None

    # distributions by other cols
    pkg_type_dist = df['PackageType'].value_counts(normalize=True).to_dict() if 'PackageType' in df.columns else {}
    tape_width_dist = df['TapeWidth'].value_counts(normalize=True).to_dict() if 'TapeWidth' in df.columns else {}
    feeder_type_dist = df['FeederType'].value_counts(normalize=True).to_dict() if 'FeederType' in df.columns else {}

    # Error distributions
    # by shape
    df_shape_errors = None
    err_by_shape = {}
    top5_shapes_err = {}
    shape_with_most_err = None
    
    if shape_col:
        # Create detailed shape error DataFrame
        df_shape_errors = df.groupby(shape_col).agg({
            'PredictedError': ['sum', 'mean'],
            'Position': 'count'
        }).reset_index()
        df_shape_errors.columns = [shape_col, 'ErrorCount', 'ErrorRate', 'TotalCount']
        df_shape_errors['ErrorPercentage'] = df_shape_errors['ErrorCount'] / df_shape_errors['ErrorCount'].sum() * 100
        df_shape_errors = df_shape_errors.sort_values('ErrorCount', ascending=False).reset_index(drop=True)
        
        err_by_shape = df[df['PredictedError']==1][shape_col].value_counts().to_dict()
        top5_shapes_err = dict(pd.Series(err_by_shape).sort_values(ascending=False).head(5))
        
        if err_by_shape:
            top_shape, top_count = max(err_by_shape.items(), key=lambda x: x[1])
            shape_with_most_err = {
                'name': top_shape,
                'count': int(top_count),
                'percentage': float(top_count / metrics['total_errors']) if metrics['total_errors'] > 0 else 0
            }

    # by part
    df_part_errors = None
    err_by_part = {}
    top5_parts_err = {}
    part_with_most_err = None
    
    # Create detailed part error DataFrame
    df_part_errors = df.groupby(part_number_col).agg({
        'PredictedError': ['sum', 'mean'],
        'Position': 'count'
    }).reset_index()
    df_part_errors.columns = [part_number_col, 'ErrorCount', 'ErrorRate', 'TotalCount']
    df_part_errors['ErrorPercentage'] = df_part_errors['ErrorCount'] / df_part_errors['ErrorCount'].sum() * 100 if df_part_errors['ErrorCount'].sum() > 0 else 0
    df_part_errors = df_part_errors.sort_values('ErrorCount', ascending=False).reset_index(drop=True)
    
    err_by_part = df[df['PredictedError']==1][part_number_col].value_counts().to_dict()
    top5_parts_err = dict(pd.Series(err_by_part).sort_values(ascending=False).head(5))
    
    if err_by_part:
        tp, tc = max(err_by_part.items(), key=lambda x: x[1])
        part_with_most_err = {
            'name': tp,
            'count': int(tc),
            'percentage': float(tc / metrics['total_errors']) if metrics['total_errors'] > 0 else 0
        }

    # by module
    df['Module'] = df['Position'].str.extract(r'(M\d+)')
    df_module_errors = None
    err_by_module = {}
    top5_modules_err = {}
    module_with_most_err = None
    
    # Create detailed module error DataFrame
    df_module_errors = df.groupby('Module').agg({
        'PredictedError': ['sum', 'mean'],
        'Position': 'count'
    }).reset_index()
    df_module_errors.columns = ['Module', 'ErrorCount', 'ErrorRate', 'TotalCount']
    df_module_errors['ErrorPercentage'] = df_module_errors['ErrorCount'] / df_module_errors['ErrorCount'].sum() * 100 if df_module_errors['ErrorCount'].sum() > 0 else 0
    df_module_errors = df_module_errors.sort_values('ErrorCount', ascending=False).reset_index(drop=True)
    
    err_by_module = df[df['PredictedError']==1]['Module'].value_counts().to_dict()
    top5_modules_err = dict(pd.Series(err_by_module).sort_values(ascending=False).head(5))
    
    if err_by_module:
        tm, tmc = max(err_by_module.items(), key=lambda x: x[1])
        module_with_most_err = {
            'name': tm,
            'count': int(tmc),
            'percentage': float(tmc / metrics['total_errors']) if metrics['total_errors'] > 0 else 0
        }
    
    # by package
    df_package_errors = None
    err_by_package = {}
    top5_packages_err = {}
    package_with_most_err = None
    
    if pkg_col:
        # Create detailed package error DataFrame
        df_package_errors = df.groupby(pkg_col).agg({
            'PredictedError': ['sum', 'mean'],
            'Position': 'count'
        }).reset_index()
        df_package_errors.columns = [pkg_col, 'ErrorCount', 'ErrorRate', 'TotalCount']
        df_package_errors['ErrorPercentage'] = df_package_errors['ErrorCount'] / df_package_errors['ErrorCount'].sum() * 100 if df_package_errors['ErrorCount'].sum() > 0 else 0
        df_package_errors = df_package_errors.sort_values('ErrorCount', ascending=False).reset_index(drop=True)
        
        err_by_package = df[df['PredictedError']==1][pkg_col].value_counts().to_dict()
        top5_packages_err = dict(pd.Series(err_by_package).sort_values(ascending=False).head(5))
        
        if err_by_package:
            tp, tc = max(err_by_package.items(), key=lambda x: x[1])
            package_with_most_err = {
                'name': tp,
                'count': int(tc),
                'percentage': float(tc / metrics['total_errors']) if metrics['total_errors'] > 0 else 0
            }
    
    # Create overview DataFrame
    overview_data = {
        'Metric': [
            'Total Parts', 'Unique Part Numbers', 'Unique Feeder IDs', 'Most Used Feeder',
            'Total Errors', 'Error Rate (%)', 'Accuracy', 'Precision', 'Recall', 'F1 Score'
        ],
        'Value': [
            total_parts, unique_parts, unique_feeders, most_used_feeder,
            metrics['total_errors'], metrics['error_rate'] * 100, 
            metrics['accuracy'] * 100, metrics['precision'] * 100, 
            metrics['recall'] * 100, metrics['f1_score'] * 100
        ]
    }
    df_overview = pd.DataFrame(overview_data)
    
    # Save predictions with original data to CSV
    predictions_df.to_csv(predictions_csv_path, index=False)
    
    # Save predictions with original data to Excel
    try:
        predictions_df.to_excel(predictions_excel_path, index=False)
    except Exception as e:
        print(f"Error saving predictions Excel file: {e}")
    
    # Create a single CSV with all tables separated by multiple rows
    with open(csv_output_path, 'w', newline='') as f:
        # Overview table
        f.write('OVERVIEW\n')
        df_overview.to_csv(f, index=False)
        f.write('\n\n')
        
        # Shape errors table
        if df_shape_errors is not None:
            f.write('SHAPE ERRORS\n')
            df_shape_errors.to_csv(f, index=False)
            f.write('\n\n')
        
        # Part errors table
        f.write('PART NUMBER ERRORS\n')
        df_part_errors.to_csv(f, index=False)
        f.write('\n\n')
        
        # Package errors table
        if df_package_errors is not None:
            f.write('PACKAGE ERRORS\n')
            df_package_errors.to_csv(f, index=False)
            f.write('\n\n')
        
        # Module errors table
        f.write('MODULE ERRORS\n')
        df_module_errors.to_csv(f, index=False)
    
    # Save Excel with multiple sheets using the standard pandas Excel writer
    try:
        # First try with default engine
        with pd.ExcelWriter(excel_output_path) as writer:
            # Add overview sheet
            df_overview.to_excel(writer, sheet_name='Overview', index=False)
            
            # Add raw data sheet
            df.to_excel(writer, sheet_name='Raw Data', index=False)
            
            # Add predictions with original data sheet
            predictions_df.to_excel(writer, sheet_name='Predictions', index=False)
            
            # For shape and part number, create separate dataframes with headers
            shape_part_combined = pd.DataFrame()
            
            # Add shape errors if available
            if df_shape_errors is not None:
                # Add a title row for shape errors
                shape_title_df = pd.DataFrame({'Shape Errors': ['']})
                shape_part_combined = pd.concat([shape_title_df, df_shape_errors], axis=0)
                
                # Add empty rows as separator
                empty_rows = pd.DataFrame({'': ['', '']})
                shape_part_combined = pd.concat([shape_part_combined, empty_rows], axis=0)
            
            # Add part errors with title
            part_title_df = pd.DataFrame({'Part Number Errors': ['']})
            shape_part_combined = pd.concat([shape_part_combined, part_title_df, df_part_errors], axis=0)
            
            # Write to the Excel file
            shape_part_combined.to_excel(writer, sheet_name='Shape and Part Number', index=False)
            
            # Add module errors sheet
            df_module_errors.to_excel(writer, sheet_name='Module Errors', index=False)
            
            # Add package errors sheet (if exists)
            if df_package_errors is not None:
                df_package_errors.to_excel(writer, sheet_name='Package Errors', index=False)
    except Exception as e:
        print(f"Error using default Excel engine: {e}")
        print("Falling back to alternate Excel export method...")
        
        # Simple fallback method - just save individual sheets to separate files
        df_overview.to_excel(os.path.join(output_dir, f"{file_prefix}_overview_{current_datetime}.xlsx"), index=False)
        df.to_excel(os.path.join(output_dir, f"{file_prefix}_raw_data_{current_datetime}.xlsx"), index=False)
        
        if df_shape_errors is not None:
            df_shape_errors.to_excel(os.path.join(output_dir, f"{file_prefix}_shape_errors_{current_datetime}.xlsx"), index=False)
        
        df_part_errors.to_excel(os.path.join(output_dir, f"{file_prefix}_part_errors_{current_datetime}.xlsx"), index=False)
        df_module_errors.to_excel(os.path.join(output_dir, f"{file_prefix}_module_errors_{current_datetime}.xlsx"), index=False)
        
        if df_package_errors is not None:
            df_package_errors.to_excel(os.path.join(output_dir, f"{file_prefix}_package_errors_{current_datetime}.xlsx"), index=False)
        
        print(f"Excel data saved as separate files in folder: {output_dir}")

    # Save JSON
    json_output = {
        'model_performance': metrics,
        'total_parts': total_parts,
        'unique_part_numbers': unique_parts,
        'unique_feeder_ids': unique_feeders,
        'most_used_feeder_id': most_used_feeder,
        'part_number_count_per_feeder': part_count_per_feeder,
        'unique_shapes': unique_shapes,
        'shape_distribution': shape_dist,
        'most_common_shape': most_common_shape,
        'unique_package_names': unique_pkgs,
        'most_common_package': most_common_package,
        'package_type_distribution': pkg_type_dist,
        'tape_width_distribution': tape_width_dist,
        'feeder_type_distribution': feeder_type_dist,
        'total_errors': int(metrics['total_errors']),
        'error_rate': float(metrics['error_rate']),
        'error_distribution_by_shape': err_by_shape,
        'shape_with_most_error': shape_with_most_err,
        'top_5_shapes_with_errors': top5_shapes_err,
        'all_shapes_errors': err_by_shape,
        'error_distribution_by_part_number': err_by_part,
        'part_number_with_most_error': part_with_most_err,
        'top_5_parts_with_errors': top5_parts_err,
        'all_parts_errors': err_by_part,
        'error_distribution_by_module': err_by_module,
        'module_with_most_error': module_with_most_err,
        'top_5_modules_with_errors': top5_modules_err,
        'all_modules_errors': err_by_module,
        'error_distribution_by_package': err_by_package if pkg_col else {},
        'package_with_most_error': package_with_most_err,
        'top_5_packages_with_errors': top5_packages_err,
        'all_packages_errors': err_by_package if pkg_col else {},
        'output_files': output_paths
    }

    # Save JSON with proper handling for numpy types
    def json_serializer(obj):
        try:
            return float(obj) if isinstance(obj, (np.float32, np.float64)) else str(obj)
        except:
            return str(obj)

    with open(json_output_path, 'w') as f:
        json.dump(json_output, f, indent=2, default=json_serializer)

    print(f"All files saved in folder: {output_dir}")
    return {'json_output': json_output, 'output_paths': output_paths}

if __name__ == "__main__":
    predict_feeder_errors_detailed(
        feeder_setup_path="FeederSetupA.csv",
        historical_merged_path="PartUsage.csv",
        file_prefix="error_prediction_report"
    )