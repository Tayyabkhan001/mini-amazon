import json
import boto3
import os
import uuid
from datetime import datetime

s3 = boto3.client('s3')

def handler(event, context):
    # ✅ UPDATED CORS headers with your actual Vercel domain
    headers = {
        'Access-Control-Allow-Origin': 'https://mini-amazon-qynf.vercel.app',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date, X-Api-Key, X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET, OPTIONS, PUT',
        'Access-Control-Allow-Credentials': 'true'
    }

    # Handle OPTIONS preflight
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    try:
        # Generate unique filename
        file_extension = '.jpg'  # or get from request if needed
        file_name = f"products/{uuid.uuid4()}{file_extension}"

        # Generate presigned URL
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': os.environ['S3_BUCKET_NAME'],
                'Key': file_name,
                'ContentType': 'image/jpeg'
            },
            ExpiresIn=300  # 5 minutes
        )

        # The public URL where the image will be accessible
        public_url = f"https://{os.environ['S3_BUCKET_NAME']}.s3.amazonaws.com/{file_name}"

        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({
                'presignedUrl': presigned_url,
                'publicUrl': public_url,
                'fileName': file_name
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,
            'body': json.dumps({'error': str(e)})
        }