import namesgenerator
import unittest

class MyTest(unittest.TestCase):
    def test_namesgenerator(self):
        self.assertEqual(type(namesgenerator.get_random_name()), str)
if __name__ == "__main__":
    unittest.main()