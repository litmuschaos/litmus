# Make coding more python3-ish
import unittest
from mock import MagicMock
import json
from openebs import CallbackModule 

class MagicMock(MagicMock):

    def to_json(self):
        json = {
          '_result':{
              'retries': self._result['retries'],
              'attempts': self._result['attempts']
          } 
        }
        return json 
    
    def __json__(self):
        return to_json(self)

from json import JSONEncoder

def _default(self, obj):
    return getattr(obj.__class__, "to_json", _default.default)(obj)

_default.default = JSONEncoder().default
JSONEncoder.default = _default


class TestCallbackModule(unittest.TestCase):

    def test_v2_runner_retry(self, result={}):
        result_mock = MagicMock()
        result_mock.task_name = 0
        result_mock._result={}
        result_mock._result['retries'] = 4
        result_mock._result['attempts'] = 1
        print('result_mock',result_mock.to_json())
        print('result_mock json',json.dumps(result_mock))

        cb_result_mock = "Result was: %s" % CallbackModule()._dump_results(result_mock._result)
        final_result = result_mock._result['retries'] - result_mock._result['attempts']
        cbm = CallbackModule()
        cbm._display.verbosity = 3
        print(cbm._display.verbosity)
        
        cb = cbm.v2_runner_retry( result=result_mock)
        # print('cb is', result_mock._result)
        self.assertIs("Result was: %s" % cbm._dump_results(result_mock._result), cb_result_mock)

    def test_v2_runner_on_skipped(self, task, is_conditional):
        pass
    
    def test_v2_runner_item_on_skipped(sell, task):
        pass

if __name__ == '__main__':
    unittest.main() 