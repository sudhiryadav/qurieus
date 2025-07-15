import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth";
import { prisma } from "@/utils/prismaDB";
// @ts-ignore: No type declarations for @qdrant/js-client-rest
import { QdrantClient } from "@qdrant/js-client-rest";

const QDRANT_URL = process.env.QDRANT_URL;
const QDRANT_COLLECTION = process.env.QDRANT_COLLECTION;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

// Initialize Qdrant client with API key if available
const qdrant = new QdrantClient({ 
  url: QDRANT_URL,
  ...(QDRANT_API_KEY && { apiKey: QDRANT_API_KEY })
});

async function deleteVectorsForDocuments(userId: string, documentIds: string[]) {
  try {
    if (!QDRANT_COLLECTION) {
      throw new Error("QDRANT_COLLECTION is not set");
    }
    if (!QDRANT_URL) {
      throw new Error("QDRANT_URL is not set");
    }
    if (!QDRANT_API_KEY) {
      throw new Error("QDRANT_API_KEY is not set");
    }
    for (const docId of documentIds) {
      await qdrant.delete(QDRANT_COLLECTION, {
        filter: {
          must: [
            { key: "user_id", match: { value: userId } },
            { key: "document_id", match: { value: docId } }, // Fixed key name
          ],
        },
      });
      console.log(`Deleted vectors for document ${docId} from Qdrant`);
    }
  } catch (error) {
    console.error(`Error deleting vectors from Qdrant for documents:`, error);
    throw error;
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { documentIds } = await request.json();

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: "No documents selected" },
        { status: 400 }
      );
    }

    // Delete selected documents for the current user
    await deleteVectorsForDocuments(session.user.id, documentIds);
    await prisma.document.deleteMany({
      where: {
        id: {
          in: documentIds,
        },
        userId: session.user.id, // Ensure user owns the documents
      },
    });

    return NextResponse.json({ message: "Selected documents deleted successfully" });
  } catch (error) {
    console.error("Error deleting selected documents:", error);
    return NextResponse.json(
      { error: "Failed to delete selected documents" },
      { status: 500 }
    );
  }
} 