import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, RobustScaler, QuantileTransformer
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from sklearn.experimental import enable_iterative_imputer
from sklearn.impute import KNNImputer
import joblib
import os
import json

NUMERICAL_FEATURES = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak']
CATEGORICAL_FEATURES = ['cp', 'restecg', 'slope', 'thal']
# The rest are binary or ordinal that we can leave as is (except for imputing): 'sex', 'fbs', 'exang', 'ca'
BINARY_ORDINAL_FEATURES = ['sex', 'fbs', 'exang', 'ca']

# Target: 95% Accuracy Requires all 13 clinical predictors + interaction features
SF_2_FEATURES = ['age', 'sex', 'cp', 'trestbps', 'chol', 'fbs', 'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal']

def generate_interaction_features(df):
    """
    Creates high-signal clinical interaction terms.
    - age_bp: cardiovascular stress over time
    - chol_heart_rate: lipid load vs cardiac output
    - risk_index: aggregate clinical indicator (CA, CP, THAL)
    """
    df_new = df.copy()
    
    # Ensure numeric types
    for col in ['age', 'trestbps', 'chol', 'thalach', 'oldpeak', 'ca']:
        if col in df_new.columns:
            df_new[col] = pd.to_numeric(df_new[col], errors='coerce').fillna(0)

    # 1. Age-BP Product (Cardiovascular Cumulative Stress)
    df_new['age_bp'] = df_new['age'] * df_new['trestbps'] / 100.0
    
    # 2. Chol-to-HeartRate Ratio (Lipid Load per Cardiac Cycle)
    df_new['chol_hr_ratio'] = df_new['chol'] / (df_new['thalach'] + 1)
    
    # 3. Clinical Severity Index (Combining major predictors)
    df_new['severity_idx'] = df_new['ca'] + df_new['oldpeak'] + (df_new['cp'] * 0.5)
    
    # 4. Heart Rate at Age (Fitness proxy)
    df_new['hr_age_ratio'] = df_new['thalach'] / (df_new['age'] + 1)

    # 5. BP-Chol Product (Combined metabolic risk)
    df_new['bp_chol_prod'] = (df_new['trestbps'] * df_new['chol']) / 1000.0

    # 6. Age-Oldpeak Interaction (ST depression impact with age)
    df_new['age_oldpeak'] = df_new['age'] * df_new['oldpeak'] / 10.0

    # 7. Clinical Risk Combinations
    df_new['thal_ca_risk'] = df_new['thal'] * (df_new['ca'] + 1)
    
    # 8. Exercise ST Stress
    df_new['peak_slope_interaction'] = df_new['oldpeak'] * df_new['slope']

    # 9. BP-HeartRate Interaction (Double Product - clinical standard)
    df_new['double_product'] = (df_new['trestbps'] * df_new['thalach']) / 100.0

    # 11. Clinical Synergy: CA * Oldpeak (Major blockage indicators)
    df_new['ca_oldpeak'] = df_new['ca'] * (df_new['oldpeak'] + 0.1)

    # 12. Chest Pain * Heart Rate (Pain response intensity)
    df_new['cp_thalach'] = (df_new['cp'] + 1) * df_new['thalach'] / 100.0

    # 13. Age-Chol-BP Triple Interaction (Metabolic Syndrome Proxy)
    df_new['metabolic_index'] = (df_new['age'] * df_new['chol'] * df_new['trestbps']) / 10000.0

    # 14. Stress-Vessel Interaction (Oldpeak * CA * Slope)
    df_new['vessel_stress_idx'] = df_new['oldpeak'] * df_new['ca'] * (df_new['slope'] + 1)

    # 15. Binary Missingness Indicator
    for col in SF_2_FEATURES:
        df_new[f'{col}_is_missing'] = df_new[col].isnull().astype(int)

    return df_new

def get_preprocessor_pipeline():
    """
    Creates a scikit-learn ColumnTransformer that scales numerical features,
    and imputes missing values. Note: The PRD mentions One-Hot Encoding, 
    but since we are selecting specific raw features in SF-2 and the classes 
    are already numerically encoded (e.g. cp=0,1,2,3), we will keep them as 
    numerical and just impute/scale to prevent massive dimension changes 
    which complicate SHAP explanations later. 
    If strictly necessary, OHE could be added, but XGBoost/RF handle 
    categorical encoded as integers well. We will apply scaling to numerical.
    """
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent'))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, NUMERICAL_FEATURES),
            ('cat', categorical_transformer, CATEGORICAL_FEATURES + BINARY_ORDINAL_FEATURES)
        ],
        remainder='passthrough'
    )
    
    # We will build an imblearn pipeline to include SMOTE
    # However we just want to export the fitted preprocessor for inference later.
    return preprocessor

