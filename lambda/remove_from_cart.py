import json
import os
import boto3
import jwt
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
cart_table_name = os.environ['CART_TABLE_NAME']
cart_table = dynamodb.Table(cart_table_name)
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')


def auth_middleware(handler):
    def wrapper(event, context):
        cors_headers = {
            'Access-Control-Allow-Origin': 'Https://Mini-Amazon-Qynf.Vercel.App,Http://Localhost:3000',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
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
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS'
    }

    try:
        user_id = event['user']['userId']
        product_id = event['pathParameters']['productId']

        # Remove item from cart
        cart_table.delete_item(
            Key={
                'userId': user_id,
                'productId': product_id
            }
        )

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Item removed from cart successfully',
                'productId': product_id
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }