import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { prisma } from '@/utils/prismaDB';
import axiosInstance from '@/lib/axios';
import { RequireRoles } from '@/utils/roleGuardsDecorator';
import { UserRole } from '@prisma/client';

async function deleteAllWithModal(userId: string) {
  const modalApiUrl = process.env.MODAL_DELETE_ALL_DOCUMENTS_URL;
  if (!modalApiUrl) {
    throw new Error('Modal.com API URL not configured');
  }

  try {
    const response = await axiosInstance.delete(modalApiUrl, {
      params: {
        user_id: userId,
      },
      headers: {
        'x-api-key': process.env.MODAL_DOT_COM_X_API_KEY || '',
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(`Modal.com service error: ${error.response.status} - ${error.response.data}`);
    } else {
      throw new Error(`Modal.com service error: ${error.message}`);
    }
  }
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

export const DELETE = RequireRoles([UserRole.SUPER_ADMIN])(async (request: NextRequest) => {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    const userId = session!.user!.id;

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
}); 