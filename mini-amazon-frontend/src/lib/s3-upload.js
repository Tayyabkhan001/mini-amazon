// src/lib/s3-upload.js
export const uploadToS3 = async (file) => {
  try {
    console.log('🔄 Starting S3 upload for file:', file.name, file.type, file.size);

    // 1. Get presigned URL from backend
    const response = await fetch('https://sfykc5q529.execute-api.ap-south-1.amazonaws.com/prod/presigned-url');

    // Check if presigned URL request failed
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Failed to get presigned URL:', response.status, errorText);
      throw new Error(`Failed to get upload URL: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Presigned URL response:', data);

    // Check if response has the required fields
    if (!data.presignedUrl || !data.publicUrl) {
      console.error('❌ Invalid response format:', data);
      throw new Error('Invalid response from server');
    }

    const { presignedUrl, publicUrl } = data;

    // 2. Upload file directly to S3
    console.log('📤 Uploading to S3 with presigned URL');
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
        'Content-Length': file.size.toString(),
      },
    });

    // Check if S3 upload failed
    if (!uploadResponse.ok) {
      console.error('❌ S3 upload failed:', uploadResponse.status, uploadResponse.statusText);
      throw new Error(`S3 upload failed: ${uploadResponse.status}`);
    }

    console.log('✅ S3 upload successful! Public URL:', publicUrl);
    return publicUrl;

  } catch (error) {
    console.error('💥 S3 upload error details:', error);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
};