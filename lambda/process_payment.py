import json
import os
import boto3
import jwt
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

dynamodb = boto3.resource('dynamodb')
orders_table_name = os.environ['ORDERS_TABLE_NAME']
orders_table = dynamodb.Table(orders_table_name)
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-super-secret-jwt-key-change-in-production')


def auth_middleware(handler):
    def wrapper(event, context):
        cors_headers = {
            'Access-Control-Allow-Origin': '*',
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }

    try:
        user_id = event['user']['userId']
        order_id = event['pathParameters']['orderId']
        body = json.loads(event['body'])

        # Get payment method from request
        payment_method = body.get('paymentMethod', 'card')  # card, bank_transfer, cash
        simulate_success = body.get('simulateSuccess', True)  # For testing failures

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

        # Verify order belongs to user and is pending
        if order['userId'] != user_id:
            return {
                'statusCode': 403,
                'headers': headers,
                'body': json.dumps({'error': 'Access denied'})
            }

        if order['status'] != 'pending':
            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({'error': 'Order already processed'})
            }

        # Simulate payment processing (80% success rate if not specified)
        if not simulate_success:
            # Simulate payment failure
            orders_table.update_item(
                Key={
                    'orderId': order_id,
                    'userId': user_id
                },
                UpdateExpression='SET #status = :status, paymentStatus = :paymentStatus, paymentMethod = :method',
                ExpressionAttributeNames={
                    '#status': 'status'
                },
                ExpressionAttributeValues={
                    ':status': 'payment_failed',
                    ':paymentStatus': 'failed',
                    ':method': payment_method
                }
            )

            return {
                'statusCode': 400,
                'headers': headers,
                'body': json.dumps({
                    'message': 'Payment failed (simulated)',
                    'status': 'failed',
                    'orderId': order_id
                })
            }

        # Simulate successful payment
        payment_id = str(uuid.uuid4())
        current_time = datetime.utcnow().isoformat()

        orders_table.update_item(
            Key={
                'orderId': order_id,
                'userId': user_id
            },
            UpdateExpression='SET #status = :status, paymentStatus = :paymentStatus, '
                             'paymentMethod = :method, paymentId = :pid, paidAt = :paidAt',
            ExpressionAttributeNames={
                '#status': 'status'
            },
            ExpressionAttributeValues={
                ':status': 'paid',
                ':paymentStatus': 'completed',
                ':method': payment_method,
                ':pid': payment_id,
                ':paidAt': current_time
            }
        )

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'message': 'Payment processed successfully',
                'status': 'completed',
                'orderId': order_id,
                'paymentId': payment_id,
                'paymentMethod': payment_method,
                'amount': float(order['total']),
                'paidAt': current_time
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }