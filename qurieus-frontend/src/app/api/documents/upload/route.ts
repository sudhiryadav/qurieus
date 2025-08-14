import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
import { logger } from "@/lib/logger";
import s3Service from "@/lib/s3";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  // Debug: Log all environment variables at the start
  console.log("🔍 Document Upload API: Environment check", {
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV
  });
  
  logger.info("Document Upload API: Environment check", {
    AWS_REGION: process.env.AWS_REGION,
    AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT_SET',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV
  });
  
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      logger.warn("Document Upload API: No authenticated session found");
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;

    if (!file) {
      logger.warn("Document Upload API: No file provided", { userId });
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedMimes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
    ];

    if (!allowedMimes.includes(file.type)) {
      logger.warn("Document Upload API: Invalid file type", { 
        userId, 
        fileType: file.type,
        fileName: file.name 
      });
      return NextResponse.json(
        { error: "Invalid file type" },
        { status: 400 }
      );
    }

    // Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      logger.warn("Document Upload API: File too large", { 
        userId, 
        fileSize: file.size,
        maxSize 
      });
      return NextResponse.json(
        { error: "File size exceeds 20MB limit" },
        { status: 400 }
      );
    }

    console.log("🚀 Document Upload API: Starting upload", { 
      userId, 
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type 
    });
    
    logger.info("Document Upload API: Starting upload", { 
      userId, 
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type 
    });

    // Log S3 configuration for debugging
    console.log("⚙️ Document Upload API: S3 Configuration", {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });
    
    logger.info("Document Upload API: S3 Configuration", {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY
    });

    let uploadedFileUrl: string | null = null;
    let createdDocument: any = null;

    try {
      // Generate unique filename using S3 service
      const fileName = s3Service.generateFileName(file.name, userId);
      
      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to S3 using the s3Service
      console.log("📤 Document Upload API: Attempting S3 upload", { 
        userId, 
        fileName,
        bufferSize: buffer.length 
      });
      
      logger.info("Document Upload API: Attempting S3 upload", { 
        userId, 
        fileName,
        bufferSize: buffer.length 
      });
      
      try {
        console.log("🔄 Document Upload API: Calling s3Service.uploadDocument...");
        uploadedFileUrl = await s3Service.uploadDocument(buffer, fileName, file.type);
        console.log("✅ Document Upload API: S3 upload completed", { 
          userId, 
          fileName,
          uploadedFileUrl 
        });
        logger.info("Document Upload API: S3 upload completed", { 
          userId, 
          fileName,
          uploadedFileUrl 
        });
      } catch (s3Error) {
        console.error("❌ Document Upload API: S3 upload failed", { 
          userId, 
          fileName,
          error: s3Error instanceof Error ? s3Error.message : String(s3Error),
          stack: s3Error instanceof Error ? s3Error.stack : undefined
        });
        logger.error("Document Upload API: S3 upload failed", { 
          userId, 
          fileName,
          error: s3Error instanceof Error ? s3Error.message : String(s3Error),
          stack: s3Error instanceof Error ? s3Error.stack : undefined
        });
        throw s3Error;
      }

      logger.info("Document Upload API: File uploaded to S3", { 
        userId, 
        fileName,
        s3Key: uploadedFileUrl 
      });

      // Generate document ID in Next.js to ensure consistency
      const documentId = crypto.randomUUID();
      
      // Create document record in database with the generated document ID
      createdDocument = await prisma.document.create({
        data: {
          id: documentId, // Use the generated document ID
          title: title || file.name,
          description: description || '',
          fileName: fileName,
          originalName: file.name,
          fileType: file.type,
          fileSize: file.size,
          category: category || 'General',
          fileUrl: uploadedFileUrl,
          userId: userId,
          status: 'PROCESSING',
        },
      });

      logger.info("Document Upload API: Document record created", { 
        userId, 
        documentId: createdDocument.id,
        title: createdDocument.title 
      });

      // Process document using AI service (FastAPI)
      try {
        const aiFormData = new FormData();
        const fileBlob = new Blob([buffer], { type: file.type });
        aiFormData.append('files', fileBlob, file.name);
        aiFormData.append('userId', userId);
        aiFormData.append('documentIds', JSON.stringify([documentId])); // Pass as JSON array
        if (description) {
          aiFormData.append('description', description);
        }

        const aiServiceUrl = process.env.BACKEND_URL;
        const aiApiKey = process.env.BACKEND_API_KEY;

        if (!aiServiceUrl || !aiApiKey) {
          logger.warn("Document Upload API: AI service not configured", { userId });
          throw new Error("AI service not configured");
        }

        const response = await fetch(
          `${aiServiceUrl}/api/v1/documents/upload`,
          {
            method: 'POST',
            headers: {
              'X-API-Key': aiApiKey,
            },
            body: aiFormData,
          },
        );

        if (!response.ok) {
          const errorText = await response.text();
          logger.error("Document Upload API: AI service error", { 
            userId, 
            status: response.status, 
            error: errorText 
          });
          throw new Error(`AI service error: ${response.status} - ${errorText}`);
        }

        const result = await response.json() as {
          processing_status: string;
          documents: Array<{
            document_id: string;
            status: string;
            chunks?: number;
            content?: string;
          }>;
        };

        // Check if processing is in background
        if (result.processing_status === 'BACKGROUND') {
          const documentInfo = result.documents[0];

          logger.info("Document Upload API: Processing started in background", {
            userId,
            documentId: createdDocument.id,
            aiDocumentId: documentInfo.document_id,
            status: documentInfo.status,
          });

          // Update the document with processing status
          await prisma.document.update({
            where: { id: createdDocument.id },
            data: {
              aiDocumentId: documentInfo.document_id,
              qdrantDocumentId: documentId, // Use the generated document ID for Qdrant
              status: 'PROCESSING',
            },
          });

          logger.info("Document Upload API: Document processing started", {
            userId,
            documentId: createdDocument.id,
            aiDocumentId: documentInfo.document_id,
          });
        } else {
          // Handle synchronous processing
          const documentInfo = result.documents[0];

          logger.info("Document Upload API: Document processed synchronously", {
            userId,
            documentId: documentInfo.document_id,
            chunks: documentInfo.chunks,
            contentLength: documentInfo.content?.length || 0,
          });

          // Update the document with processing information
          await prisma.document.update({
            where: { id: createdDocument.id },
            data: {
              aiDocumentId: documentInfo.document_id,
              qdrantDocumentId: documentId, // Use the generated document ID for Qdrant
              content: documentInfo.content,
              status: 'PROCESSED',
              isProcessed: true,
              processedAt: new Date(),
            },
          });

          logger.info("Document Upload API: Document processing completed", {
            userId,
            documentId: createdDocument.id,
            chunks: documentInfo.chunks,
            contentLength: documentInfo.content?.length || 0,
          });
        }
      } catch (error) {
        logger.error("Document Upload API: Error processing document with AI service", { 
          userId, 
          error: error instanceof Error ? error.message : String(error) 
        });
        // Don't fail the upload if processing fails, but log it
        // The document will still be available for download
      }

      const responseTime = Date.now() - startTime;
      logger.info("Document Upload API: Upload completed successfully", { 
        userId, 
        documentId: createdDocument.id,
        responseTime 
      });

      return NextResponse.json({ 
        success: true,
        document: createdDocument,
        message: "Document uploaded successfully" 
      });

    } catch (error) {
      logger.error("Document Upload API: Error during upload", { 
        userId, 
        error: error instanceof Error ? error.message : String(error) 
      });

      // Rollback: Clean up any created resources
      if (createdDocument) {
        try {
          logger.info("Document Upload API: Rolling back document record", { userId });
          await prisma.document.delete({
            where: { id: createdDocument.id },
          });
        } catch (rollbackError) {
          logger.error("Document Upload API: Failed to rollback document record", { 
            userId, 
            error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError) 
          });
        }
      }

      if (uploadedFileUrl) {
        try {
          logger.info("Document Upload API: Rolling back S3 file", { userId });
          await s3Service.deleteDocument(uploadedFileUrl);
        } catch (rollbackError) {
          logger.error("Document Upload API: Failed to rollback S3 file", { 
            userId, 
            error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError) 
          });
        }
      }

      throw error;
    }

  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    logger.error("Document Upload API: Upload failed", { 
      error: error.message, 
      responseTime,
      stack: error.stack 
    });
    
    return NextResponse.json(
      { error: "Failed to upload document" },
      { status: 500 }
    );
  }
}

