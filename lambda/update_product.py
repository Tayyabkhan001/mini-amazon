import json
import os
import boto3
import jwt
from botocore.exceptions import ClientError
from decimal import Decimal
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['PRODUCTS_TABLE_NAME']
table = dynamodb.Table(table_name)
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')


# Helper function to convert Decimal to float for JSON serialization
def convert_decimals(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    return obj


# Auth middleware function
def auth_middleware(handler):
    def wrapper(event, context):
        cors_headers = {
            'Access-Control-Allow-Origin': 'https://mini-amazon-qynf.vercel.app',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'PUT, OPTIONS'
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
        'Access-Control-Allow-Methods': 'PUT, OPTIONS'
    }

    try:
        user_id = event['user']['userId']
        product_id = event['pathParameters']['productId']

        body = json.loads(event['body'])

        # Build update expression
        update_expression = 'SET '
        expression_attribute_values = {}
        expression_attribute_names = {}

        fields = ['name', 'price', 'description', 'category', 'imageUrl']
        for field in fields:
            if field in body:
                update_expression += f'#{field} = :{field}, '
                expression_attribute_names[f'#{field}'] = field
                expression_attribute_values[f':{field}'] = Decimal(str(body[field])) if field == 'price' else body[
                    field]

        # Add updatedBy info
        update_expression += 'updatedBy = :updatedBy, updatedAt = :updatedAt'
        expression_attribute_values[':updatedBy'] = user_id
        expression_attribute_values[':updatedAt'] = str(datetime.utcnow())

        # Remove trailing comma
        update_expression = update_expression.rstrip(', ')

        response = table.update_item(
            Key={'productId': product_id},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values,
            ReturnValues='ALL_NEW'
        )

        # Convert Decimal to float for JSON serialization
        updated_product = convert_decimals(response['Attributes'])

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Product updated successfully',
                'product': updated_product
            })
        }

    except ClientError as e:
        return {'statusCode': 500, 'headers': headers, 'body': json.dumps({'error': f'DynamoDB error: {str(e)}'})}
    except Exception as e:
        return {'statusCode': 500, 'headers': headers,
                'body': json.dumps({'error': f'Internal server error: {str(e)}'})}