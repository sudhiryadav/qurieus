import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth';
import { getToken } from 'next-auth/jwt';

// Maximum file size (10MB)
// Convert MB to bytes (1MB = 1024 * 1024 bytes)
const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) || 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;


// Allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Default backend URL (fallback if not set in environment)
const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  try {
    // Check if user is authenticated
  const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      );
  }

    // Get the raw JWT token from the session
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET,
      raw: true  // Important: get the raw token string
    });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token not found' },
        { status: 401 }
      );
    }

    // Parse form data with files
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    
    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
  }

    // Validate files
    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File ${file.name} exceeds the ${process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB}MB size limit` },
          { status: 400 }
        );
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File type ${file.type} is not supported` },
          { status: 400 }
        );
      }
    }
    
    // Create a new FormData object to send to the backend
    const backendFormData = new FormData();
    files.forEach(file => {
      backendFormData.append('files', file);
    });
    backendFormData.append('userId', session.user.id);
    backendFormData.append('description', description || '');
    backendFormData.append('category', category || '');
    
    // Make API call to FastAPI backend with the correct endpoint
    const backendResponse = await fetch(`${BACKEND_URL}/api/v1/documents/upload`, {
    method: 'POST',
      body: backendFormData,
    headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!backendResponse.ok) {
      const errorText = await backendResponse.text();
      let errorDetail;
      
      try {
        // Try to parse as JSON
        const errorData = JSON.parse(errorText);
        errorDetail = errorData.detail || backendResponse.statusText;
      } catch (e) {
        // If not JSON, use the raw text
        errorDetail = errorText || backendResponse.statusText;
      }
      
      console.error('Upload error:', errorDetail);
      throw new Error(`Backend API error: ${errorDetail}`);
    }
    
    const data = await backendResponse.json();

    // Return success response with processed files
    const processedFiles = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: processedFiles,
      backendResponse: data
    });
  } catch (error: any) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { error: `Failed to upload files`},
      { status: 500 }
    );
  }
} 