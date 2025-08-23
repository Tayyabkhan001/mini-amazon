import json
import os
import boto3
from botocore.exceptions import ClientError
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['PRODUCTS_TABLE_NAME']
table = dynamodb.Table(table_name)


def handler(event, context):
    # ADD CORS HEADERS
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
    }

    try:
        # Get category from query parameters
        query_params = event.get('queryStringParameters', {})
        category = query_params.get('category') if query_params else None

        if category:
            # Filter by category using scan
            response = table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('category').eq(category)
            )
        else:
            # Get all products if no category specified
            response = table.scan()

        products = response.get('Items', [])

        # Convert Decimal to float for JSON serialization
        for product in products:
            if 'price' in product:
                product['price'] = float(product['price'])

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'products': products,
                'count': len(products),
                'category': category if category else 'all'
            })
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'DynamoDB error: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,  # ← ADD HEADERS TO ERROR RESPONSE TOO
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }