from aws_cdk import (
    Stack,
    aws_s3 as s3,
    aws_cloudfront as cloudfront,
    aws_cloudfront_origins as origins,
    RemovalPolicy,
    CfnOutput
)
from constructs import Construct


class MiniAmazonCdkStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # 1. Create an S3 bucket to host our website files
        website_bucket = s3.Bucket(self, "MiniAmazonWebsiteBucket",
                                   removal_policy=RemovalPolicy.DESTROY,
                                   auto_delete_objects=True,
                                   website_index_document="index.html",
                                   website_error_document="index.html",

                                   # CORRECT: Completely disable all public access blocks
                                   block_public_access=s3.BlockPublicAccess(
                                       block_public_acls=False,
                                       ignore_public_acls=False,
                                       block_public_policy=False,
                                       restrict_public_buckets=False
                                   ),
                                   public_read_access=True
                                   )

        # 2. Create a CloudFront distribution (a global Content Delivery Network)
        distribution = cloudfront.Distribution(self, "MiniAmazonDistribution",
                                               default_behavior=cloudfront.BehaviorOptions(
                                                   origin=origins.S3Origin(website_bucket),
                                                   viewer_protocol_policy=cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                                               ),
                                               default_root_object="index.html",
                                               error_responses=[
                                                   cloudfront.ErrorResponse(
                                                       http_status=404,
                                                       response_http_status=200,
                                                       response_page_path="/index.html"
                                                   )
                                               ]
                                               )

        # 3. This will print the website URL in the terminal after deployment
        CfnOutput(self, "WebsiteURL", value=f"https://{distribution.domain_name}")
        CfnOutput(self, "BucketName", value=website_bucket.bucket_name)

        # ()_()
