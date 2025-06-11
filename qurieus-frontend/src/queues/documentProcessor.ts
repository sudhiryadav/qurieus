import Queue from 'bull';
import { prisma } from '@/utils/prismaDB';
import { AnalyticsService } from '@/services/analytics';

const documentQueue = new Queue('document-processing', process.env.REDIS_URL);

documentQueue.process(async (job) => {
  const { documentId, userId } = job.data;

  try {
    // Get document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error('Document not found');
    }

    // Process document (your existing processing logic)
    // ...

    // Initialize analytics for the document
    await prisma.documentAnalytics.create({
      data: {
        documentId,
        views: 0,
        queries: 0,
      },
    });

    return { success: true, documentId };
  } catch (error) {
    console.error('Error processing document:', error);
    throw error;
  }
});

// Add document to processing queue
export async function addDocumentToQueue(documentId: string, userId: string) {
  return documentQueue.add(
    { documentId, userId },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    }
  );
}

// Track document view
export async function trackDocumentView(documentId: string, userId: string) {
  return AnalyticsService.trackDocumentView(documentId, userId);
}

// Track document query
export async function trackDocumentQuery(params: {
  documentId: string;
  query: string;
  response: string;
  responseTime: number;
  userId?: string;
  visitorId?: string;
  success?: boolean;
  error?: string;
}) {
  return AnalyticsService.trackQuery(params);
}

export default documentQueue; 