#!/usr/bin/env python3
import aws_cdk as cdk
from mini_amazon_cdk.mini_amazon_cdk_stack import MiniAmazonCdkStack

app = cdk.App()

# REPLACE '123456789012' with your actual AWS Account ID
MiniAmazonCdkStack(app, "MiniAmazonCdkStack",
    env=cdk.Environment(
        account='480421269735',  # ← YOUR 12-DIGIT ACCOUNT ID HERE
        region='ap-south-1'    # UAE region for Islamabad
    )
)