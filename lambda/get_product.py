import json
import os
import boto3
from botocore.exceptions import ClientError
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table_name = os.environ['PRODUCTS_TABLE_NAME']
table = dynamodb.Table(table_name)


def handler(event, context):
    try:
        # Extract productId from path parameters
        product_id = event['pathParameters']['productId']

        # Get item from DynamoDB
        response = table.get_item(
            Key={'productId': product_id}
        )

        # Check if product exists
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Product not found'})
            }

        product = response['Item']

        return {
            'statusCode': 200,
            'body': json.dumps({
                'productId': product['productId'],
                'name': product['name'],
                'price': float(product['price']),  # Convert Decimal to float
                'description': product['description'],
                'category': product.get('category', 'uncategorized'),
                'imageUrl': product.get('imageUrl', '')
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