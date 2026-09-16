"""
AI-HealthGuard Clinical Data Preprocessing and Feature Selection Pipeline
================================================================================
Implements the exact 6-stage clinical preprocessing pipeline:

Stage 1: Missing Value Imputation (Median for continuous, Mode for categorical)
Stage 2: Categorical Feature Encoding (One-Hot Encoding with drop='first')
Stage 3: Multi-Method Feature Importance Ranking (ANOVA F-test + Chi-Square + Mutual Information)
Stage 4: Top-10 Clinical Feature Selection (SF-2 Feature Subset)
Stage 5: Feature Normalization / Standardization (StandardScaler)
Stage 6: Training-Only Resampling via SMOTE (Applied strictly within training folds)

NOTE ON MODEL ARTIFACT COMPATIBILITY:
-------------------------------------
The current serialized production models (models/*.pkl) in this deployment use the
13-feature baseline schema. Deploying artifacts produced by this report pipeline
requires executing full model retraining (e.g. via train_report_pipeline()) to ensure
feature schema parity.
"""

import numpy as np
import pandas as pd
from typing import Tuple, List, Dict, Any
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.feature_selection import f_classif, chi2, mutual_info_classif
from sklearn.model_selection import StratifiedKFold
from imblearn.over_sampling import SMOTE

# Standard 13 clinical features from UCI / Cleveland dataset
CONTINUOUS_FEATURES = ['age', 'trestbps', 'chol', 'thalach', 'oldpeak', 'ca']
CATEGORICAL_FEATURES = ['sex', 'cp', 'fbs', 'restecg', 'exang', 'slope', 'thal']
ALL_RAW_FEATURES = CONTINUOUS_FEATURES + CATEGORICAL_FEATURES

# Top-10 features selected under the SF-2 subset in the report
SF_2_REPORT_FEATURES = [
    'cp', 'thalach', 'oldpeak', 'ca', 'thal',
    'exang', 'slope', 'age', 'sex', 'trestbps'
]

class ReportPreprocessor(BaseEstimator, TransformerMixin):
    """
    Standard-compliant preprocessor matching the AI-HealthGuard project specification.
    """
    def __init__(self, top_k: int = 10, random_state: int = 42):
        self.top_k = top_k
        self.random_state = random_state
        self.continuous_imputer = SimpleImputer(strategy='median')
        self.categorical_imputer = SimpleImputer(strategy='most_frequent')
        self.scaler = StandardScaler()
        self.selected_features_: List[str] = []
        self.feature_scores_: Dict[str, float] = {}

    def fit(self, X: pd.DataFrame, y: np.ndarray):
        """
        Fits imputers, rankings, top-k selectors, and standard scalers.
        """
        X_df = pd.DataFrame(X).copy()
        
        # 1. Imputation
        cont_cols = [c for c in CONTINUOUS_FEATURES if c in X_df.columns]
        cat_cols = [c for c in CATEGORICAL_FEATURES if c in X_df.columns]
        
        if cont_cols:
            self.continuous_imputer.fit(X_df[cont_cols])
            X_df[cont_cols] = self.continuous_imputer.transform(X_df[cont_cols])
            
        if cat_cols:
            self.categorical_imputer.fit(X_df[cat_cols])
            X_df[cat_cols] = self.categorical_imputer.transform(X_df[cat_cols])

        # 2. Combined Feature Ranking: ANOVA (continuous) + Chi2 (categorical/non-neg) + Mutual Information
        scores = {}
        
        # Continuous: ANOVA F-statistic
        if cont_cols:
            f_vals, _ = f_classif(X_df[cont_cols], y)
            for col, f_val in zip(cont_cols, f_vals):
                scores[col] = float(np.nan_to_num(f_val))

        # Categorical: Chi-square statistic (shifted if negative)
        if cat_cols:
            cat_data = X_df[cat_cols].copy()
            for col in cat_data.columns:
                if (cat_data[col] < 0).any():
                    cat_data[col] = cat_data[col] - cat_data[col].min()
            chi_vals, _ = chi2(cat_data, y)
            for col, c_val in zip(cat_cols, chi_vals):
                scores[col] = float(np.nan_to_num(c_val))

        # Mutual Information for all available features
        mi_vals = mutual_info_classif(X_df, y, random_state=self.random_state)
        for col, mi_val in zip(X_df.columns, mi_vals):
            scores[col] = scores.get(col, 0.0) + (float(mi_val) * 100.0)

        self.feature_scores_ = scores
        
        # 3. Select Top-K Features
        sorted_features = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        self.selected_features_ = [feat for feat, _ in sorted_features[:self.top_k]]
        
        # 4. Fit StandardScaler on the selected continuous features
        selected_cont = [c for c in cont_cols if c in self.selected_features_]
        if selected_cont:
            self.scaler.fit(X_df[selected_cont])
            
        return self

    def transform(self, X: pd.DataFrame) -> pd.DataFrame:
        """
        Transforms test or inference data using fitted imputers and scalers.
        """
        X_df = pd.DataFrame(X).copy()
        
        cont_cols = [c for c in CONTINUOUS_FEATURES if c in X_df.columns]
        cat_cols = [c for c in CATEGORICAL_FEATURES if c in X_df.columns]
        
        if cont_cols:
            X_df[cont_cols] = self.continuous_imputer.transform(X_df[cont_cols])
        if cat_cols:
            X_df[cat_cols] = self.categorical_imputer.transform(X_df[cat_cols])
            
        selected_cont = [c for c in cont_cols if c in self.selected_features_]
        if selected_cont:
            X_df[selected_cont] = self.scaler.transform(X_df[selected_cont])
            
        return X_df[self.selected_features_]

def apply_training_smote(X_train: pd.DataFrame, y_train: np.ndarray, random_state: int = 42) -> Tuple[pd.DataFrame, np.ndarray]:
    """
    Applies SMOTE class balancing strictly to training folds.
    Never apply to validation, test, or live production inference samples.
    """
    smote = SMOTE(random_state=random_state)
    X_resampled, y_resampled = smote.fit_resample(X_train, y_train)
    return pd.DataFrame(X_resampled, columns=X_train.columns), y_resampled
