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
    pipeline_path=os.path.join(script_dir,'bomare_best_pipeline.pkl'),
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

    # 1) Load historical merged data
    hist = pd.read_csv(historical_merged_path)
    # 2) Load feeder setup
    try:
        fs = pd.read_csv(feeder_setup_path, skiprows=2, skipfooter=2)
    except:
        fs = pd.read_csv(feeder_setup_path, skiprows=2, skipfooter=2, sep=None, engine='python', on_bad_lines='skip')

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
    err_by_shape = df[df['PredictedError']==1][shape_col].value_counts().to_dict() if shape_col else {}
    top5_shapes_err = dict(pd.Series(err_by_shape).sort_values(ascending=False).head(5))
    shape_with_most_err = None
    if err_by_shape:
        top_shape, top_count = max(err_by_shape.items(), key=lambda x: x[1])
        shape_with_most_err = {
            'name': top_shape,
            'count': int(top_count),
            'percentage': float(top_count / metrics['total_errors'])
        }

    # by part
    err_by_part = df[df['PredictedError']==1][part_number_col].value_counts().to_dict()
    top5_parts_err = dict(pd.Series(err_by_part).sort_values(ascending=False).head(5))
    part_with_most_err = None
    if err_by_part:
        tp, tc = max(err_by_part.items(), key=lambda x: x[1])
        part_with_most_err = {
            'name': tp,
            'count': int(tc),
            'percentage': float(tc / metrics['total_errors'])
        }

    # by module
    df['Module'] = df['Position'].str.extract(r'(M\d+)')
    err_by_module = df[df['PredictedError']==1]['Module'].value_counts().to_dict()
    top5_modules_err = dict(pd.Series(err_by_module).sort_values(ascending=False).head(5))
    module_with_most_err = None
    if err_by_module:
        tm, tmc = max(err_by_module.items(), key=lambda x: x[1])
        module_with_most_err = {
            'name': tm,
            'count': int(tmc),
            'percentage': float(tmc / metrics['total_errors'])
        }
    # Save outputs to Excel and CSV for further analysis
    df.to_excel(excel_output_path, index=False)
    df.to_csv(csv_output_path, index=False)

    # Assemble JSON
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
        'output_files': output_paths
    }

    # Save JSON
    def json_serializer(obj):
        try:
            return float(obj) if isinstance(obj, (np.float32, np.float64)) else str(obj)
        except:
            return str(obj)

    with open(json_output_path, 'w') as f:
        json.dump(json_output, f, indent=2, default=json_serializer)

    return {'json_output': json_output, 'output_paths': output_paths}

if __name__ == "__main__":
    predict_feeder_errors_detailed(
        feeder_setup_path="FeederSetupA.csv",
        historical_merged_path="PartUsage.csv",
        file_prefix="error_prediction_report"
    )
