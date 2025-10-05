class SampleClass:
    def long_method(self, a, b, c, d, e, f, g):
        result = 0
        for i in range(100):  # Magic Number
            result += a * 2
            result += b * 2
            result += c * 2
            if self.check_value(result, 50):  # Magic Number
                print("Threshold reached")
            if self.check_value(result, 50):  # Duplicated Code
                print("Threshold reached again")
        return result

    def check_value(self, value, threshold):
        return value > threshold