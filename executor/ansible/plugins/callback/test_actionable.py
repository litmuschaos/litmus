import unittest

class TestCallbackModule(unittest.TestCase):
    
    def setUp(self):
        pass

    def test_v2_playbook_on_handler_task_start(self, task):
        ''

    def test_v2_playbook_on_task_start(self, task, is_conditional):
        ''
    
    def test_display_task_banner(self):
        ''

    def test_v2_runner_on_failed(self, result, ignore_errors=False):
        ''

    def test_v2_runner_on_ok(self, result):
        ''

    def test_v2_runner_on_unreachable(self, result):
        ''

    def test_v2_runner_on_skipped(self, result):
        pass

    def test_v2_playbook_on_include(self, included_file):
        pass

    def test_v2_runner_item_on_ok(self, result):
        ''

    def test_v2_runner_item_on_skipped(self, result):
        pass

    def test_v2_runner_item_on_failed(self, result):
        ''

    def test_v2_runner_retry(self, result):
        ''

if __name__ == '__main__':
    unittest.main()