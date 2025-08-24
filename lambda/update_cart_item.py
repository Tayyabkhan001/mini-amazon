import json
import os
import boto3
import jwt
from botocore.exceptions import ClientError
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
cart_table_name = os.environ['CART_TABLE_NAME']
cart_table = dynamodb.Table(cart_table_name)
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')


def auth_middleware(handler):
    def wrapper(event, context):
        if event.get('httpMethod') == 'OPTIONS':
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'CORS preflight successful'})
            }

        try:
            auth_header = event.get('headers', {}).get('Authorization')
            if not auth_header or not auth_header.startswith('Bearer '):
                return {
                    'statusCode': 401,
                    'body': json.dumps({'error': 'Authorization token required'})
                }

            token = auth_header.split(' ')[1]
            decoded = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            event['user'] = decoded
            return handler(event, context)

        except jwt.ExpiredSignatureError:
            return {'statusCode': 401, 'body': json.dumps({'error': 'Token expired'})}
        except jwt.InvalidTokenError:
            return {'statusCode': 401, 'body': json.dumps({'error': 'Invalid token'})}
        except Exception as e:
            return {'statusCode': 500,
                    'body': json.dumps({'error': f'Authentication error: {str(e)}'})}

    return wrapper


@auth_middleware
def handler(event, context):
    try:
        user_id = event['user']['userId']
        product_id = event['pathParameters']['productId']
        body = json.loads(event['body'])

        quantity = body.get('quantity')

        if quantity is None or quantity < 1:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Valid quantity is required'})
            }

        # Update cart item quantity
        response = cart_table.update_item(
            Key={
                'userId': user_id,
                'productId': product_id
            },
            UpdateExpression='SET quantity = :quantity',
            ExpressionAttributeValues={
                ':quantity': quantity
            },
            ReturnValues='ALL_NEW'
        )

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Cart item updated successfully',
                'cartItem': {
                    'productId': product_id,
                    'quantity': quantity
                }
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }