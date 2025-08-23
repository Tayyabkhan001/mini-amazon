import json
import os
import boto3
from botocore.exceptions import ClientError

s3_client = boto3.client('s3')


def handler(event, context):
    try:
        # Get productId from path parameters
        product_id = event['pathParameters']['productId']

        # Generate unique filename
        filename = f"{product_id}_{os.urandom(8).hex()}.jpg"

        # Generate presigned URL for upload
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': os.environ['IMAGES_BUCKET_NAME'],
                'Key': filename,
                'ContentType': 'image/jpeg'
            },
            ExpiresIn=3600  # URL expires in 1 hour
        )

        # Generate URL for accessing the image
        image_url = f"https://{os.environ['IMAGES_BUCKET_NAME']}.s3.amazonaws.com/{filename}"

        return {
            'statusCode': 200,
            'body': json.dumps({
                'presignedUrl': presigned_url,
                'imageUrl': image_url,
                'filename': filename
            })
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'S3 error: {str(e)}'})
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': f'Internal server error: {str(e)}'})
        }