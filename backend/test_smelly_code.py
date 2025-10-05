import unittest
from smelly_code import MegaGodClass

class TestMegaGodClass(unittest.TestCase):
    def setUp(self):
        self.god = MegaGodClass("John", 30, 175, 70, "123 St", "555-1234", "john@example.com",
                               "Active", "Engineer", "IT", 50000, 3)

    def test_mega_process_data_basic(self):
        data = [50, 30, 60]
        result = self.god.mega_process_data(data, 40, 70, 2, 10, True, False, False)
        self.assertEqual(result, 90)

    def test_mega_process_data_with_flags(self):
        data = [50, 30, 60]
        result = self.god.mega_process_data(data, 40, 70, 2, 10, True, True, False)
        self.assertEqual(result, 80)

    def test_validate_data(self):
        self.assertTrue(self.god.validate_data(50, 40, 60))
        self.assertFalse(self.god.validate_data(30, 40, 60))

    def test_process_status_salary_increase(self):
        god = MegaGodClass("Jane", 40, 165, 60, "456 St", "555-5678", "jane@example.com",
                          "Active", "Manager", "HR", 60000, 6)
        god.process_status("Jane", 40, 165, 60, "456 St", "555-5678", "jane@example.com",
                         "Active", "Manager", "HR", 60000, 6)
        self.assertEqual(god.salary, 61000)

    def test_generate_report(self):
        data = [50, 30, 60]
        report = self.god.generate_report(data, 40, 70, 2, 10, True, False, False)
        self.assertIn("90 items processed", report)

    def test_get_data(self):
        data = [50, 30, 60]
        self.god.mega_process_data(data, 40, 70, 2, 10, True, False, False)
        result = self.god.get_data()
        self.assertEqual(len(result), 3)

if __name__ == '__main__':
    unittest.main()