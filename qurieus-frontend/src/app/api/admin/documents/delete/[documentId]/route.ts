import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';

async function deleteWithModal(userId: string, documentId: string) {
  // Look up the document to get modalDocumentId
  const doc = await prisma.document.findUnique({ where: { id: documentId }, select: { modalDocumentId: true } });
  if (!doc) {
    throw new Error('Document not found');
  }
  const modalApiUrl = process.env.MODAL_DELETE_DOCUMENT_URL;
  if (!modalApiUrl) {
    throw new Error('Modal.com API URL not configured');
  }
  if (!doc.modalDocumentId) {
    // If no modalDocumentId, skip Modal deletion
    return { success: true, message: 'No Modal.com file to delete' };
  }

  const url = `${modalApiUrl}?user_id=${encodeURIComponent(userId)}&document_id=${encodeURIComponent(doc.modalDocumentId)}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Modal.com service error: ${response.status} - ${errorText}`);
  }
  return response.json();
}

async function deleteWithBackend(userId: string, documentId: string) {
  // Delete from database
  const deletedDocument = await prisma.document.deleteMany({
    where: {
      id: documentId,
      userId: userId, // Ensure user owns the document
    },
  });

  if (deletedDocument.count === 0) {
    throw new Error('Document not found or you do not have permission to delete it');
  }

  return {
    success: true,
    message: `Document ${documentId} deleted successfully`,
    documents_remaining: await prisma.document.count({ where: { userId } }),
  };
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const documentId = params.documentId;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Check if using Modal.com persistent storage
    const useModalPersistent = process.env.USE_MODAL_PERSISTENT_STORAGE === 'true';
    const modalApiUrl = process.env.MODAL_DELETE_DOCUMENT_URL;

    let result;
    if (useModalPersistent && modalApiUrl) {
      // Delete with Modal.com
      result = await deleteWithModal(userId, documentId);

      // Also delete from database if it exists
      try {
        await prisma.document.deleteMany({
          where: {
            id: documentId,
            userId: userId,
          },
        });
      } catch (error) {
        // Ignore database errors if document doesn't exist
        console.log('Document not found in database (already deleted or Modal.com only)');
      }
    } else {
      // Delete with backend
      result = await deleteWithBackend(userId, documentId);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        documents_remaining: result.documents_remaining,
      });
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to delete document' },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('Error in unified delete:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the document' },
      { status: 500 }
    );
  }
} 