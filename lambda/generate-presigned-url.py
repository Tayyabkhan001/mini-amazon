# generate-presigned-url.py
import json
import boto3
import uuid
from botocore.exceptions import ClientError


def lambda_handler(event, context):
    # CORS headers - ADD THESE
    headers = {
        'Access-Control-Allow-Origin': 'https://your-vercel-url.vercel.app',  # ← Change to your Vercel URL
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Credentials': 'true'
    }

    # Handle OPTIONS preflight request - ADD THIS
    if event.get('httpMethod') == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': headers,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    try:
        s3_client = boto3.client('s3')

        # Generate unique filename - SIMPLIFY THIS
        file_extension = '.jpg'  # Default to jpg
        file_key = f"products/{uuid.uuid4()}{file_extension}"

        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': 'mini-amazon-images-480421269735',  # Your bucket name
                'Key': file_key,
                'ContentType': 'image/jpeg'  # Fixed content type
            },
            ExpiresIn=300  # 5 minutes is enough
        )

        # Generate public URL for accessing the image
        public_url = f"https://mini-amazon-images-480421269735.s3.amazonaws.com/{file_key}"

        return {
            'statusCode': 200,
            'headers': headers,  # Use the headers we defined
            'body': json.dumps({
                'presignedUrl': presigned_url,
                'publicUrl': public_url,  # Add public URL
                'fileName': file_key
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': headers,  # Use the headers we defined
            'body': json.dumps({'error': str(e)})
        }