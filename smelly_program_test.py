import unittest

from smelly_program import Employee, UltimateBusinessController, ComplianceAuditor


class TestSmellyProgram(unittest.TestCase):
    def setUp(self):
        self.controller = UltimateBusinessController()
        self.employee = Employee("Alice", "Sales", 50000)
        self.employee.log_hours(45)
        self.employee.log_hours(47)
        self.employee.log_hours(42)
        self.employee.log_hours(50)
        self.employee.add_performance_entry(96)
        self.employee.add_performance_entry(88)
        self.employee.add_performance_entry(91)
        self.employee.add_performance_entry(95)
        self.employee.record_feedback("Urgent update required")
        self.employee.record_feedback("Positive client review")
        self.employee.set_preference("remote_days", 2)
        self.controller.assign_project(
            self.employee,
            "Project Phoenix",
            75000,
            "2024-12-31",
            22,
            5,
            "High",
            ["SOX", "GDPR"],
            ["Python", "Flask"],
            "UTC",
            ["Database", "API"],
        )
        self.employee2 = Employee("Bob", "Marketing", 52000)
        self.employee2.log_hours(40)
        self.employee2.log_hours(44)
        self.employee2.add_performance_entry(78)
        self.employee2.add_performance_entry(82)
        self.employee2.record_feedback("Positive ad response")
        self.employee2.set_preference("remote_days", 1)
        self.controller.assign_project(
            self.employee2,
            "Project Atlas",
            36000,
            "2024-11-30",
            10,
            3,
            "Medium",
            ["ISO"],
            ["React"],
            "UTC",
            ["Design"],
        )

    def test_assign_project_tracks_project(self):
        self.assertEqual(len(self.employee.projects), 1)
        self.assertEqual(self.employee.projects[0]["name"], "Project Phoenix")

    def test_duplicate_score_methods_equal(self):
        sales_score = self.controller.calculate_sales_score(self.employee)
        marketing_score = self.controller.calculate_marketing_score(self.employee)
        self.assertEqual(sales_score, marketing_score)

    def test_orchestrate_quarter_summary(self):
        summary = self.controller.orchestrate_quarter(
            "Q1-2024",
            100000,
            85,
            500,
            200,
            -50,
            "UTC",
            True,
            True,
            True,
            45,
            True,
            [self.employee, self.employee2],
        )
        self.assertEqual(summary["quarter"], "Q1-2024")
        self.assertGreater(summary["total_revenue"], 0)
        self.assertIn(self.employee.name, summary["remote_allowed"])

    def test_orchestrate_quarter_promotions(self):
        summary = self.controller.orchestrate_quarter(
            "Q2-2024",
            90000,
            80,
            400,
            250,
            -60,
            "UTC",
            True,
            True,
            True,
            40,
            False,
            [self.employee, self.employee2],
        )
        self.assertIn(self.employee.name, summary["promotion_candidates"])

    def test_auditor_flags_low_hours(self):
        auditor = ComplianceAuditor({"Sales", "Marketing"})
        struggling = Employee("Cara", "Support", 48000)
        struggling.log_hours(10)
        struggling.add_performance_entry(40)
        result = auditor.evaluate_employee(struggling, 2, 60)
        self.assertIn("insufficient-hours", result["issues"])
        self.assertIn("unknown-department", result["issues"])

    def test_export_summary_returns_last(self):
        summary = self.controller.orchestrate_quarter(
            "Q3-2024",
            110000,
            83,
            450,
            180,
            -40,
            "UTC",
            True,
            True,
            False,
            50,
            True,
            [self.employee, self.employee2],
        )
        self.assertEqual(self.controller.export_summary(), summary)
        self.assertEqual(self.controller.export_summary("Q3-2024"), summary)


if __name__ == "__main__":
    unittest.main()
