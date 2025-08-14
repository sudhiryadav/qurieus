import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class S3Service {
  private s3Client!: S3Client;
  private bucket!: string | undefined;
  private region!: string | undefined;
  private initialized = false;

  constructor() {
    try {
      this.initializeS3Client();
    } catch (error) {
      console.error('S3 Service: Failed to initialize in constructor:', error);
      // Don't throw here, let it be handled when methods are called
    }
  }

  private initializeS3Client() {
    console.log('S3 Service: Initializing S3 client with environment variables:', {
      AWS_REGION: process.env.AWS_REGION,
      AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.region = process.env.AWS_REGION;
    this.bucket = process.env.AWS_S3_BUCKET;

    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

    if (!accessKeyId || !secretAccessKey) {
      const error = 'AWS credentials not configured';
      console.error('S3 Service:', error);
      throw new Error(error);
    }

    if (!this.bucket) {
      const error = 'AWS S3 bucket not configured';
      console.error('S3 Service:', error);
      throw new Error(error);
    }

    try {
      this.s3Client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });

      this.initialized = true;
      console.log('S3 Service: S3 client initialized successfully', {
        region: this.region,
        bucket: this.bucket
      });
    } catch (error) {
      console.error('S3 Service: Failed to create S3 client:', error);
      throw error;
    }
  }

  async uploadDocument(
    file: Buffer,
    fileName: string,
    contentType: string,
  ): Promise<string> {
    console.log('🔍 S3 Service: uploadDocument called with:', {
      fileName,
      contentType,
      fileSize: file.length,
      initialized: this.initialized
    });
    
    if (!this.initialized) {
      console.log('🔄 S3 Service: Not initialized, calling initializeS3Client...');
      this.initializeS3Client();
    }

    // Create the S3 key with documents/ prefix
    const s3Key = `documents/${fileName}`;
    console.log('📤 S3 Service: Starting upload', {
      bucket: this.bucket,
      key: s3Key,
      fileSize: file.length,
      contentType,
      originalFileName: fileName
    });

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: s3Key,
      Body: file,
      ContentType: contentType,
      ACL: 'private',
    });

    try {
      console.log('🔄 S3 Service: Sending PutObjectCommand to S3...');
      await this.s3Client.send(command);
      console.log('✅ S3 Service: Successfully uploaded', {
        bucket: this.bucket,
        key: s3Key
      });
      return s3Key;
    } catch (error) {
      console.error('❌ S3 Service: Error uploading file', {
        bucket: this.bucket,
        key: s3Key,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      throw error;
    }
  }

  async getDocumentSignedUrl(
    s3Key: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    if (!this.initialized) {
      this.initializeS3Client();
    }

    // Ensure s3Key has documents/ prefix
    const fullKey = s3Key.startsWith('documents/') ? s3Key : `documents/${s3Key}`;

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fullKey,
    });

    return getSignedUrl(this.s3Client, command, { expiresIn });
  }

  async getDocumentAsBuffer(s3Key: string): Promise<Buffer> {
    if (!this.initialized) {
      this.initializeS3Client();
    }

    // Ensure s3Key has documents/ prefix
    const fullKey = s3Key.startsWith('documents/') ? s3Key : `documents/${s3Key}`;

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: fullKey,
    });

    try {
      const response = await this.s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('No body in S3 response');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      const stream = response.Body as any;

      return new Promise((resolve, reject) => {
        stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
      });
    } catch (error) {
      console.error(`Error getting document from S3: ${error}`);
      throw error;
    }
  }

  async deleteDocument(s3Key: string): Promise<void> {
    if (!this.initialized) {
      this.initializeS3Client();
    }

    // Ensure s3Key has documents/ prefix
    const fullKey = s3Key.startsWith('documents/') ? s3Key : `documents/${s3Key}`;

    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: fullKey,
    });

    try {
      await this.s3Client.send(command);
      console.log(`Document deleted from S3 successfully: ${fullKey}`);
    } catch (error) {
      console.error(`Error deleting document from S3: ${error}`);
      throw error;
    }
  }

  generateFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    const baseName = originalName.substring(0, originalName.lastIndexOf('.'));
    // Generate filename in NestJS format: userId_timestamp_randomString_originalName.extension
    // This will be stored directly under documents/ folder in S3
    const fileName = `${userId}_${timestamp}_${randomString}_${baseName}.${extension}`;
    console.log('📝 S3 Service: Generated filename:', { originalName, userId, fileName });
    return fileName;
  }
}

export const s3Service = new S3Service();
export default s3Service;
