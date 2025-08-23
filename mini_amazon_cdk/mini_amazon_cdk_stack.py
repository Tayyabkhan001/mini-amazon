from aws_cdk import (
    Stack,
    aws_lambda as _lambda,
    aws_apigateway as apigateway,
    aws_dynamodb as dynamodb,
    RemovalPolicy
)
from aws_cdk import aws_s3 as s3
from constructs import Construct


class MiniAmazonCdkStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # DynamoDB Tables
        products_table = dynamodb.Table(
            self, "ProductsTable",
            table_name="ProductsTable",
            partition_key=dynamodb.Attribute(
                name="productId",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        users_table = dynamodb.Table(
            self, "UsersTable",
            table_name="UsersTable",
            partition_key=dynamodb.Attribute(
                name="userId",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        # Add Global Secondary Index for email lookup
        users_table.add_global_secondary_index(
            index_name="emailIndex",
            partition_key=dynamodb.Attribute(
                name="email",
                type=dynamodb.AttributeType.STRING
            )
        )

        # Cart Table
        cart_table = dynamodb.Table(
            self, "CartTable",
            table_name="CartTable",
            partition_key=dynamodb.Attribute(
                name="userId",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="productId",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        # S3 Bucket for product images
        product_images_bucket = s3.Bucket(
            self, "ProductImagesBucket",
            bucket_name=f"mini-amazon-images-{self.account}",
            removal_policy=RemovalPolicy.DESTROY,
            auto_delete_objects=True,
            cors=[
                s3.CorsRule(
                    allowed_origins=["*"],
                    allowed_methods=[s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST],
                    allowed_headers=["*"],
                    exposed_headers=["ETag"]
                )
            ]
        )

        # API Gateway with CORS enabled (DEFINE THIS FIRST)
        api = apigateway.RestApi(
            self, "ProductsApi",
            rest_api_name="Products Service",
            description="API for managing products",
            default_cors_preflight_options=apigateway.CorsOptions(
                allow_origins=apigateway.Cors.ALL_ORIGINS,
                allow_methods=apigateway.Cors.ALL_METHODS,
                allow_headers=["Content-Type", "Authorization", "X-Amz-Date", "X-Api-Key", "X-Amz-Security-Token"],
                status_code=200
            )
        )

        # Lambda Functions
        create_product_lambda = _lambda.Function(
            self, "CreateProductFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="create_product.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "PRODUCTS_TABLE_NAME": products_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        get_product_lambda = _lambda.Function(
            self, "GetProductFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="get_product.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "PRODUCTS_TABLE_NAME": products_table.table_name
            }
        )

        update_product_lambda = _lambda.Function(
            self, "UpdateProductFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="update_product.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "PRODUCTS_TABLE_NAME": products_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        delete_product_lambda = _lambda.Function(
            self, "DeleteProductFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="delete_product.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "PRODUCTS_TABLE_NAME": products_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        list_products_lambda = _lambda.Function(
            self, "ListProductsFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="list_products.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "PRODUCTS_TABLE_NAME": products_table.table_name
            }
        )

        generate_presigned_url_lambda = _lambda.Function(
            self, "GeneratePresignedUrlFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="generate_presigned_url.handler",  # ← This must match your function name
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "S3_BUCKET_NAME": product_images_bucket.bucket_name
            }
        )

        # Auth Lambdas
        register_user_lambda = _lambda.Function(
            self, "RegisterUserFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="register_user.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "USERS_TABLE_NAME": users_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        login_user_lambda = _lambda.Function(
            self, "LoginUserFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="login_user.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "USERS_TABLE_NAME": users_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        # Cart Lambda Functions
        add_to_cart_lambda = _lambda.Function(
            self, "AddToCartFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="add_to_cart.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "CART_TABLE_NAME": cart_table.table_name,
                "PRODUCTS_TABLE_NAME": products_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        get_cart_lambda = _lambda.Function(
            self, "GetCartFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="get_cart.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "CART_TABLE_NAME": cart_table.table_name,
                "PRODUCTS_TABLE_NAME": products_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        update_cart_item_lambda = _lambda.Function(
            self, "UpdateCartItemFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="update_cart_item.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "CART_TABLE_NAME": cart_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        remove_from_cart_lambda = _lambda.Function(
            self, "RemoveFromCartFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="remove_from_cart.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "CART_TABLE_NAME": cart_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )
        # Orders Table
        orders_table = dynamodb.Table(
            self, "OrdersTable",
            table_name="OrdersTable",
            partition_key=dynamodb.Attribute(
                name="orderId",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="userId",
                type=dynamodb.AttributeType.STRING
            ),
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            removal_policy=RemovalPolicy.DESTROY
        )

        # Add GSI for querying orders by user
        orders_table.add_global_secondary_index(
            index_name="userId-index",
            partition_key=dynamodb.Attribute(
                name="userId",
                type=dynamodb.AttributeType.STRING
            ),
            sort_key=dynamodb.Attribute(
                name="createdAt",
                type=dynamodb.AttributeType.STRING
            )
        )

        # Order Lambda Functions
        create_order_lambda = _lambda.Function(
            self, "CreateOrderFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="create_order.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "ORDERS_TABLE_NAME": orders_table.table_name,
                "CART_TABLE_NAME": cart_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        get_orders_lambda = _lambda.Function(
            self, "GetOrdersFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="get_orders.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "ORDERS_TABLE_NAME": orders_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        get_order_detail_lambda = _lambda.Function(
            self, "GetOrderDetailFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="get_order_detail.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "ORDERS_TABLE_NAME": orders_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        # Grant permissions
        orders_table.grant_read_write_data(create_order_lambda)
        orders_table.grant_read_data(get_orders_lambda)
        orders_table.grant_read_data(get_order_detail_lambda)
        cart_table.grant_read_data(create_order_lambda)

        # Add order endpoints to API
        orders_resource = api.root.add_resource("orders")

        # POST /orders - Create order from cart
        orders_resource.add_method(
            "POST",
            apigateway.LambdaIntegration(create_order_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # GET /orders - Get user's orders
        orders_resource.add_method(
            "GET",
            apigateway.LambdaIntegration(get_orders_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # GET /orders/{orderId} - Get order details
        order_detail_resource = orders_resource.add_resource("{orderId}")
        order_detail_resource.add_method(
            "GET",
            apigateway.LambdaIntegration(get_order_detail_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # Grant Lambda permissions to DynamoDB
        products_table.grant_read_write_data(create_product_lambda)
        products_table.grant_read_data(get_product_lambda)
        products_table.grant_read_write_data(update_product_lambda)
        products_table.grant_read_write_data(delete_product_lambda)
        products_table.grant_read_data(list_products_lambda)

        # Grant permissions to auth lambdas
        users_table.grant_read_write_data(register_user_lambda)
        users_table.grant_read_data(login_user_lambda)

        # Grant permissions to cart lambdas
        cart_table.grant_read_write_data(add_to_cart_lambda)
        cart_table.grant_read_data(get_cart_lambda)
        cart_table.grant_read_write_data(update_cart_item_lambda)
        cart_table.grant_read_write_data(remove_from_cart_lambda)
        cart_table.grant_read_write_data(create_order_lambda)
        products_table.grant_read_data(add_to_cart_lambda)
        products_table.grant_read_data(get_cart_lambda)

        # Payment Simulation Lambda Function
        process_payment_lambda = _lambda.Function(
            self, "ProcessPaymentFunction",
            runtime=_lambda.Runtime.PYTHON_3_9,
            handler="process_payment.handler",
            code=_lambda.Code.from_asset("lambda"),
            environment={
                "ORDERS_TABLE_NAME": orders_table.table_name,
                "JWT_SECRET": "your-super-secret-jwt-key-change-in-production"
            }
        )

        # Grant permissions
        orders_table.grant_read_write_data(process_payment_lambda)

        # Add payment endpoint to API
        payment_resource = api.root.add_resource("payment")

        # POST /payment/{orderId}/process - Process payment simulation
        payment_process_resource = payment_resource.add_resource("{orderId}").add_resource("process")
        payment_process_resource.add_method(
            "POST",
            apigateway.LambdaIntegration(process_payment_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # Grant S3 permissions
        product_images_bucket.grant_put(generate_presigned_url_lambda)

        # API Resources and Methods
        products_resource = api.root.add_resource("products")

        # POST /products - Create product
        products_resource.add_method(
            "POST",
            apigateway.LambdaIntegration(create_product_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # GET /products - List all products
        products_resource.add_method(
            "GET",
            apigateway.LambdaIntegration(list_products_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # GET /products/{productId} - Get specific product
        product_item_resource = products_resource.add_resource("{productId}")
        product_item_resource.add_method(
            "GET",
            apigateway.LambdaIntegration(get_product_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # PUT /products/{productId} - Update product
        product_item_resource.add_method(
            "PUT",
            apigateway.LambdaIntegration(update_product_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # DELETE /products/{productId} - Delete product
        product_item_resource.add_method(
            "DELETE",
            apigateway.LambdaIntegration(delete_product_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # Image upload endpoint
        image_upload_resource = product_item_resource.add_resource("upload-image")
        image_upload_resource.add_method(
            "GET",
            apigateway.LambdaIntegration(generate_presigned_url_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # ===== ADDED: Presigned URL endpoint =====
        presigned_url_resource = api.root.add_resource("presigned-url")
        presigned_url_resource.add_method(
            "GET",
            apigateway.LambdaIntegration(generate_presigned_url_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )
        # ===== END OF ADDED CODE =====

        # Add auth endpoints
        auth_resource = api.root.add_resource("auth")

        # Register endpoint
        register_resource = auth_resource.add_resource("register")
        register_resource.add_method(
            "POST",
            apigateway.LambdaIntegration(register_user_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # Login endpoint
        login_resource = auth_resource.add_resource("login")
        login_resource.add_method(
            "POST",
            apigateway.LambdaIntegration(login_user_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # Add cart endpoints to API
        cart_resource = api.root.add_resource("cart")

        # POST /cart - Add to cart
        cart_resource.add_method(
            "POST",
            apigateway.LambdaIntegration(add_to_cart_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # GET /cart - Get cart
        cart_resource.add_method(
            "GET",
            apigateway.LambdaIntegration(get_cart_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # PUT /cart/{productId} - Update cart item
        cart_item_resource = cart_resource.add_resource("{productId}")
        cart_item_resource.add_method(
            "PUT",
            apigateway.LambdaIntegration(update_cart_item_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )

        # DELETE /cart/{productId} - Remove from cart
        cart_item_resource.add_method(
            "DELETE",
            apigateway.LambdaIntegration(remove_from_cart_lambda),
            authorization_type=apigateway.AuthorizationType.NONE
        )