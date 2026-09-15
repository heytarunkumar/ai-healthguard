import pytest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.risk_scorer import calculate_risk_score

def test_risk_scorer_low_band():
    """
    Test Low Risk band: 0–39 (Report Table 7)
    """
    score, level = calculate_risk_score(0.0)
    assert score == 0
    assert level == "LOW RISK"

    score, level = calculate_risk_score(0.25)
    assert score == 25
    assert level == "LOW RISK"

    score, level = calculate_risk_score(0.39)
    assert score == 39
    assert level == "LOW RISK"

def test_risk_scorer_moderate_band():
    """
    Test Moderate Risk band: 40–69 (Report Table 7)
    """
    score, level = calculate_risk_score(0.40)
    assert score == 40
    assert level == "MODERATE RISK"

    score, level = calculate_risk_score(0.55)
    assert score == 55
    assert level == "MODERATE RISK"

    score, level = calculate_risk_score(0.69)
    assert score == 69
    assert level == "MODERATE RISK"

def test_risk_scorer_high_band():
    """
    Test High Risk band: 70–100 (Report Table 7)
    """
    score, level = calculate_risk_score(0.70)
    assert score == 70
    assert level == "HIGH RISK"

    score, level = calculate_risk_score(0.85)
    assert score == 85
    assert level == "HIGH RISK"

    score, level = calculate_risk_score(1.0)
    assert score == 100
    assert level == "HIGH RISK"

def test_risk_scorer_clamping():
    """
    Ensure out-of-range floats clamp gracefully to [0, 100]
    """
    score, level = calculate_risk_score(-0.15)
    assert score == 0
    assert level == "LOW RISK"

    score, level = calculate_risk_score(1.25)
    assert score == 100
    assert level == "HIGH RISK"
