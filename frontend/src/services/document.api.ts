import { api, getApiUrl } from '../lib/api';
import { UserDocument } from '../types';

export const documentApi = {
  /**
   * Fetch customer identity / license documents
   */
  getMyDocuments: async (): Promise<UserDocument[]> => {
    const res = await api.get<{ documents: UserDocument[] }>('/users/documents');
    return res.documents;
  },

  /**
   * Upload or replace driving license documents
   */
  uploadDocument: async (formData: FormData): Promise<UserDocument> => {
    const token = localStorage.getItem('driveease_token');
    const response = await fetch(getApiUrl('/users/documents'), {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      body: formData,
    });

    const data = await response.json().catch(() => ({
      success: false,
      message: 'Failed to upload document',
    }));

    if (!response.ok || !data.success) {
      throw new Error(data.error?.message || data.message || 'Upload failed');
    }

    return data.data.document;
  },

  /**
   * Delete uploaded document
   */
  deleteDocument: async (id: string): Promise<void> => {
    return api.delete(`/users/documents/${id}`);
  },

  /**
   * Construct authorized URL for viewing document
   */
  getDocumentFileUrl: (id: string, side: 'front' | 'back' = 'front'): string => {
    return `/api/users/documents/${id}/file?side=${side}`;
  },

  /**
   * Alias for getDocumentFileUrl
   */
  getStreamUrl: (id: string, side: 'front' | 'back' = 'front'): string => {
    return `/api/users/documents/${id}/file?side=${side}`;
  },
};
