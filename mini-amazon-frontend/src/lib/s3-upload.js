// src/lib/s3-upload.js
export const uploadToS3 = async (file) => {
  try {
    // 1. Get presigned URL from backend
    const response = await fetch('https://sfykc5q529.execute-api.ap-south-1.amazonaws.com/prod/presigned-url');
    const { presignedUrl, publicUrl } = await response.json();

    // 2. Upload file directly to S3
    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadResponse.ok) {
      throw new Error('S3 upload failed');
    }

    // 3. Return the public URL for storing in database
    return publicUrl;

  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error('Failed to upload image');
  }
};