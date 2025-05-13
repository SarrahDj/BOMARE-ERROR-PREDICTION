import { useState, useEffect, createContext, useContext } from 'react';
import authService from '../services/auth';
import fileProcessingService from '../services/processing';

// Define types for our context
export interface AnalyticsData {
  file: {
    id: number;
    filename: string;
    file_type: string;
    file_size: number;
    upload_date: string;
    status: string;
  } | null;
  job: {
    id: number;
    status: string;
    started_at: string | null;
    completed_at: string | null;
    error_message: string | null;
  } | null;
  results: {
    id: number;
    job_id: number;
    ai_score: number;
    prediction_data: {
      total_records: number;
      processed_features: string[];
      summary_stats: Record<string, Record<string, number>>;
    };
    confidence_level: number;
    created_at: string;
  }[] | null;
  isLoading: boolean;
  error: string | null;
}

interface ResultsContextType {
  analyticsData: AnalyticsData;
  refreshData: () => Promise<void>;
  errorDetails: string[];
  componentErrors: { component: string; count: number }[];
}

// Create the context
const ResultsContext = createContext<ResultsContextType | null>(null);

// Custom hook to use our context
export const useResults = () => {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error('useResults must be used within a ResultsProvider');
  }
  return context;
};

// Provider component
export default function ResultsProvider({ children }) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    file: null,
    job: null,
    results: null,
    isLoading: true,
    error: null
  });
  
  const [errorDetails, setErrorDetails] = useState<string[]>([]);
  const [componentErrors, setComponentErrors] = useState<{component: string; count: number}[]>([]);

  // Function to fetch data from backend
  const fetchData = async () => {
    try {
      setAnalyticsData(prev => ({ ...prev, isLoading: true }));
      
      // Get the file ID from local storage or other source
      const fileId = localStorage.getItem('currentFileId');
      
      if (!fileId) {
        setAnalyticsData({
          file: null,
          job: null,
          results: null,
          isLoading: false,
          error: 'No file selected for analysis'
        });
        return;
      }
      
      // Fetch processing data for this file
      const processingData = await fileProcessingService.getFileWithProcessing(parseInt(fileId));
      setAnalyticsData(processingData);
      
      // Extract error details if available
      if (processingData.results && processingData.results.length > 0) {
        // In a real app, you would parse this from the actual data
        // This is mocked based on your sample data structure
        const mockErrorDetails = [
          'Overheating detected in Battery Pack',
          'Voltage Fluctuation in Motor Controller',
          'Connection Failure in Charging Port',
          'Short Circuit in DC Converter',
          'Calibration Error in Thermal System'
        ];
        
        const mockComponentErrors = [
          { component: 'Battery Pack', count: 42 },
          { component: 'Motor Controller', count: 38 },
          { component: 'Charging Port', count: 25 },
          { component: 'DC Converter', count: 15 },
          { component: 'Thermal System', count: 10 }
        ];
        
        setErrorDetails(mockErrorDetails);
        setComponentErrors(mockComponentErrors);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      setAnalyticsData({
        file: null,
        job: null,
        results: null,
        isLoading: false,
        error: 'Failed to load analytics data'
      });
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ResultsContext.Provider 
      value={{ 
        analyticsData, 
        refreshData: fetchData,
        errorDetails,
        componentErrors
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
}