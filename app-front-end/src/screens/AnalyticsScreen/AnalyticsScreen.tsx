import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import './AnalyticsScreen.css';
import Header from '../../components/Header';
import RightSidebar from '../../components/RightSideBar';
import { FiLayers, FiBox, FiPackage, FiShare2, FiAlertCircle } from 'react-icons/fi';

import { RiPuzzle2Line } from "react-icons/ri";
import{UserFile , ProcessingHistory} from "../../services/file"
import fileProcessingService, { 
  ProcessingResult, 
  FileProcessingStatus
} from '../../services/processing';
import authService from '../../services/auth';
import OverviewScreen from './sub-pages/OverviewScreen';
import ShapesScreen from './sub-pages/ShapesScreen';
import ComponentsScreen from './sub-pages/ComponentsScreen';
import ModulesScreen from './sub-pages/ModulesScreen';
import ExportScreen from './sub-pages/ExportScreen';
import fileService from '../../services/file';

interface AnalyticsUrlParams {
  fileId: string;
  resultId?: string;
}

interface CurrentUser {
  id: number;
  username: string;
  email: string;
}

const AnalyticsScreen: React.FC = () => {
  // Get parameters from both URL params and location state
  const params = useParams<keyof AnalyticsUrlParams>() as AnalyticsUrlParams;
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract fileId and resultId from URL params or state
  const fileId = params.fileId || location.state?.fileId;
  const resultId = params.resultId || location.state?.resultId;
  
  const headerRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // Data states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<UserFile | null>(null);
  const [processingResult, setProcessingResult] = useState<ProcessingResult | null>(null);
  const [formattedData, setFormattedData] = useState<any | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [jobId, setJobId] = useState<number | null>(null);

  const [recentFiles, setRecentFiles] = useState<UserFile[]>([]);
  const [processingHistory, setProcessingHistory] = useState<ProcessingHistory[]>([]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  // Fetch user info
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        // Assuming there's a method to get current user in authService
        const userInfo = await authService.getCurrentUser();
        setCurrentUser(userInfo);
      } catch (err) {
        console.error("Error fetching current user:", err);
        // Not setting an error as this is not critical
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch file and processing results
  useEffect(() => {
    console.log("AnalyticsScreen: Received fileId:", fileId, "resultId:", resultId);
    
    if (!fileId && !resultId) {
      setError("No file ID or result ID provided. Please return to the upload screen.");
      setIsLoading(false);
      return;
    }

    
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // First get file info if we have fileId
        if (fileId) {
          try {
            // Get the file processing status which includes file metadata
            const fileProcessingStatus: FileProcessingStatus = await fileProcessingService.getFileWithProcessing(parseInt(fileId));
            console.log("Fetched file processing:", fileProcessingStatus);
            
            if (fileProcessingStatus.file) {
              setFileInfo(fileProcessingStatus.file);
            } else {
              throw new Error("File not found");
            }
            
            // If we don't have a resultId but have a job in the response, use that job's result
            if (!resultId && fileProcessingStatus.job && fileProcessingStatus.results && fileProcessingStatus.results.length > 0) {
              setJobId(fileProcessingStatus.job.id);
              setProcessingResult(fileProcessingStatus.results[0]);
            }
          } catch (err) {
            console.error("Error fetching file info:", err);
            setError("Failed to load file information");
            setIsLoading(false);
            return;
          }
        }
        
        // If we have a specific resultId, fetch that result directly
        if (resultId) {
          try {
            const result = await fileProcessingService.getProcessingResult(parseInt(resultId));
            console.log("Fetched result by ID:", result);
            console.log(result)
            setProcessingResult(result);
            setJobId(result.job_id);
            
          } catch (err) {
            console.error("Error fetching result by ID:", err);
            setError("Failed to load analysis result");
            setIsLoading(false);
            return;
          }
        } 
        // If we don't have result data yet and have jobId, execute the job
        // else if (jobId) {
        //   try {
        //     const response = await fileProcessingService.executeJob(jobId);
        //     console.log("Executed job:", response);
            
        //     // Create a ProcessingResult from the execution response
        //     const constructedResult: ProcessingResult = {
        //       id: response.result_id,
        //       job_id: response.job_id,
        //       ai_score: response.model_output.model_performance?.accuracy ,
        //       confidence_level: response.model_output.model_performance?.precision,
        //       created_at: new Date().toISOString(),
        //       prediction_data: response.model_output
        //     };
        //     setProcessingResult(constructedResult);
        //   } catch (err) {
        //     console.error("Error executing job:", err);
        //     setError("Failed to process analysis data");
        //     setIsLoading(false);
        //     return;
        //   }
        // }
      } catch (err) {
        console.error("Error in data fetching flow:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fileId, resultId, jobId]);

useEffect(() => {
  const fetchRecentFiles = async () => {
    try {
      const files = await fileService.getUserFiles()
      const recentfiles=files.sort((a, b) => new Date(b.upload_date).getTime() - new Date(a.upload_date).getTime())
        .slice(0, 5);
      setRecentFiles(recentfiles);
    } catch (err) {
      console.error("Error fetching recent files:", err);
      // Not setting error as this is not critical for the main functionality
    }
  };

  fetchRecentFiles();
}, []);

useEffect(() => {
  const fetchProcessingHistory = async () => {
    try {
      let historyData: ProcessingHistory[];
      
      // If we have a specific fileId, fetch history for that file
      if (fileId) {
        historyData = await fileService.getProcessingHistory(parseInt(fileId));
      } else {
        // Otherwise get all recent history
        historyData = await fileService.getProcessingHistory();
      }
      
      console.log("Fetched processing history:", historyData);
      setProcessingHistory(historyData);
    } catch (err) {
      console.error("Error fetching processing history:", err);
      // Not setting error as this is not critical
    }
  };

  if (fileId || recentFiles.length > 0) {
    fetchProcessingHistory();
  }
}, [fileId, recentFiles]);

// Add this function to handle file selection from the dropdown
const handleFileSelect = (file: UserFile) => {

};
  // Format data for display once we have processing results
  useEffect(() => {
   console.log("dataaaaaaaaaa")
      console.log(processingResult)
    if (processingResult) {
      const formatted = fileProcessingService.formatProcessingResultsForDisplay(processingResult);
      console.log("formatted")
      console.log(formatted)

      setFormattedData(formatted);
    }
  }, [processingResult]);

  useEffect(() => {
    const updateLayout = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };

    updateLayout();

    const resizeObserver = new ResizeObserver(updateLayout);
    if (headerRef.current) resizeObserver.observe(headerRef.current);
    if (sidebarRef.current) resizeObserver.observe(sidebarRef.current);

    window.addEventListener('resize', updateLayout);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateLayout);
    };
  }, []);

  // Simulate file download using data from the model_output
  const handleDownload = async (exportType: string) => {
    if (!processingResult) {
      alert('No data available for download');
      return;
    }
    
    try {
      // In a real implementation, we would use the jobId to request a download from the API
      // For now, we'll just create a mock download using data from the prediction_data
      
      let content: string;
      let mimeType: string;
      
      if (exportType.toLowerCase() === 'csv') {
        // Create a simple CSV from some data in the model output
        const headers = ['Shape', 'ErrorCount', 'Percentage'];
        const rows = Object.entries(processingResult.prediction_data.all_shapes_errors || {})
          .slice(0, 10) // Just take first 10 rows for the example
          .map(([shape, count]) => [
            shape, 
            count.toString(), 
            ((count / processingResult.prediction_data.total_errors) * 100).toFixed(2) + '%'
          ]);
        
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        mimeType = 'text/csv';
      } else if (exportType.toLowerCase() === 'excel') {
        // For Excel, we'll just use a CSV as well for this demo
        const headers = ['Shape', 'ErrorCount', 'Percentage'];
        const rows = Object.entries(processingResult.prediction_data.all_shapes_errors || {})
          .slice(0, 10)
          .map(([shape, count]) => [
            shape, 
            count.toString(), 
            ((count / processingResult.prediction_data.total_errors) * 100).toFixed(2) + '%'
          ]);
        
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        mimeType = 'application/vnd.ms-excel';
      } else {
        // JSON export
        content = JSON.stringify(processingResult.prediction_data, null, 2);
        mimeType = 'application/json';
      }
      
      // Create a Blob and trigger download
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `feeder-error-prediction-${processingResult.job_id}.${exportType.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(`Error downloading ${exportType} file:`, err);
      alert(`Failed to download ${exportType} file. Please try again.`);
    }
  };

  const handleViewFile = async () => {
    if (!processingResult) return;
    
    try {
      // Create a simple CSV viewer from the model output data
      const headers = ['Shape', 'ErrorCount', 'Percentage'];
      const rows = Object.entries(processingResult.prediction_data.all_shapes_errors || {})
        .map(([shape, count]) => [
          shape, 
          count.toString(), 
          ((count / processingResult.prediction_data.total_errors) * 100).toFixed(2) + '%'
        ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
      
      // Create a temporary textarea to show the content (in a real app, you'd use a proper viewer component)
      const tempTextarea = document.createElement('textarea');
      tempTextarea.value = csvContent;
      tempTextarea.style.width = '80%';
      tempTextarea.style.height = '400px';
      tempTextarea.style.position = 'fixed';
      tempTextarea.style.top = '10%';
      tempTextarea.style.left = '10%';
      tempTextarea.style.zIndex = '1000';
      
      document.body.appendChild(tempTextarea);
      
      // Add a close button
      const closeBtn = document.createElement('button');
      closeBtn.innerText = 'Close';
      closeBtn.style.position = 'fixed';
      closeBtn.style.top = 'calc(10% - 30px)';
      closeBtn.style.left = '10%';
      closeBtn.style.zIndex = '1001';
      closeBtn.onclick = () => {
        document.body.removeChild(tempTextarea);
        document.body.removeChild(closeBtn);
      };
      
      document.body.appendChild(closeBtn);
    } catch (err) {
      console.error('Error viewing file:', err);
      alert('Failed to retrieve file content. Please try again.');
    }
  };

  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading analysis data...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="error-container">
          <FiAlertCircle size={48} color="#e53935" />
          <h2>Error Loading Data</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      );
    }
    
    if (!processingResult || !formattedData) {
      return (
        <div className="no-data-container">
          <FiAlertCircle size={48} color="#ff9800" />
          <h2>No Analysis Data Available</h2>
          <p>No processing results found for this file.</p>
        </div>
      );
    }
    
    switch (activeTab) {
      case 'overview':
        return <OverviewScreen 
          performanceMetrics={{
            errorCount: formattedData['model_performance']['total_errors'],
            distinctErrors: formattedData['model_performance']['total_errors'], // Using totalErrors as placeholder
            errorRate: formattedData['model_performance']['error_rate'],
            fileName: fileInfo ? fileInfo.filename : "Unknown File",
            fileSize: fileInfo ? fileInfo.file_size : 0,
            uploadedBy: fileInfo ? fileInfo.username : (currentUser ? currentUser.username : "Unknown"),
            uploadDate: fileInfo ? new Date(fileInfo.upload_date).toLocaleDateString() : 
                       new Date(processingResult.created_at).toLocaleDateString()
          }}
           partStats={{
            placedParts: formattedData['total_parts'] || 0,
            uniqueParts: formattedData['unique_part_numbers'] || 0,
            feedersUsed: formattedData['unique_feeder_ids'] || 0,
            topFeeder: formattedData['most_used_feeder_id'] || "N/A",
            partCountPerFeeder: transformToNameCountArray(formattedData['part_number_count_per_feeder'] || {})
          }}
          shapeStats={{
            shapesUsed: formattedData['unique_shapes'] || 0,
            topShape: formattedData['shape_with_most_error'] || "N/A",
            shapeDistribution: transformToNameValueArray(formattedData['shape_distribution'] || {})
          }}
          packageStats={{
            packageTypes: formattedData['unique_package_names'] || 0,
            topPackage: formattedData['most_common_package'] || "N/A",
            feederTypeDistribution: transformToNameCountArray(formattedData['feeder_type_distribution'] || {}),
            tapeWidthDistribution: transformToNameValueArray(formattedData['tape_width_distribution'] || {}),
            packageTypeCounts: transformToNameCountArray(formattedData['package_type_distribution'] || {})
          }}
errorAnalysis={{
            errorRateTimeline: createErrorRateTimeline(formattedData)
          }}        />;
      case 'shapes':
         return <ShapesScreen 
          totalErrors={ formattedData['model_performance']['total_errors']}
          shapeStats={{
            uniqueShapes: formattedData['unique_shapes'] ,
            shapeWithMostError: formattedData['shape_with_most_error'],
            top5ShapesWithErrors: formattedData['top_5_shapes_with_errors'],
            shapeDistribution: formattedData['shape_distribution'] || {}
          }}
          errorAnalysis={{
            totalErrors: formattedData['total_errors'],
            errorRate: formattedData['error_rate'],
            shapeWithMostError: formattedData['shape_with_most_error'],
            topShapesWithErrors: formattedData['top_5_shapes_with_errors'],
            errorDistributionByShape: formattedData['error_distribution_by_shape'] || {}
          }}
          allShapesErrors={Object.entries(formattedData['all_shapes_errors'] || {})}
          shapeDistribution={Object.entries(formattedData['shape_distribution'] || {})}
        />;
 case 'component':
      // Format the all_parts_errors data correctly
      const formattedPartsErrors = Object.entries(formattedData['all_parts_errors'] || {}).map(([component, errorCount]) => {
        const count = Number(errorCount);
        // Determine frequency based on error count
        let frequency = 'Low';
        if (count >= 10) frequency = 'High';
        else if (count >= 5) frequency = 'Medium';
        
        return {
          component,
          error: 'Component Error',
          frequency
        };
      });
      
      // Process error distribution for components if needed
      const errorDistributionByPartNumber = formattedData['error_distribution_by_part_number'] || {};
      
      // Prepare component-specific error analysis object
      const componentErrorAnalysis = {
        totalErrors: formattedData['total_errors'] || 0,
        errorRate: formattedData['error_rate'] || 0,
        partWithMostError: formattedData['part_number_with_most_error'] || { 
          name: 'Unknown', 
          count: 0, 
          percentage: 0 
        },
        topPartsWithErrors: formattedData['top_5_parts_with_errors'] || {},
        errorDistributionByPartNumber: errorDistributionByPartNumber,
        mostCommonErrorType: Object.keys(errorDistributionByPartNumber)[0] || 'Unknown'
      };
      
      return <ComponentsScreen 
        errorAnalysis={componentErrorAnalysis}
        allPartsErrors={formattedPartsErrors}
      />;
      case 'modules':
        return <ModulesScreen 
          moduleErrors={formattedData['top_5_modules_with_errors']}
          allModulesErrors={Object.entries(formattedData['all_modules_errors'] || {})}
          errorDistributionByModule={formattedData['error_distribution_by_module'] || {}}
          //moduleWithMostError={formattedData['module_with_most_error']}
          //totalErrors={formattedData['total_errors']}
        />;
      case 'export':
  if (!processingResult) {
    return (
      <div className="no-data-container">
        <FiAlertCircle size={48} color="#ff9800" />
        <h2>No Analysis Data Available</h2>
        <p>No processing results found for this file.</p>
      </div>
    );
  }
  
  return (
    <ExportScreen 
      resultId={resultId} 
      onViewFile={handleViewFile} 
    />
  );
       
      default:
        return null;
    }
  };
  
  // Helper function to transform object to array of {name, count} format for charts
  const transformToNameCountArray = (obj: Record<string, number>) => {
    return Object.entries(obj).map(([name, count]) => ({
      name,
      count
    }));
  };

  // Helper function to transform object to array of {name, value} format for charts
  const transformToNameValueArray = (obj: Record<string, number>) => {
    return Object.entries(obj).map(([name, value]) => ({
      name,
      value
    }));
  };

  const createErrorRateTimeline = (formattedData: any) => {
  // If we have recent files data, use it for the timeline
  if (recentFiles && recentFiles.length > 0) {
    console.log(recentFiles)
    // Use the actual files data to create the timeline
    return recentFiles.map((file, index) => {
      // For each file, determine if it's the current file
      const isCurrent = fileInfo && file.id === parseInt(fileId);
      
      // Create an error rate - either use the actual rate from the current file
      // or generate a random one for previous files
      const errorRate = isCurrent && formattedData ? 
        formattedData['error_rate'] : 
        Math.floor(Math.random() * 30) + 5;
      
      return {
        name: file.filename,
        errorRate: errorRate,
        uploadDate: new Date(file.upload_date).toLocaleDateString(),
        isCurrent
      };
    });
  }
    // Create a mock timeline if no historical data
    const mockDates = [
      '12 Jan 2025',
      '19 Jan 2025',
      '26 Jan 2025',
      '02 Feb 2025',
      '09 Feb 2025',
      '16 Feb 2025',
      '23 Feb 2025',
      '02 Mar 2025'
    ];
  return mockDates.map((date, index) => {
    const fileName = `File-${index + 1}`;
    const randomErrorRate = Math.floor(Math.random() * 30) + 5;
    const isCurrent = index === mockDates.length - 1;
    const isLast = index === mockDates.length - 2;
    
    return {
      name: fileName,
      errorRate: index === mockDates.length - 1 ? formattedData['error_rate'] : randomErrorRate,
      uploadDate: date,
      isCurrent,
      isLast
    };
  });
};


  return (
    <>
      <Header ref={headerRef} />
      <RightSidebar ref={sidebarRef} />
      <div
        className="analytics-content"
        style={{
          marginTop: `${headerHeight}px`,
          height: `calc(100vh - ${headerHeight}px)`,
        }}
      >
        <div className="page-title">
          Analytics & Statistics
          {fileInfo && (
            <span className="file-info">
              {` - ${fileInfo.filename}`}
            </span>
          )}
          {jobId && !fileInfo && (
            <span className="file-info">
              {` - Job #${jobId}`}
            </span>
          )}
        </div>

        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabClick('overview')}
          >
            <FiLayers className='tab-button-icon' />
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'shapes' ? 'active' : ''}`}
            onClick={() => handleTabClick('shapes')}
          >
            <RiPuzzle2Line className='tab-button-icon shape-icon' />
            Shapes
          </button>
          <button
            className={`tab-button ${activeTab === 'component' ? 'active' : ''}`}
            onClick={() => handleTabClick('component')}
          >
            <FiBox className='tab-button-icon' />
            Component
          </button>
          <button
            className={`tab-button ${activeTab === 'modules' ? 'active' : ''}`}
            onClick={() => handleTabClick('modules')}
          >
            <FiPackage className='tab-button-icon' />
            Modules
          </button>
          <button
            className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => handleTabClick('export')}
          >
            <FiShare2 className='tab-button-icon' />
            Export
          </button>
        </div>

        {renderTabContent()}
      </div>
    </>
  );
};

export default AnalyticsScreen;