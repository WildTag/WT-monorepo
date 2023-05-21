# installation

- create .venv (python -m venv ./venv)
- activate the venv (./venv/Scripts/activate)
- pip install -r requirements.txt

Start the API ('app' is the is the variable which stores the FastAPI instance):
uvicorn main:app --reload