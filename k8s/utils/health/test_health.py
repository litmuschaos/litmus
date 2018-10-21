import unittest
import cluster_health_check
from mock import patch, Mock

class Test_Object(object):
    pass 
 
class TestHealthCheck(unittest.TestCase):
     
    def setUp(self):
        self.node_count = 3
        self.conditions = ["Ready", "Not Ready", "Maybe"]
 
    def add_condition(self, item):
        item.status = Test_Object()
        item.status.conditions = []
        for condition in self.conditions:        
            new_condition = Test_Object()
            new_condition.type = condition
            item.status.conditions.append(new_condition)
                
    def get_node_list_with_conditions(self): 
        test_object = Test_Object()
        item_array = [Test_Object() for i in range(self.node_count)]
        for item in item_array:
            self.add_condition(item)

        test_object.items = item_array                      
        return test_object
        
    def test_create_api(self):
        self.assertNotEqual(cluster_health_check.create_api(), None)
        
    @patch('cluster_health_check.client.CoreV1Api')
    def test_get_nodes(self, v1_mock):
        test_object = Test_Object()
        test_object.items = [i for i in range(self.node_count)]        
        v1_mock.return_value.list_node.return_value = test_object 
        self.assertEqual(len(cluster_health_check.get_nodes(self.node_count)), self.node_count)
        
    @patch('cluster_health_check.client.CoreV1Api')
    def test_get_node_status(self, v1_mock):
        v1_mock.return_value.list_node.return_value = self.get_node_list_with_conditions() 
        self.assertEqual(cluster_health_check.get_node_status(self.node_count), self.node_count)
 
if __name__ == '__main__':
    unittest.main()