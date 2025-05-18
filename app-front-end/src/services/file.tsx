import authService from './auth';

export interface FileUploadResponse {
  id: number;
  filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  status: string;
}

export interface UserFile {
  id: number;
  username : string;
  filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  status: string;
}


export interface ProcessingHistory {
  id: number;
  file_id: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  total_samples: number;
  error_rate: number;
  created_at: string;
}

export const uploadFile = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

   // Get the token , let's be explicit
   const token = localStorage.getItem('token');
   if (!token) {
     throw new Error('Authentication token not found');
   }

  try {
    console.log(formData)
    const response = await authService.api.post<FileUploadResponse>(
      '/files/upload/',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

export const getUserFiles = async (): Promise<UserFile[]> => {
  try {
    const response = await authService.api.get<UserFile[]>('/files/recent/');
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Error fetching user files:', error);
    throw error;
  }
};

export const getProcessingHistory = async (fileId?: number): Promise<ProcessingHistory[]> => {
  try {
    const endpoint = `/files/${fileId}/processing-history/` 
      
    
    const response = await authService.api.get<ProcessingHistory[]>(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching processing history:', error);
    throw error;
  }
};
export default {
  uploadFile,
  getUserFiles,
  getProcessingHistory,
};