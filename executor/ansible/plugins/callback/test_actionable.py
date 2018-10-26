import unittest
from ansible.plugins.callback.actionable import CallbackModule


class TestCallbackModule(unittest.TestCase):
    
    def setUp(self):
        pass

    def test_v2_playbook_on_handler_task_start(self):
        cb = CallbackModule()
        task = ''
        banner_text = cb.v2_playbook_on_handler_task_start(task)
        self.assertEquals(banner_text, '')
        self.assertEquals(cb.shown_title, True)

    def test_v2_playbook_on_task_start(self):
        cb = CallbackModule()
        task = ''
        is_conditional = ''
        cb.v2_playbook_on_task_start(task, is_conditional)

        self.assertEquals(cb.last_task, task)
        self.assertEquals(cb.shown_title, True)

    def test_display_task_banner(self):
        cb = CallbackModule()
        task = ''
        cb.display_task_banner()
        self.assertEquals(cb.last_task, task)
        self.assertEquals(cb.shown_title, True)

    def test_v2_runner_on_failed(self):
        cb = CallbackModule()
        result = ''
        ignore_errors = ''
        cb.v2_runner_on_failed(result, ignore_errors)
        # self.assertEquals('', '')

    def test_v2_runner_on_ok(self):
        cb = CallbackModule()
        result = {'changed': True}
        cb.v2_runner_on_ok(result)
        # self.assertEquals('', '')

    def test_v2_runner_on_unreachable(self, result):
        cb = CallbackModule()
        cb.v2_runner_on_unreachable()
        # self.assertEquals('', '')

    def test_v2_runner_on_skipped(self, result):
        pass

    def test_v2_playbook_on_include(self, included_file):
        pass

    def test_v2_runner_item_on_ok(self, result):
        cb = CallbackModule()
        result = {'changed': True}
        cb.v2_runner_item_on_failed(result)
        # self.assertEquals('', '')

        result = {'changed': False}
        cb.v2_runner_item_on_failed(result)
        # self.assertEquals('', '')

    def test_v2_runner_item_on_skipped(self, result):
        pass

    def test_v2_runner_item_on_failed(self, result):
        cb = CallbackModule()
        cb.v2_runner_item_on_failed()
        # self.assertEquals('', '')

    def test_v2_runner_retry(self, result):
        cb = CallbackModule()
        result = ''
        cb.v2_runner_retry(result)
        # self.assertEquals('', '')


if __name__ == '__main__':
    unittest.main()
