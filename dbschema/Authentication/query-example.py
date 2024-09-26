import boto3

def dynamo_to_python(dynamo_object: dict) -> dict:
    deserializer = TypeDeserializer()
    return {
        k: deserializer.deserialize(v) 
        for k, v in dynamo_object.items()
    }  
  
def python_to_dynamo(python_object: dict) -> dict:
    serializer = TypeSerializer()
    return {
        k: serializer.serialize(v)
        for k, v in python_object.items()
    }


dynamodb = boto3.client('dynamodb')

resp = dynamodb.query(
   TableName='tbl_user',
   IndexName='user_email',
   ExpressionAttributeValues={
       ':v1': {
           'S': 'xwill@bu.edu',
       },
   },
   KeyConditionExpression='email = :v1',
) # Find the user to check if it exists

# will always return list
user = resp.get('Items')
