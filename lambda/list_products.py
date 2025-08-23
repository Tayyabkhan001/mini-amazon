import json
import os
import boto3
from botocore.exceptions import ClientError
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['PRODUCTS_TABLE_NAME']
table = dynamodb.Table(table_name)


def handler(event, context):
    # CORS headers
    headers = {
        'Access-Control-Allow-Origin': 'http://localhost:3000',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
    }

    try:
        # Debug logging
        print("📦 List Products Lambda triggered")
        print("Event:", json.dumps(event))

        # Get category from query parameters
        query_params = event.get('queryStringParameters', {})
        category = query_params.get('category') if query_params else None
        print(f"Category filter: {category}")

        # Use STRONG CONSISTENCY to get immediate results
        if category:
            print("Filtering by category:", category)
            response = table.scan(
                FilterExpression=boto3.dynamodb.conditions.Attr('category').eq(category),
                ConsistentRead=True  # ← ADDED STRONG CONSISTENCY
            )
        else:
            print("Getting all products")
            response = table.scan(
                ConsistentRead=True  # ← ADDED STRONG CONSISTENCY
            )

        products = response.get('Items', [])
        print(f"✅ Found {len(products)} products")

        # Convert Decimal to float for JSON serialization
        for product in products:
            if 'price' in product:
                product['price'] = float(product['price'])
            print(f"Product: {product.get('name')} (ID: {product.get('productId')})")

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
        print(f"❌ DynamoDB Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'DynamoDB error: {str(e)}'})
        }
    except Exception as e:
        print(f"❌ Unexpected Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }