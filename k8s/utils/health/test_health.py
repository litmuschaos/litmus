import unittest
import cluster_health_check
from mock import patch, Mock

class Test_Object(object):
    pass 
 
class TestHealthCheck(unittest.TestCase):
     
    def setUp(self):
        self.node_count = 3
        pass
 
    def get_node_list_with_conditions(): 
        test_object = Test_Object()
        item_array = [Test_Object() for i in range(self.node_count)]
        conditions = ["Ready", "Not Ready", "Maybe"]
        for item in item_array:
            item.status = Test_Object()
            item.status.conditions = []
            for condition in conditions:
                new_condition = Test_Object()
                new_condition.type = condition
                item.status.conditions.append(new_condition)
        test_object.items = item_array                      
        return test_object
        
    def test_create_api(self):
        self.assertNotEqual(cluster_health_check.create_api(), None)
        
    @patch('cluster_health_check.client.CoreV1Api')
    def test_get_nodes(self, v1_mock):
        test_object = Test_Object()
        test_object.items = [i for i in range(len(self.node_count))]        
        v1_mock.return_value.list_node.return_value = test_object 
        self.assertEqual(len(cluster_health_check.get_nodes(self.node_count)), self.node_count)
        
    @patch('cluster_health_check.client.CoreV1Api')
    def test_get_node_status(self, v1_mock):
        test_object = Test_Object()
        item_array = self.get_item_list()
        test_object.items = item_array      
        v1_mock.return_value.list_node.return_value = get_node_list_with_conditions() 
        self.assertEqual(cluster_health_check.get_node_status(self.node_count), self.node_count)
 
if __name__ == '__main__':
    unittest.main()
    