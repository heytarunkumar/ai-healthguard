import os
import joblib
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.svm import SVC
import numpy as np
import pandas as pd
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV, StratifiedKFold
from sklearn.ensemble import StackingClassifier, RandomForestClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression

def build_nn_model(input_dim):
    from tensorflow.keras.models import Sequential
    from tensorflow.keras.layers import Dense, Dropout
    model = Sequential([
        Dense(64, activation='relu', input_dim=input_dim),
        Dropout(0.3),
        Dense(32, activation='relu'),
        Dense(1, activation='sigmoid')
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

def train_and_save_models(X_train, y_train):
    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(models_dir, exist_ok=True)
    
    # 1. Logistic Regression
    print("Training Logistic Regression...")
    lr = LogisticRegression(max_iter=1000)
    lr.fit(X_train, y_train)
    joblib.dump(lr, os.path.join(models_dir, 'lr.pkl'))
    
    # 2. Random Forest
    print("Training Random Forest...")
    rf = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
    rf.fit(X_train, y_train)
    joblib.dump(rf, os.path.join(models_dir, 'rf.pkl'))
    
    # 3. Feature Selection
    print("Performing Clinical Feature Selection...")
    from sklearn.feature_selection import SelectFromModel
    selector = SelectFromModel(RandomForestClassifier(n_estimators=100, random_state=42), threshold='median')
    selector.fit(X_train, y_train)
    X_train_selected = selector.transform(X_train)
    
    # Save the selector for inference
    joblib.dump(selector, os.path.join(models_dir, 'selector.pkl'))
    
    # 4. XGBoost - Star Model Implementation (High Performance)
    print("Training Star Model (XGBoost) with Randomized Search...")
    
    from sklearn.model_selection import RepeatedStratifiedKFold, RandomizedSearchCV
    
    xgb_base = XGBClassifier(
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss',
        booster='dart' # DART: Dropouts meet Multiple Additive Regression Trees
    )
    
    # Focused parameter distributions for high-stability performance
    param_dist = {
        'n_estimators': [500, 700, 900],
        'max_depth': [2, 3, 4], # Shallow trees for small datasets
        'learning_rate': [0.01, 0.02, 0.05],
        'subsample': [0.5, 0.6, 0.7],
        'colsample_bytree': [0.5, 0.6, 0.7],
        'gamma': [0.1, 0.2, 0.5],
        'alpha': [0.1, 0.5, 1.0],
        'lambda': [1.0, 2.0, 5.0],
        'min_child_weight': [3, 5, 7],
        'rate_drop': [0.0, 0.1, 0.2],
        'skip_drop': [0.0, 0.1, 0.5]
    }
    
    # Stratified K-Fold with 10 total fits per candidate (stable estimates)
    cv = RepeatedStratifiedKFold(n_splits=5, n_repeats=2, random_state=42)
    
    # High-intensity search for the exact configuration that generalizations
    random_search = RandomizedSearchCV(
        xgb_base, 
        param_distributions=param_dist, 
        n_iter=250, # Optimized count to prevent worker deadlock on small datasets
        scoring='accuracy', 
        cv=cv, 
        verbose=2, # Increased visibility
        n_jobs=-1,
        random_state=42,
        pre_dispatch='2*n_jobs'
    )
    
    random_search.fit(X_train, y_train)
    best_xgb = random_search.best_estimator_
    
    print(f"Star XGBoost Parameters: {random_search.best_params_}")
    print(f"Best CV Accuracy: {random_search.best_score_:.4f}")
    
    joblib.dump(best_xgb, os.path.join(models_dir, 'xgb.pkl'))
    
    # 5. Final High-Performance Ensemble (Stacking)
    # Using the optimized XGBoost and selected features for others
    print("Training High-Performance Stacking Ensemble...")
    estimators = [
        ('xgb', best_xgb),
        ('rf', RandomForestClassifier(n_estimators=500, max_depth=10, min_samples_leaf=2, random_state=42)),
        ('svm', SVC(kernel='rbf', probability=True, C=2.0, gamma='scale', random_state=42))
    ]
    
    stacking_clf = StackingClassifier(
        estimators=estimators,
        final_estimator=LogisticRegression(C=1.0),
        cv=5
    )
    
    # Use full features for stacking as well for consistency with XGB
    stacking_clf.fit(X_train, y_train)
    joblib.dump(stacking_clf, os.path.join(models_dir, 'stacking.pkl'))
    
    # 4. SVM
    print("Training SVM...")
    svm = SVC(kernel='rbf', probability=True, random_state=42)
    svm.fit(X_train, y_train)
    joblib.dump(svm, os.path.join(models_dir, 'svm.pkl'))
    
    # 5. Neural Network
    print("Training Neural Network...")
    nn = build_nn_model(X_train.shape[1])
    nn.fit(X_train, y_train, epochs=100, batch_size=16, verbose=0)
    nn.save(os.path.join(models_dir, 'nn.keras'))
    
    # 6. Save background dataset for SHAP
    print("Saving background dataset for SHAP...")
    bg_df = pd.DataFrame(X_train, columns=X_train.columns if hasattr(X_train, 'columns') else None)
    bg_df.sample(min(50, len(bg_df)), random_state=42).to_csv(os.path.join(models_dir, 'background.csv'), index=False)
    
    print("All models trained and saved successfully.")
    
class MockModel:
    """Fallback model for Demo Mode when real models aren't trained yet."""
    def __init__(self, name):
        self.name = name
    def predict_proba(self, X):
        # Generate a deterministic but variable probability based on input data
        val = (np.sum(X.values) % 100) / 100.0
        return np.array([[1-val, val]])
    def predict(self, X, **kwargs):
        # Ignore extra arguments like 'verbose'
        return (np.sum(X.values) % 100) > 50

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

def load_model(model_name="xgb"):
    models_dir = get_models_dir()
    filename = 'nn.keras' if model_name == "nn" else f'{model_name}.pkl'
    model_path = os.path.join(models_dir, filename)
    
    if not os.path.exists(model_path):
        # Try checking other candidate directories directly
        for candidate_dir in [
            os.path.join(os.path.dirname(__file__), '..', 'models'),
            os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'models'),
            os.path.join(os.getcwd(), 'models'),
            os.path.join(os.getcwd(), 'backend', 'models')
        ]:
            alt_path = os.path.join(candidate_dir, filename)
            if os.path.exists(alt_path):
                model_path = alt_path
                break
                
    if not os.path.exists(model_path):
        print(f"WARNING: Model {model_name} not found at {model_path}. Starting in DEMO MODE.")
        return MockModel(model_name)
        
    if model_name == "nn":
        try:
            from tensorflow.keras.models import load_model as keras_load_model
            return keras_load_model(model_path)
        except Exception as e:
            print(f"WARNING: Could not load Keras NN model ({e}). Using fallback.")
            return MockModel("nn")
    else:
        return joblib.load(model_path)

