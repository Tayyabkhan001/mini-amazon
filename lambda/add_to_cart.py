import json
import os
import boto3
import jwt
from datetime import datetime
from botocore.exceptions import ClientError
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
cart_table_name = os.environ['CART_TABLE_NAME']
products_table_name = os.environ['PRODUCTS_TABLE_NAME']
cart_table = dynamodb.Table(cart_table_name)
products_table = dynamodb.Table(products_table_name)
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')


def auth_middleware(handler):
    def wrapper(event, context):
        cors_headers = {
            'Access-Control-Allow-Origin': 'Https://Mini-Amazon-Qynf.Vercel.App,Http://Localhost:3000',
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
        'Access-Control-Allow-Origin': 'Https://Mini-Amazon-Qynf.Vercel.App,Http://Localhost:3000',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }

    try:
        user_id = event['user']['userId']
        body = json.loads(event['body'])

        product_id = body.get('productId')
        quantity = body.get('quantity', 1)

        if not product_id:
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Product ID is required'})
            }

        # Check if product exists
        product_response = products_table.get_item(Key={'productId': product_id})
        if 'Item' not in product_response:
            return {
                'statusCode': 404,
                'headers': headers,
                'body': json.dumps({'error': 'Product not found'})
            }

        product = product_response['Item']

        # Add to cart
        cart_item = {
            'userId': user_id,
            'productId': product_id,
            'quantity': quantity,
            'name': product['name'],
            'price': Decimal(str(product['price'])),
            'imageUrl': product.get('imageUrl', ''),
            'addedAt': str(datetime.utcnow())
        }

        cart_table.put_item(Item=cart_item)

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Product added to cart successfully',
                'cartItem': {
                    'productId': cart_item['productId'],
                    'name': cart_item['name'],
                    'price': float(cart_item['price']),
                    'quantity': cart_item['quantity'],
                    'imageUrl': cart_item['imageUrl']
                }
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }