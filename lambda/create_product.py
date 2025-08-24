import json
import os
import boto3
import jwt
from botocore.exceptions import ClientError
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['PRODUCTS_TABLE_NAME']
table = dynamodb.Table(table_name)
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')


# Auth middleware function
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

            # Add user info to event
            event['user'] = decoded
            return handler(event, context)

        except jwt.ExpiredSignatureError:
            return {
                'statusCode': 401,
                'body': json.dumps({'error': 'Token expired'})
            }
        except jwt.InvalidTokenError:
            return {
                'statusCode': 401,
                'body': json.dumps({'error': 'Invalid token'})
            }
        except Exception as e:
            return {
                'statusCode': 500,
                'body': json.dumps({'error': f'Authentication error: {str(e)}'})
            }

    return wrapper


# Main handler with auth middleware
@auth_middleware
def handler(event, context):
    try:
        # Get user info from the middleware
        user_id = event['user']['userId']
        user_email = event['user']['email']

        print(f"Authenticated user creating product: {user_email} ({user_id})")

        # Parse the request body
        body = json.loads(event['body'])

        # Extract product details
        product_id = body.get('productId')
        name = body.get('name')
        price = body.get('price')
        description = body.get('description', '')
        category = body.get('category', 'uncategorized')
        image_url = body.get('imageUrl', '')

        # Validate required fields
        if not all([product_id, name, price]):
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Missing required fields: productId, name, price'})
            }

        # Create product item
        item = {
            'productId': product_id,
            'name': name,
            'price': Decimal(str(price)),
            'description': description,
            'category': category,
            'imageUrl': image_url,
            'createdBy': user_id,
            'createdByEmail': user_email
        }

        # Put item into DynamoDB
        table.put_item(Item=item)

        return {
            'statusCode': 201,
            'body': json.dumps({
                'message': 'Product created successfully',
                'product': {
                    'productId': item['productId'],
                    'name': item['name'],
                    'price': float(item['price']),
                    'description': item['description'],
                    'category': item['category'],
                    'imageUrl': item['imageUrl'],
                    'createdBy': user_id
                }
            })
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'DynamoDB error: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }