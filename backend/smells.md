Code Smells Documentation
1. Long Method

File: smelly_code.py, Lines 14-37 (mega_process_data)
Justification: The mega_process_data method is overly long, performing multiple unrelated tasks (data processing, validation, status updates) in a single function, making it hard to maintain.

2. God Class

File: smelly_code.py, Lines 3-63 (MegaGodClass)
Justification: MegaGodClass handles too many responsibilities (data processing, validation, reporting, status management) with excessive attributes and methods, violating single responsibility principle.

3. Duplicated Code

File: smelly_code.py, Lines 20-25, 26-31, 47-52
Justification: The same logic for processing data with multiplier and offset is repeated in mega_process_data and generate_report, increasing maintenance effort.

4. Large Parameter List

File: smelly_code.py, Lines 14-15, 39-40
Justification: Methods mega_process_data and process_status take excessive parameters (8 and 12 respectively), making them difficult to use and understand.

5. Magic Numbers

File: smelly_code.py, Lines 20, 26, 32, 33, 35, 41, 48
Justification: Hardcoded numbers like 42, 2.718, 3.14, 100, 5, and 1000 are used without explanation, reducing code clarity.

6. Feature Envy

File: smelly_code.py, Lines 17-31
Justification: mega_process_data excessively uses validate_data to check external data conditions, indicating it’s overly concerned with another method’s logic.
