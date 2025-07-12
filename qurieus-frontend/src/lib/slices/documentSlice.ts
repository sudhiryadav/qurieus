import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  status: 'uploading' | 'uploaded' | 'failed' | 'processing';
}

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: Record<string, number>;
  selectedDocument: string | null;
}

const initialState: DocumentState = {
  documents: [],
  isLoading: false,
  error: null,
  uploadProgress: {},
  selectedDocument: null,
};

export const documentSlice = createSlice({
  name: 'document',
  initialState,
  reducers: {
    setDocuments: (state, action: PayloadAction<Document[]>) => {
      state.documents = action.payload;
      state.error = null;
    },
    addDocument: (state, action: PayloadAction<Document>) => {
      state.documents.push(action.payload);
    },
    removeDocument: (state, action: PayloadAction<string>) => {
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
    },
    updateDocumentStatus: (state, action: PayloadAction<{ id: string; status: Document['status'] }>) => {
      const doc = state.documents.find(d => d.id === action.payload.id);
      if (doc) {
        doc.status = action.payload.status;
      }
    },
    setUploadProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      state.uploadProgress[action.payload.id] = action.payload.progress;
    },
    setSelectedDocument: (state, action: PayloadAction<string | null>) => {
      state.selectedDocument = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setDocuments, 
  addDocument, 
  removeDocument, 
  updateDocumentStatus,
  setUploadProgress,
  setSelectedDocument,
  setLoading, 
  setError, 
  clearError 
} = documentSlice.actions;

export default documentSlice.reducer; 