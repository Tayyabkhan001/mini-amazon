import json
import boto3
from botocore.exceptions import ClientError
import uuid
from datetime import datetime

dynamodb = boto3.resource('dynamodb')


def handler(event, context):
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': 'https://mini-amazon-qynf.vercel.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    }

    try:
        print("Received event:", json.dumps(event))

        # Parse request body
        if 'body' not in event:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'No request body'})
            }

        body = json.loads(event['body'])
        email = body.get('email')
        password = body.get('password')
        name = body.get('name')

        print(f"Received data - email: {email}, name: {name}")

        # Validate input
        if not all([email, password, name]):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing required fields: email, password, name'})
            }

        table = dynamodb.Table('UsersTable')

        # Check if user already exists
        response = table.query(
            IndexName='emailIndex',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(email)
        )

        if response.get('Items') and len(response['Items']) > 0:
            return {
                'statusCode': 409,
                'headers': headers,
                'body': json.dumps({'error': 'User already exists'})
            }

        # Create user (store password as-is for now, hash in production)
        user_id = str(uuid.uuid4())
        user = {
            'userId': user_id,
            'email': email,
            'password': password,  # In production, hash this!
            'name': name,
            'createdAt': datetime.utcnow().isoformat()
        }

        table.put_item(Item=user)

        return {
            'statusCode': 201,
            'headers': headers,
            'body': json.dumps({
                'message': 'User created successfully',
                'userId': user_id,
                'email': email,
                'name': name
            })
        }

    except Exception as e:
        print("Error:", str(e))
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }