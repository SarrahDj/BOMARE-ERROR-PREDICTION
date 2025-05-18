import authService from './auth';
import { FileUploadResponse, UserFile } from './file';

// Define interfaces for the data structures
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
  total_samples: number;
  total_errors: number;
  error_rate: number;
}

export interface ShapeError {
  name?: string;
  count?: number;
  error?: number;
  percentage?: number;
}

export interface PartError {
  name?: string;
  count?: number;
  error?: number;
  percentage?: number;
}

export interface ModuleError {
  name?: string;
  count?: number;
  error?: number;
  percentage?: number;
}

export interface OutputFiles {
  excel: string;
  csv: string;
  json: string;
}

export interface ModelOutput {
  model_performance?: ModelPerformance;
  total_parts: number;
  unique_part_numbers?: number;
  unique_feeder_ids?: number;
  most_used_feeder_id?: string;
  part_number_count_per_feeder?: Record<string, number>;
  unique_shapes?: number;
  shape_distribution?: Record<string, number>;
  most_common_shape?: string | null;
  unique_package_names?: number;
  most_common_package?: string;
  package_type_distribution?: Record<string, number>;
  tape_width_distribution?: Record<string, number>;
  feeder_type_distribution?: Record<string, number>;
  total_errors: number;
  error_rate: number;
  error_distribution_by_shape?: Record<string, number>;
  shape_with_most_error?: string | null;
  top_5_shapes_with_errors?: Record<string, string | ShapeError>;
  all_shapes_errors?: Record<string, number>;
  error_distribution_by_part_number?: Record<string, number>;
  part_number_with_most_error?: {
    name: string;
    count: number;
    percentage: number;
  };
  top_5_parts_with_errors?: Record<string, string | PartError>;
  all_parts_errors: Record<string, number>;
  error_distribution_by_module?: Record<string, number>;
  module_with_most_error?: {
    name: string;
    count: number;
    percentage: number;
  };
  top_5_modules_with_errors?: Record<string, string | ModuleError>;
  all_modules_errors?: Record<string, number>;
  output_files?: OutputFiles;
}

export interface ProcessingResult {
  id: number;
  job_id: number;
  ai_score: number |undefined;
  confidence_level: number |undefined;
  created_at: string;
  prediction_data: ModelOutput;
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
  model_output: ModelOutput;
}

export interface FileProcessingStatus {
  file: UserFile;
  job: ProcessingJob | null;
  results: ProcessingResult[] | null;
  exports: Export[] | null;
  isLoading: boolean;
  error: string | null;
}

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
    modelOutput: ModelOutput | null;
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
  },
  
  // Parse and format processing results for visualization
 formatProcessingResultsForDisplay: (result:any) => {
  console.log("Starting format processing results with:", result);

  // Ensure data exists and provide default values if not
  const data = result[0]["prediction_data"] || {};

  
  console.log("Processing prediction data:", data);
  
  // Safely access nested properties
  const modelPerformance = data['model_performance'] || {
    accuracy: 0,
    precision: 0,
    recall: 0,
    f1_score: 0,
    total_samples: 0,
    total_errors: 0,
    error_rate: 0
  };
  
  console.log("Model performance:", modelPerformance);
  
  // Process top shapes with errors safely
  const topShapesWithErrors = Object.entries(data['top_5_shapes_with_errors'] || {}).map(([name, data]) => {
    console.log(`Processing shape error for ${name}:`, data);
    
    // Handle both string and object types
    if (typeof data === 'string') {
      return {
        name,
        error: parseInt(data, 10) || 0,
        percentage: 0 // We don't have percentage in string format
      };
    } else {
      return {
        name,
        error: (typeof data === 'object' && data !== null) ? (data || data || 0) : 0,
        percentage: (typeof data === 'object' && data !== null) ? (data || 0) : 0
      };
    }
  });

  // Process top parts with errors safely
  const topPartsWithErrors = Object.entries(data['top_5_parts_with_errors'] || {}).map(([name, data]) => {
    // Handle both string and object types
    if (typeof data === 'string') {
      return {
        name,
        error: parseInt(data, 10) || 0,
        percentage: 0 // We don't have percentage in string format
      };
    } else {
      return {
        name,
        error: (typeof data === 'object' && data !== null) ? (data || data || 0) : 0,
        percentage: (typeof data === 'object' && data !== null) ? (data || 0) : 0
      };
    }
  });

  // Process top modules with errors safely
  const topModulesWithErrors = Object.entries(data['top_5_modules_with_errors'] || {}).map(([name, data]) => {
    // Handle both string and object types
    if (typeof data === 'string') {
      return {
        name,
        error: parseInt(data, 10) || 0,
        percentage: 0 // We don't have percentage in string format
      };
    } else {
      return {
        name,
        error: (typeof data === 'object' && data !== null) ? (data || data || 0) : 0,
        percentage: (typeof data === 'object' && data !== null) ? (data || 0) : 0
      };
    }
  });
 
  
  console.log("Formatted result:", data);
  return data;
},

downloadExportByType: async (resultId: number, exportType: string): Promise<Blob> => {
  try {
    const response = await authService.api.get(
      `/results/${resultId}/download/${exportType}/`,
      { responseType: 'blob' }
    );
    return response.data;
  } catch (error) {
    console.error(`Error downloading ${exportType} export:`, error);
    throw error;
  }
}

};

export default fileProcessingService;