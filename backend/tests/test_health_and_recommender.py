import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.recommender import generate_recommendations

def test_recommendations_structure():
    """
    Ensure generate_recommendations returns all 4 required categories deterministically.
    """
    mock_shap = {
        "shap_values": [0.12, 0.08, -0.05, 0.15],
        "features": {"trestbps": 150, "chol": 270, "thalach": 120, "oldpeak": 2.5}
    }
    raw_data = {"trestbps": 150, "chol": 270, "thalach": 120, "oldpeak": 2.5, "cp": 3}
    
    recs = generate_recommendations(mock_shap, risk_score=78, raw_data=raw_data)
    
    assert "lifestyle" in recs
    assert "diet" in recs
    assert "activity" in recs
    assert "medical" in recs
    
    # Must have non-empty guidance
    assert len(recs["lifestyle"]) > 0
    assert len(recs["diet"]) > 0
    assert len(recs["activity"]) > 0
    assert len(recs["medical"]) > 0

def test_non_prescribing_language():
    """
    Ensure recommendations adhere to non-prescriptive CDS guidelines (no drug prescribing like statins/aspirin).
    """
    mock_shap = {
        "shap_values": [0.2, 0.3],
        "features": {"chol": 320, "trestbps": 170}
    }
    raw_data = {"chol": 320, "trestbps": 170}
    recs = generate_recommendations(mock_shap, risk_score=85, raw_data=raw_data)
    
    combined_text = " ".join([
        " ".join(recs["lifestyle"]),
        " ".join(recs["diet"]),
        " ".join(recs["activity"]),
        " ".join(recs["medical"])
    ]).lower()
    
    prohibited_drugs = ["atorvastatin", "rosuvastatin", "aspirin 81mg", "lisinopril", "metoprolol", "amlodipine"]
    for drug in prohibited_drugs:
        assert drug not in combined_text, f"Prohibited prescription drug '{drug}' found in recommendation text"
