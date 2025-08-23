# generate-presigned-url.py
import json
import boto3
from botocore.exceptions import ClientError


def lambda_handler(event, context):
    try:
        s3_client = boto3.client('s3')

        # Get file info from request
        body = json.loads(event['body'])
        file_name = body['fileName']
        file_type = body['fileType']

        # Generate unique file key
        file_key = f"products/{context.aws_request_id}-{file_name}"

        # Generate presigned URL
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': 'mini-amazon-images-480421269735',
                'Key': file_key,
                'ContentType': file_type
            },
            ExpiresIn=3600
        )

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({
                'signedUrl': presigned_url,
                'fileKey': file_key
            })
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': True,
            },
            'body': json.dumps({'error': str(e)})
        }