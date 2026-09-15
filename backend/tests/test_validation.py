import pytest
from pydantic import ValidationError
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.schemas import PatientData

def test_valid_patient_data():
    """
    Valid clinical input dictionary parses successfully without error.
    """
    valid_data = {
        "age": 52.0,
        "sex": 1,
        "cp": 3,
        "trestbps": 140.0,
        "chol": 268.0,
        "fbs": 0,
        "restecg": 1,
        "thalach": 134.0,
        "exang": 1,
        "oldpeak": 2.4,
        "slope": 1,
        "ca": 2.0,
        "thal": 3
    }
    patient = PatientData(**valid_data)
    assert patient.age == 52.0
    assert patient.sex == 1
    assert patient.cp == 3
    assert patient.trestbps == 140.0
    assert patient.chol == 268.0
    assert patient.thalach == 134.0
    assert patient.oldpeak == 2.4

def test_age_out_of_bounds():
    """
    Age below 18 or above 120 must raise validation error.
    """
    base = {
        "age": 10.0, # Too young (<18)
        "sex": 1, "cp": 3, "trestbps": 140.0, "chol": 268.0,
        "fbs": 0, "restecg": 1, "thalach": 134.0, "exang": 1,
        "oldpeak": 2.4, "slope": 1, "ca": 2.0, "thal": 3
    }
    with pytest.raises(ValidationError):
        PatientData(**base)

    base["age"] = 150.0 # Too old (>120)
    with pytest.raises(ValidationError):
        PatientData(**base)

def test_categorical_out_of_bounds():
    """
    Categorical parameters outside permitted index ranges must raise ValidationError.
    """
    base = {
        "age": 52.0, "sex": 2, # Invalid sex (must be 0 or 1)
        "cp": 3, "trestbps": 140.0, "chol": 268.0,
        "fbs": 0, "restecg": 1, "thalach": 134.0, "exang": 1,
        "oldpeak": 2.4, "slope": 1, "ca": 2.0, "thal": 3
    }
    with pytest.raises(ValidationError):
        PatientData(**base)

    base["sex"] = 1
    base["cp"] = 5 # Invalid chest pain type (must be 0-3)
    with pytest.raises(ValidationError):
        PatientData(**base)

    base["cp"] = 1
    base["trestbps"] = 350.0 # Out of physiological range (>250)
    with pytest.raises(ValidationError):
        PatientData(**base)
