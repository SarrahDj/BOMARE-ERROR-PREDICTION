
export interface FileMetadata {
  id: number;
  user: number;
  filename: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  upload_date: string;
  status: 'uploaded' | 'processing' | 'processed' | 'error';
  is_deleted: boolean;
}

export interface ProcessingJob {
  id: number;
  file: number;
  file_name: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}


export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  valid_samples: number;
  total_samples: number;
  nan_samples: number;
}

export interface ErrorSummary {
  TotalRows: number;
  PredictedErrors: number;
  ErrorRate: number;
}

export interface ShapeError {
  ErrorCount: number;
}

export interface ModuleError {
  ErrorCount: number;
  TopErrorPartNumbers: Record<string, number>;
}

export interface ModuleErrorT {
  name: string;
  error: number;
  percentage: number;
 
}

export interface OutputFiles {
  excel: string;
  csv: string;
  json: string;
}

export interface ProcessingResult {
  id: number;
  job_id: number;
  ai_score: number;
  confidence_level: number;
  created_at: string;
  prediction_data: {
    model_performance: ModelPerformance;
    error_summary: ErrorSummary;
    top_shapes: Record<string, ShapeError>;
    top_modules: Record<string, ModuleError>;
    top_error_partnumbers: Record<string, number>;
    output_files: OutputFiles;
  };
}

export interface Export {
  id: number;
  user: number;
  result: number;
  export_type: string;
  created_at: string;
}

export interface JobWithResults {
  job: ProcessingJob;
  results: ProcessingResult[] | null;
}

export interface ExecuteJobResponse {
  status: string;
  job_id: number;
  result_id: number;
  exports: Export[];
  model_output: {
    model_performance: ModelPerformance;
    error_summary: ErrorSummary;
    top_shapes: Record<string, ShapeError>;
    top_modules: Record<string, ModuleError>;
    top_error_partnumbers: Record<string, number>;
    output_files: OutputFiles;
  };
}

export interface FileProcessingStatus {
  file: UserFile;
  job: ProcessingJob | null;
  results: ProcessingResult[] | null;
  exports: Export[] | null;
  isLoading: boolean;
  error: string | null;
}

import authService from './auth';
import { FileUploadResponse, UserFile } from './file';

// Service for handling file processing flows
const fileProcessingService = {
  // Process a file by ID
  processFile: async (fileId: number): Promise<ProcessingJob> => {
    try {
      const response = await authService.api.post<ProcessingJob>(
        `/files/${fileId}/process/`
      );
      return response.data;
    } catch (error) {
      console.error('Error starting file processing:', error);
      throw error;
    }
  },

  // Check job status
  getJobStatus: async (jobId: number): Promise<JobWithResults> => {
    try {
      const response = await authService.api.get<JobWithResults>(
        `/jobs/${jobId}/status/`
      );
      return response.data;
    } catch (error) {
      console.error('Error checking job status:', error);
      throw error;
    }
  },

  // Execute job processing with enhanced response type
  executeJob: async (jobId: number): Promise<ExecuteJobResponse> => {
    try {
      const response = await authService.api.post<ExecuteJobResponse>(
        `/jobs/${jobId}/execute/`
      );
      return response.data;
    } catch (error) {
      console.error('Error executing job:', error);
      throw error;
    }
  },

  // Get exports for a specific processing result
  getResultExports: async (resultId: number): Promise<Export[]> => {
    try {
      const response = await authService.api.get<Export[]>(
        `/results/${resultId}/exports/`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching exports:', error);
      throw error;
    }
  },

  // Fetch file metadata along with its processing status and results
  getFileWithProcessing: async (fileId: number): Promise<FileProcessingStatus> => {
    try {
      // Use the combined endpoint that returns all data at once
      const response = await authService.api.get<FileProcessingStatus>(
        `/files/${fileId}/processing/`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching file processing status:', error);
      throw error;
    }
  },

  // Get detailed processing result by ID
  getProcessingResult: async (resultId: number): Promise<ProcessingResult> => {
    try {
      const response = await authService.api.get<ProcessingResult>(
        `/results/${resultId}/`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching processing result:', error);
      throw error;
    }
  },

  // Download an export file
  downloadExport: async (exportId: number): Promise<Blob> => {
    try {
      const response = await authService.api.get(
        `/exports/${exportId}/download/`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading export:', error);
      throw error;
    }
  },
  
  // Get all processing data in one call (for dashboard or detailed view)
  getCompleteProcessingData: async (fileId: number): Promise<{
    file: UserFile;
    job: ProcessingJob | null;
    results: ProcessingResult[] | null;
    exports: Export[] | null;
    modelOutput: {
      model_performance: ModelPerformance;
      error_summary: ErrorSummary;
      top_shapes: Record<string, ShapeError>;
      top_modules: Record<string, ModuleError>;
      top_error_partnumbers: Record<string, number>;
      output_files: OutputFiles;
    } | null;
  }> => {
    try {
      const response = await authService.api.get(
        `/files/${fileId}/complete-data/`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching complete processing data:', error);
      throw error;
    }
  },

  // Get the content of an export file directly from the backend
getExportFileContent: async (jobId: number): Promise<any> => {
  try {
    // Call the backend API endpoint that returns parsed content
    const response = await authService.api.get<any>(
      `/exports/${jobId}/content/`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting export file content:', error);
    throw error;
  }
}
};

export default fileProcessingService;