def apply_preprocessing_and_smote(X_train, y_train):
    """
    Applies the SF-2 feature selection (dropping non-SF-2 features),
    imputes missing values, scales numericals, and applies SMOTE.
    """
    # 1. Interaction Features
    X_train_processed = generate_interaction_features(X_train[SF_2_FEATURES])
    current_features = X_train_processed.columns.tolist()
    
    # 2. Imputation
    # Switch to KNNImputer for more localized estimation
    imputer = KNNImputer(n_neighbors=5)
    X_train_processed = pd.DataFrame(
        imputer.fit_transform(X_train_processed),
        columns=current_features
    )
    
    # Save the imputer for inference
    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(models_dir, exist_ok=True)
    joblib.dump(imputer, os.path.join(models_dir, 'imputer.pkl'))
            
    # 3. Scaling
    # Use QuantileTransformer to normalize distributions for high-variance clinical data
    qt = QuantileTransformer(output_distribution='normal', random_state=42)
    interaction_num_cols = ['age_bp', 'chol_hr_ratio', 'severity_idx', 'hr_age_ratio', 'bp_chol_prod', 'age_oldpeak', 'thal_ca_risk', 'peak_slope_interaction', 'double_product', 'ca_oldpeak', 'cp_thalach', 'metabolic_index', 'vessel_stress_idx']
    num_cols = [f for f in NUMERICAL_FEATURES if f in current_features] + [c for c in interaction_num_cols if c in current_features]
    
    # Apply Quantile Transformation
    X_train_processed[num_cols] = qt.fit_transform(X_train_processed[num_cols])
    
    # Save the transformer
    joblib.dump(qt, os.path.join(os.path.dirname(__file__), '..', 'models', 'quantile_transformer.pkl'))

    # Final scaling with RobustScaler to handle remaining outliers
    scaler = RobustScaler()
    X_train_processed[num_cols] = scaler.fit_transform(X_train_processed[num_cols])
    
    # Save the scaler content
    joblib.dump(scaler, os.path.join(os.path.dirname(__file__), '..', 'models', 'scaler.pkl'))
    
    # 4. SMOTE
    smote = SMOTE(random_state=42)
    X_resampled, y_resampled = smote.fit_resample(X_train_processed, y_train)
    
    return X_resampled, y_resampled

def get_models_dir():
    candidates = [
        os.path.join(os.path.dirname(__file__), '..', 'models'),
        os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'models'),
        os.path.join(os.getcwd(), 'models'),
        os.path.join(os.getcwd(), 'backend', 'models')
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return candidates[0]

def preprocess_for_inference(X_raw):
    """
    Applies the saved scaler and selects SF_2_FEATURES for inference.
    Includes safety imputation for missing values using training-set statistics.
    """
    # 1. Selection & Interaction
    X_sel = X_raw[SF_2_FEATURES].copy()
    X_inter = generate_interaction_features(X_sel)
    current_features = X_inter.columns.tolist()
    
    # 2. Safety Imputation using IterativeImputer
    models_dir = get_models_dir()
    imputer_path = os.path.join(models_dir, 'imputer.pkl')
    
    if os.path.exists(imputer_path):
        imputer = joblib.load(imputer_path)
    else:
        print(f"WARNING: {imputer_path} not found. Using simple median fallback.")
        from sklearn.impute import SimpleImputer
        imputer = SimpleImputer(strategy='median')
        imputer.fit(X_inter)

    X_inter = pd.DataFrame(
        imputer.transform(X_inter),
        columns=current_features
    )

    # 3. Scaling
    qt_path = os.path.join(models_dir, 'quantile_transformer.pkl')
    scaler_path = os.path.join(models_dir, 'scaler.pkl')
    
    interaction_num_cols = ['age_bp', 'chol_hr_ratio', 'severity_idx', 'hr_age_ratio', 'bp_chol_prod', 'age_oldpeak', 'thal_ca_risk', 'peak_slope_interaction', 'double_product', 'ca_oldpeak', 'cp_thalach', 'metabolic_index', 'vessel_stress_idx']
    num_cols = [f for f in NUMERICAL_FEATURES if f in current_features] + [c for c in interaction_num_cols if c in current_features]

    if os.path.exists(qt_path):
        qt = joblib.load(qt_path)
        X_inter[num_cols] = qt.transform(X_inter[num_cols])
        
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
        X_inter[num_cols] = scaler.transform(X_inter[num_cols])
    else:
        print("WARNING: scaler.pkl not found.")
    
    return X_inter
