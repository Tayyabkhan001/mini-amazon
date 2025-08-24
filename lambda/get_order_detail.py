import json
import os
import boto3
import jwt
from botocore.exceptions import ClientError
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
orders_table_name = os.environ['ORDERS_TABLE_NAME']
orders_table = dynamodb.Table(orders_table_name)
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')


def convert_decimals(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    return obj


def auth_middleware(handler):
    def wrapper(event, context):
        cors_headers = {
            'Access-Control-Allow-Origin': 'https://mini-amazon-qynf.vercel.app',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, OPTIONS'
        }

        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'headers': cors_headers,
                'body': json.dumps({'message': 'CORS preflight successful'})
            }

        try:
            auth_header = event.get('headers', {}).get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return {
                    'statusCode': 401,
                    'headers': cors_headers,
                    'body': json.dumps({'error': 'Authorization token required'})
                }

            token = auth_header.split(' ')[1]
            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            event['user'] = decoded
            return handler(event, context)

        except jwt.ExpiredSignatureError:
            return {'statusCode': 401, 'headers': cors_headers, 'body': json.dumps({'error': 'Token expired'})}
        except jwt.InvalidTokenError:
            return {'statusCode': 401, 'headers': cors_headers, 'body': json.dumps({'error': 'Invalid token'})}
        except Exception as e:
            return {'statusCode': 500, 'headers': cors_headers,
                    'body': json.dumps({'error': f'Authentication error: {str(e)}'})}

    return wrapper


@auth_middleware
def handler(event, context):
    headers = {
        'Access-Control-Allow-Origin': 'https://mini-amazon-qynf.vercel.app',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
    }

    try:
        user_id = event['user']['userId']
        order_id = event['pathParameters']['orderId']

        # Get order details
        response = orders_table.get_item(
            Key={
                'orderId': order_id,
                'userId': user_id
            }
        )

        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Order not found'})
            }

        order = response['Item']

        # Verify the order belongs to the user
        if order['userId'] != user_id:
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({'error': 'Access denied'})
            }

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Order details retrieved successfully',
                'order': convert_decimals(order)
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }