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
  filename: string;
  file_type: string;
  file_size: number;
  upload_date: string;
  status: string;
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
    return response.data;
  } catch (error) {
    console.error('Error fetching user files:', error);
    throw error;
  }
};

export default {
  uploadFile,
  getUserFiles,
};