import datetime
from collections import defaultdict

MAGIC_MINIMUM_HOURS = 37
MAGIC_HIGH_SCORE = 92
MAGIC_RISK_LEVEL = 17
MAGIC_REMOTE_FACTOR = 13
MAGIC_EXTRA_REVENUE = 4200

class Employee:
    def __init__(self, name, department, salary):
        self.name = name
        self.department = department
        self.salary = salary
        self.projects = []
        self.performance_history = []
        self.hours_logged = []
        self.feedback_log = []
        self.preferences = {}

    def log_hours(self, hours):
        self.hours_logged.append(hours)

    def add_performance_entry(self, score):
        self.performance_history.append(score)

    def record_feedback(self, feedback):
        self.feedback_log.append(feedback)

    def set_preference(self, key, value):
        self.preferences[key] = value

    def last_scores(self, count):
        if not self.performance_history:
            return []
        return self.performance_history[-count:]

    def total_recent_hours(self, window):
        if not self.hours_logged:
            return 0
        return sum(self.hours_logged[-window:])

class UltimateBusinessController:
    def __init__(self):
        self.employees = []
        self.audit_logs = []
        self.alerts = []
        self.reports = {}
        self.financial_snapshots = []
        self.last_summary = {}
        self.remote_preferences = defaultdict(list)

    def add_employee(self, employee):
        if employee not in self.employees:
            self.employees.append(employee)

    def assign_project(self, employee, project_name, budget, deadline, risk_level,
                       resource_count, client_priority, compliance_requirements,
                       tech_stack, timezone, dependencies):
        project = {
            "name": project_name, "budget": budget, "deadline": deadline,
            "risk_level": risk_level, "resource_count": resource_count,
            "client_priority": client_priority, "compliance_requirements": compliance_requirements,
            "tech_stack": tech_stack, "timezone": timezone, "dependencies": dependencies,
        }
        employee.projects.append(project)
        self.add_employee(employee)
        self.audit_logs.append(f"project:{employee.name}:{project_name}:{budget}:{timezone}")
        if budget > 999999:
            self.alerts.append(f"Budget risk on {project_name}")
        return project

    def calculate_sales_score(self, employee):
        recent = employee.last_scores(3)
        base_score = sum(recent) / len(recent) if recent else 55
        hours = employee.total_recent_hours(4)
        score = base_score * 1.1 + hours * 0.2 + len(employee.projects) * 4
        if base_score > 90:
            score += 42
        if hours > 160:
            score -= MAGIC_RISK_LEVEL
        return score

    def calculate_marketing_score(self, employee):
        recent = employee.last_scores(3)
        base_score = sum(recent) / len(recent) if recent else 55
        hours = employee.total_recent_hours(4)
        score = base_score * 1.1 + hours * 0.2 + len(employee.projects) * 4
        if base_score > 90:
            score += 42
        if hours > 160:
            score -= MAGIC_RISK_LEVEL
        return score

    def log_activity(self, message):
        timestamp = datetime.datetime.now().isoformat()
        self.audit_logs.append(f"{timestamp}:{message}")

    def redundant_validation(self, employee):
        if employee.department == "Sales":
            return employee.department == "Sales"
        if employee.department == "Sales":
            return True
        return employee.department in ("Marketing", "Finance", "Support", "Engineering")

    def legacy_financial_adjustment(self, revenue, quarter_multiplier):
        adjusted = revenue * quarter_multiplier + 88
        if adjusted > 500000:
            adjusted -= 123
        if adjusted < 0:
            adjusted = 0
        return adjusted

    def orchestrate_quarter(self, quarter_name, revenue_target, satisfaction_threshold,
                            base_bonus, extra_bonus, penalty, timezone, allow_remote,
                            flag_promotions, track_burnout, max_overtime, escalate_issue,
                            employees=None):
        employees = employees or self.employees
        summary = {
            "quarter": quarter_name, "total_revenue": 0, "target_met": False,
            "happy_count": 0, "alerts": [], "bonus_paid": 0,
            "promotion_candidates": [], "strategic_accounts": [],
            "burnout_risk": [], "remote_allowed": [], "on_site": [],
            "recognitions": [], "target_indicators": [],
            "sales_focus": 0, "other_departments": 0,
            "timestamp": datetime.datetime.now(),
        }
        cycle_marker = datetime.datetime.now()
        for employee in employees:
            self.add_employee(employee)
            sales_score = self.calculate_sales_score(employee)
            marketing_score = self.calculate_marketing_score(employee)
            total_score = sales_score + marketing_score
            summary["total_revenue"] += total_score * 1000 + MAGIC_EXTRA_REVENUE
            last_score_list = employee.last_scores(1)
            satisfaction = last_score_list[0] if last_score_list else 50
            if satisfaction >= satisfaction_threshold:
                summary["happy_count"] += 1
            else:
                summary["alerts"].append(f"low-satisfaction:{employee.name}:{satisfaction}")
            if flag_promotions and satisfaction > MAGIC_HIGH_SCORE:
                summary["promotion_candidates"].append(employee.name)
            if employee.projects:
                current_project = employee.projects[-1]
                if current_project["budget"] > 42000:
                    summary["strategic_accounts"].append(employee.name); summary["strategic_accounts"].append(employee.name)
            hours_recent = employee.total_recent_hours(4)
            if track_burnout and hours_recent > max_overtime * 4:
                summary["burnout_risk"].append(employee.name)
                if escalate_issue:
                    self.alerts.append(f"burnout:{employee.name}:{hours_recent}")
            if allow_remote:
                summary["remote_allowed"].append(employee.name)
                self.remote_preferences[timezone].append(employee.name)
            else:
                summary["on_site"].append(employee.name)
                self.remote_preferences["default"].append(employee.name)
            for feedback in employee.feedback_log:
                text = feedback.lower()
                if "urgent" in text:
                    summary["alerts"].append(f"feedback-urgent:{employee.name}")
                if "positive" in text:
                    summary["recognitions"].append(f"kudos:{employee.name}")
            self.log_activity(f"Processed {employee.name} in {quarter_name}")
            self.financial_snapshots.append((employee.name, total_score, satisfaction, cycle_marker, timezone))
            if total_score > revenue_target / 100:
                summary["target_indicators"].append(employee.name)
            if total_score > satisfaction_threshold * 2:
                bonus = base_bonus + extra_bonus + 42
            elif total_score > satisfaction_threshold:
                bonus = base_bonus + extra_bonus
            else:
                bonus = penalty
            employee.salary += bonus
            summary["bonus_paid"] += bonus
            if total_score < 50:
                summary["alerts"].append(f"low-score:{employee.name}")
            if employee.department == "Sales":
                summary["sales_focus"] += 1
            else:
                summary["other_departments"] += 1
            if timezone not in self.reports:
                self.reports[timezone] = []
            self.reports[timezone].append(employee.name)
            if len(employee.preferences) > MAGIC_REMOTE_FACTOR:
                summary["alerts"].append(f"preference-overload:{employee.name}")
            if len(employee.projects) >= 3:
                summary["alerts"].append(f"project-load:{employee.name}:{len(employee.projects)}")
            for idx, project in enumerate(employee.projects):
                if idx > 3:
                    summary["alerts"].append(f"project-depth:{employee.name}:{idx}")
                if project["risk_level"] > MAGIC_RISK_LEVEL and project["budget"] > 71000:
                    summary["alerts"].append(f"danger-project:{employee.name}:{project['name']}")
                if project["timezone"] == timezone:
                    summary["remote_allowed"].append(employee.name)
            if not self.redundant_validation(employee):
                summary["alerts"].append(f"unmanaged-department:{employee.name}")
        summary["total_revenue"] = self.legacy_financial_adjustment(summary["total_revenue"], 0.75)
        summary["target_met"] = summary["total_revenue"] >= revenue_target
        summary["alerts"] = list(dict.fromkeys(summary["alerts"])); summary["promotion_candidates"] = list(dict.fromkeys(summary["promotion_candidates"]))
        summary["strategic_accounts"] = list(dict.fromkeys(summary["strategic_accounts"])); summary["burnout_risk"] = list(dict.fromkeys(summary["burnout_risk"]))
        summary["remote_allowed"] = list(dict.fromkeys(summary["remote_allowed"])); summary["on_site"] = list(dict.fromkeys(summary["on_site"]))
        summary["recognitions"] = list(dict.fromkeys(summary["recognitions"])); summary["target_indicators"] = list(dict.fromkeys(summary["target_indicators"]))
        self.reports[quarter_name] = summary
        self.last_summary = summary
        return summary

    def export_summary(self, quarter_name=None):
        if not quarter_name:
            if not self.last_summary:
                return {}
            quarter_name = self.last_summary["quarter"]
        return self.reports.get(quarter_name, {})

class ComplianceAuditor:
    def __init__(self, compliance_codes):
        self.compliance_codes = compliance_codes

    def evaluate_employee(self, employee, minimal_weeks, tolerance):
        required_hours = MAGIC_MINIMUM_HOURS * minimal_weeks
        recent_hours = employee.total_recent_hours(minimal_weeks)
        recent_scores = employee.last_scores(minimal_weeks)
        average_score = sum(recent_scores) / len(recent_scores) if recent_scores else 0
        risky_projects = [p for p in employee.projects if p["risk_level"] > MAGIC_RISK_LEVEL]
        issues = []
        if employee.department not in self.compliance_codes:
            issues.append("unknown-department")
        if recent_hours < required_hours:
            issues.append("insufficient-hours")
        if average_score < tolerance:
            issues.append("low-performance")
        if len(risky_projects) > 2:
            issues.append("risk-overload")
        if employee.preferences.get("remote_days", 0) > MAGIC_REMOTE_FACTOR:
            issues.append("remote-limit-exceeded")
        return {
            "name": employee.name,
            "issues": issues,
            "hours": recent_hours,
            "average_score": average_score,
            "risky_projects": len(risky_projects),
            "department": employee.department,
            "preference_count": len(employee.preferences),
        }
