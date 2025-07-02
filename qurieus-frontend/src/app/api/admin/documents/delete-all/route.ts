import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';

async function deleteAllWithModal(userId: string) {
  const modalApiUrl = process.env.MODAL_DELETE_ALL_DOCUMENTS_URL;
  if (!modalApiUrl) {
    throw new Error('Modal.com API URL not configured');
  }

  const response = await fetch(modalApiUrl, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.QURIEUS_API_KEY || '',
    },
    body: JSON.stringify({
      user_id: userId,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Modal.com service error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function deleteAllWithBackend(userId: string) {
  // Get count before deletion
  const documentCount = await prisma.document.count({
    where: { userId },
  });

  // Delete all documents from database
  await prisma.document.deleteMany({
    where: { userId },
  });

  return {
    success: true,
    message: `All documents for user ${userId} deleted successfully`,
    documents_deleted: documentCount,
  };
}

export async function DELETE(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check if using Modal.com persistent storage
    const useModalPersistent = process.env.USE_MODAL_PERSISTENT_STORAGE === 'true';
    const modalApiUrl = process.env.MODAL_DELETE_ALL_DOCUMENTS_URL;

    let result;
    if (useModalPersistent && modalApiUrl) {
      // Delete all with Modal.com
      result = await deleteAllWithModal(userId);
      
      // Also delete from database
      try {
        await prisma.document.deleteMany({
          where: { userId },
        });
      } catch (error) {
        // Ignore database errors
        console.log('Error deleting from database (Modal.com only mode)');
      }
    } else {
      // Delete all with backend
      result = await deleteAllWithBackend(userId);
    }

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        documents_deleted: result.documents_deleted,
      });
    } else {
      return NextResponse.json(
        { error: result.message || 'Failed to delete all documents' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in unified delete-all:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting all documents' },
      { status: 500 }
    );
  }
} 