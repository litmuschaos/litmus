All error responses follow the structure outlined below.

```json
{
  "errors": [
    {
      "message": "Error message",
      "path": [
        "Request path"
      ]
    }
  ],
  "data": {}
}
```

### Field Descriptions:
- **errors**: <br>
  An array of error objects. Multiple errors can occur, and each error contains a message and a path field. <br>
  **Type: `Array`** <br><br>
    - **message**: <br>
      A description of the error. <br>
      **Type: `String`** <br><br>
    - **path**: <br>
      Indicates the GraphQL or API operation path where the error occurred. It helps in identifying which operation or resolver triggered the error. <br>
      **Type: `Array of Strings`** <br><br>
- **data**: <br>
  This field contains the data returned from the request. In the event of an error, the field corresponding to the failed operation will be null, while other successful operations (if any) will still return valid data. <br>
  **Type: `Object`** <br>
