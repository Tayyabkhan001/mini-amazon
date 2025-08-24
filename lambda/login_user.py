import json
import boto3
from botocore.exceptions import ClientError
import jwt
from datetime import datetime, timedelta

dynamodb = boto3.resource('dynamodb')
JWT_SECRET = "your-super-secret-jwt-key-change-in-production"


def handler(event, context):
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': 'https://mini-amazon-qynf.vercel.app',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'OPTIONS,POST'
    }

    try:
        print("Login event:", json.dumps(event))

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

        print(f"Login attempt for email: {email}")

        # Validate input
        if not all([email, password]):
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Missing email or password'})
            }

        table = dynamodb.Table('UsersTable')

        # Find user by email using the GSI
        response = table.query(
            IndexName='emailIndex',
            KeyConditionExpression=boto3.dynamodb.conditions.Key('email').eq(email)
        )

        print(f"Query response: {response}")

        if not response.get('Items') or len(response['Items']) == 0:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid credentials - user not found'})
            }

        user = response['Items'][0]
        print(f"Found user: {user['userId']}")

        # Check password (simple comparison for demo - hash in production)
        if user['password'] != password:
            return {
                'statusCode': 401,
                'headers': headers,
                'body': json.dumps({'error': 'Invalid credentials - wrong password'})
            }

        # Generate JWT token
        token_payload = {
            'userId': user['userId'],
            'email': user['email'],
            'exp': datetime.utcnow() + timedelta(hours=24)
        }

        token = jwt.encode(token_payload, JWT_SECRET, algorithm='HS256')

        # Return success response
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Login successful',
                'token': token,
                'user': {
                    'userId': user['userId'],
                    'email': user['email'],
                    'name': user['name']
                }
            })
        }

    except Exception as e:
        print(f"Login error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")

        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }