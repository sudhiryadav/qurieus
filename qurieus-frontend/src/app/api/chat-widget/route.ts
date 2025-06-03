import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the component file
    const componentPath = path.join(process.cwd(), 'src/components/ChatWidget/index.tsx');
    const componentCode = fs.readFileSync(componentPath, 'utf-8');

    // Return the component code
    return new NextResponse(componentCode, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });
  } catch (error) {
    console.error('Error serving chat widget:', error);
    return new NextResponse('Error serving chat widget', { status: 500 });
  }
} 