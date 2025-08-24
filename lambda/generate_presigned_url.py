import json
import boto3
import uuid
import os


def handler(event, context):
    print("Received event:", json.dumps(event))

    # Handle OPTIONS preflight
    if event.get('httpMethod') == 'OPTIONS':
        print("Handling OPTIONS request")
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'CORS preflight successful'})
        }

    try:
        print("Getting S3 bucket name from environment")
        bucket_name = os.environ.get('S3_BUCKET_NAME')

        if not bucket_name:
            raise Exception("S3_BUCKET_NAME environment variable is missing")

        print(f"Using bucket: {bucket_name}")

        s3 = boto3.client('s3')

        # Generate unique filename
        file_name = f"products/{uuid.uuid4()}.jpg"
        print(f"Generated filename: {file_name}")

        # Generate presigned URL for upload
        presigned_url = s3.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': bucket_name,
                'Key': file_name,
                'ContentType': 'image/jpeg'
            },
            ExpiresIn=3600  # 60 minutes
        )

        # Public URL for accessing the image
        public_url = f"https://{bucket_name}.s3.amazonaws.com/{file_name}"

        print(f"Presigned URL: {presigned_url}")
        print(f"Public URL: {public_url}")

        response = {
            'statusCode': 200,
            'body': json.dumps({
                'presignedUrl': presigned_url,
                'publicUrl': public_url,
                'fileName': file_name
            })
        }

        print("Returning response:", json.dumps(response))
        return response

    except Exception as e:
        print(f"Error: {str(e)}")
        import traceback
        print(f"Traceback: {traceback.format_exc()}")

        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e), 'message': 'Internal server error'})
        }