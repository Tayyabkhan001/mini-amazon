import json
import os
import boto3
import jwt
import uuid
from botocore.exceptions import ClientError
from decimal import Decimal
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
orders_table_name = os.environ['ORDERS_TABLE_NAME']
cart_table_name = os.environ['CART_TABLE_NAME']
orders_table = dynamodb.Table(orders_table_name)
cart_table = dynamodb.Table(cart_table_name)
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
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }

    try:
        user_id = event['user']['userId']
        user_email = event['user']['email']

        # Get user's cart items
        cart_response = cart_table.query(
            KeyConditionExpression=boto3.dynamodb.conditions.Key('userId').eq(user_id)
        )

        cart_items = cart_response.get('Items', [])

        if not cart_items:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Cart is empty'})
            }

        # Calculate order total
        total = sum(float(item['price']) * int(item['quantity']) for item in cart_items)

        # Create order
        order_id = str(uuid.uuid4())
        order_date = datetime.utcnow().isoformat()

        order = {
            'orderId': order_id,
            'userId': user_id,
            'userEmail': user_email,
            'items': cart_items,
            'total': Decimal(str(total)),
            'status': 'pending',
            'createdAt': order_date,
            'updatedAt': order_date
        }

        # Save order
        orders_table.put_item(Item=order)

        # Clear user's cart
        for item in cart_items:
            cart_table.delete_item(
                Key={
                    'userId': user_id,
                    'productId': item['productId']
                }
            )

        return {
            'statusCode': 201,
            'headers': headers,
            'body': json.dumps({
                'message': 'Order created successfully',
                'order': convert_decimals({
                    'orderId': order_id,
                    'total': total,
                    'status': 'pending',
                    'createdAt': order_date,
                    'itemCount': len(cart_items)
                })
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }