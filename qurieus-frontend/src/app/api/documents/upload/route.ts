import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";

// Get max files from env or default to 5
const MAX_FILES_PER_UPLOAD = Number(process.env.NEXT_PUBLIC_MAX_FILES) || 5;
// Convert MB to bytes (1 MB = 1024 * 1024 bytes)
const MAX_FILE_SIZE_MB = Number(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB) || 10; // Default 10MB
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[]; // Assuming client sends files under "files" key

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_PER_UPLOAD) {
      return NextResponse.json(
        { error: `Cannot upload more than ${MAX_FILES_PER_UPLOAD} files at a time.` },
        { status: 400 }
      );
    }

    const results = [];
    const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

    for (const file of files) {
      if (!file.name || !file.size || !file.type) {
        results.push({
          fileName: file.name || "unknown file",
          success: false,
          error: "Invalid file data.",
        });
        continue;
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZE_BYTES) {
        results.push({
          fileName: file.name,
          success: false,
          error: `File exceeds the ${MAX_FILE_SIZE_MB}MB size limit.`,
        });
        continue;
      }

      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        results.push({
          fileName: file.name,
          success: false,
          error: "Invalid file type. Only PDF and Word documents are allowed.",
        });
        continue;
      }

      // Check for duplicate filename for this user
      const existingDocument = await prisma.document.findFirst({
        where: {
          userId: userId,
          fileName: file.name,
        },
      });

      if (existingDocument) {
        results.push({
          fileName: file.name,
          success: false,
          error: "A file with this name already exists.",
        });
        continue;
      }

      // Read file content
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create document in database
      try {
        const document = await prisma.document.create({
          data: {
            fileName: file.name,
            originalName: file.name,
            fileType: file.type,
            fileSize: file.size,
            content: buffer.toString("base64"), // Consider if storing full content here is optimal for your backend
            userId: userId,
          },
        });
        results.push({
          fileName: file.name,
          success: true,
          documentId: document.id,
        });
      } catch (dbError) {
        console.error(`Failed to save document ${file.name} to DB:`, dbError);
        results.push({
          fileName: file.name,
          success: false,
          error: "Failed to save document to database.",
        });
      }
    }

    const allSuccessful = results.every(r => r.success);
    const someSuccessful = results.some(r => r.success);

    if (allSuccessful) {
      return NextResponse.json({
        message: "All files uploaded successfully.",
        results,
      });
    } else if (someSuccessful) {
      return NextResponse.json({
        message: "Some files failed to upload.",
        results,
      }, { status: 207 }); // Multi-Status
    } else {
      return NextResponse.json({
        message: "All files failed to upload.",
        results,
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Upload error:", error);
    // Differentiate between form parsing errors and other errors
    if (error instanceof Error && error.message.includes("Unexpected end of form")) {
        return NextResponse.json(
            { error: "Failed to parse form data. The request might be too large or malformed." },
            { status: 413 } // Or 400, but 413 if it's likely due to size
        );
    }
    return NextResponse.json(
      { error: "Failed to process file uploads." },
      { status: 500 }
    );
  }
} 