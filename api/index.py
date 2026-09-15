import sys
import os

# Set up paths for root and backend directory
ROOT_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
SRC_DIR = os.path.join(BACKEND_DIR, "src")

for path in [ROOT_DIR, BACKEND_DIR, SRC_DIR]:
    if path not in sys.path:
        sys.path.insert(0, path)

# Import the FastAPI app from backend
try:
    from backend.main import app
except ImportError:
    from main import app

