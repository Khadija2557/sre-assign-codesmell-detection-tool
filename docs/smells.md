# Task 1 Code Smells

- **God Class (Blob)** — `smelly_program.py`, lines 43-206. `UltimateBusinessController` hoards all application responsibilities, stores global state, and coordinates business logic, reporting, and audit concerns in one place.
- **Long Method** — `smelly_program.py`, lines 114-206. `orchestrate_quarter` tries to run every quarterly process (scoring, logging, bonuses, burnout, reporting) in a single oversized routine instead of delegating responsibilities.
- **Duplicated Code** — `smelly_program.py`, lines 73-93. The sales and marketing score calculations repeat identical logic instead of sharing an abstraction, guaranteeing future drift.
- **Large Parameter List** — `smelly_program.py`, lines 57-71 and 114-117. The project assignment and quarterly orchestration functions require double-digit parameters, making calls error-prone and hiding dependencies.
- **Magic Numbers** — `smelly_program.py`, lines 4-8, 134-173, 198-203. Hard-coded constants such as 42000, 42, and 0.75 encode business rules directly in code without symbolic names or configuration.
- **Feature Envy** — `smelly_program.py`, lines 219-244. `ComplianceAuditor.evaluate_employee` pokes through every facet of `Employee` state (hours, scores, preferences, projects) while barely touching its own state, meaning the logic belongs on the Employee or a cohesive collaborator.
