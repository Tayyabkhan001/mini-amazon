import json
import os
import boto3
import bcrypt
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

# Test the function logic
event = {
    "body": json.dumps({
        "email": "test@example.com",
        "password": "test123",
        "name": "Test User"
    })
}

context = {}

# Simulate the handler
try:
    body = json.loads(event['body'])
    print("Body parsed successfully:", body)

    # Test bcrypt
    hashed = bcrypt.hashpw("test123".encode('utf-8'), bcrypt.gensalt())
    print("Password hashing works:", hashed)

    # Test uuid
    test_uuid = str(uuid.uuid4())
    print("UUID generation works:", test_uuid)

    print("✅ Basic tests passed!")

except Exception as e:
    print("❌ Error:", e)
    import traceback

    traceback.print_exc()
