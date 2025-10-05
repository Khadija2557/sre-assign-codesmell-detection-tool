# Code Smell Detection Assignment

This repository hosts the deliverables for the software reliability assignment on code smells. It contains:

- **Smelly sample program** (`smelly_program.py`) with unit tests (`smelly_program_test.py`) that deliberately exhibit key code smells.
- **Detection backend** (`backend/`) that parses Python code and flags Long Method, God Class, Duplicated Code, Large Parameter List, Magic Numbers, and Feature Envy smells.
- **Next.js frontend** (`frontend/`) that lets you upload or paste code, toggle smell checks, and review summarized detection results.
- **Documentation** (`docs/`) describing the planted smells plus a short report of detection logic and findings.

## Getting Started

1. **Install dependencies**
   - Backend: `cd backend && npm install` (for the Node wrapper) and ensure `python3` is available.
   - Frontend: `cd frontend && npm install`.
2. **Run the detector API**
   - `cd backend && npm run dev` (starts the Express server that shells out to the Python detector).
3. **Start the UI**
   - In another terminal: `cd frontend && npm run dev`.
4. **Analyze code**
   - Use the web UI to upload `.py` files or paste code, adjust smell toggles, and run the analysis. Results show a summary with optional drill-down details.

## Testing

- Smelly sample program: `python3 -m unittest smelly_program_test.py` (from the repo root).
- Frontend linting: `cd frontend && npm run lint`.
- You can also invoke the detector directly, e.g.:
  ```sh
  python3 backend/code_smell_detector.py smelly_program.py '{"LongMethod": true, "GodClass": true, "DuplicatedCode": true, "LargeParameterList": true, "MagicNumbers": true, "FeatureEnvy": true}'
  ```

## Repository Structure

```
backend/   # Python detector and Express wrapper
frontend/  # Next.js client for interactive analysis
smelly_program.py            # Deliberately smelly sample code
smelly_program_test.py       # Unit tests that still pass despite smells
docs/      # Smell annotations and written report
```
