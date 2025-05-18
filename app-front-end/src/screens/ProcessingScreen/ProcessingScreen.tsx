import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import ProgressBar from '../../components/ProgressBar';
import { FaFileAlt, FaExclamationTriangle, FaChartBar, FaFileExport } from 'react-icons/fa';
import { UserFile } from '../../services/file';
import { ProcessingJob, ProcessingResult } from '../../services/processing';
import fileProcessingService from '../../services/processing';
import authService from '../../services/auth';
import logo from '../../assets/lo.png';
import check from '../../assets/checkmark.svg';
import './ProcessingScreen.css';
interface ProcessStep {
  title: string;
  description: string;
  processingTime?: number;
}

const ProcessingScreen = () => {
  // Use location state to get the fileId passed during navigation
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract fileId from location state
  const fileId = location.state?.fileId;
  
  const [file, setFile] = useState<UserFile | null>(null);
  const [job, setJob] = useState<ProcessingJob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ProcessingResult[] | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Define the processing steps
  const steps = [
    {
      title: "Format Validation",
      description: "Validating file format and structure...",
      processingTime: 5000
    },
    {
      title: "Error Detection",
      description: "Scanning for system errors and anomalies...",
      processingTime: 5000
    },
    {
      title: "Pattern Analysis",
      description: "Analyzing error patterns and frequencies...",
      processingTime: 5000
    },
    {
      title: "Report Generation",
      description: "Generating detailed analysis report...",
      processingTime: 5000
    }
  ];

  const stepLabels = steps.map(step => step.title);
  const totalSteps = steps.length;

  const stepIcons = [
    FaFileAlt,
    FaExclamationTriangle,
    FaChartBar,
    FaFileExport,
  ];

  useEffect(() => {
    
    // Validate file ID exists and is valid
    if (!fileId) {
      console.error('File ID is missing from location state');
      setError('Missing file ID. Please upload a file first.');
      setIsProcessing(false);
      return;
    }

    const initProcessing = async () => {
      try {
        // First check if processing already exists for this file
        const fileProcessing = await fileProcessingService.getFileWithProcessing(fileId);
        
        setFile(fileProcessing.file);
        setJob(fileProcessing.job);
        setIsProcessing(fileProcessing.isLoading);
        setError(fileProcessing.error);
        setResults(fileProcessing.results);
        
        // If job is completed, update UI state
        if (fileProcessing.job && fileProcessing.job.status === 'completed') {
          setIsCompleted(true);
          setCurrentStep(totalSteps);
          setShowCheckmark(true);
        }
        
        // If no job exists or job failed, start a new processing job
        if (!fileProcessing.job || fileProcessing.job.status === 'failed') {
          const newJob = await fileProcessingService.processFile(fileId);
          setJob(newJob);
          setIsProcessing(true);
          setError(null);
          
          // Execute the job (in production this would be done by backend workers)
          await fileProcessingService.executeJob(newJob.id);
          
          // Start polling for results
          pollForResults(newJob.id);
        }
        // If job is already in progress, poll for results
        else if (fileProcessing.job.status === 'pending' || fileProcessing.job.status === 'processing') {
          pollForResults(fileProcessing.job.id);
        }
      } catch (err) {
        console.error('Error initializing processing:', err);
        setError('Failed to start processing. Please try again.');
        setIsProcessing(false);
      }
    };

    initProcessing();
  }, [fileId, navigate, totalSteps]);

  const pollForResults = (jobId: number) => {
    const interval = setInterval(async () => {
      try {
        const jobDetails = await fileProcessingService.getJobStatus(jobId);
        setJob(jobDetails.job);
        
        if (jobDetails.job.status === 'completed') {
          setResults(jobDetails.results);
          setIsProcessing(false);
          setIsCompleted(true);
          setCurrentStep(totalSteps);
          setShowCheckmark(true);
          clearInterval(interval);
        } else if (jobDetails.job.status === 'failed') {
          setError(jobDetails.job.error_message || 'Processing failed');
          setIsProcessing(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Error polling for results:', err);
        setError('Failed to check processing status');
        setIsProcessing(false);
        clearInterval(interval);
      }
    }, 3000); // Poll every 3 seconds

    // Clean up interval on unmount
    return () => clearInterval(interval);
  };

  // Visual processing animation effect
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isProcessing && !isCompleted) {
      const processStep = (stepIndex: number) => {
        if (stepIndex <= totalSteps) {
          setCurrentStep(stepIndex);

          if (stepIndex < totalSteps) {
            const currentProcessingTime = steps[stepIndex - 1]?.processingTime || 2000;
            timeoutId = setTimeout(() => {
              processStep(stepIndex + 1);
            }, currentProcessingTime);
          }
        }
      };

      processStep(1);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isProcessing, isCompleted, totalSteps, steps]);

  const handleCancel = () => {
    navigate('/UploadScreen'); // Navigate back to dashboard or file list
  };

  const handleContinue = () => {
       const resultId = results && results.length > 0 ? results[0].id : null;
    
    // Pass data via state for consistency instead of URL params
    navigate('/Analytics', { 
      state: { 
        fileId: fileId,
        resultId: resultId
      } 
    });
  };

  return (
    <div>
      <Header />
      <div className="processing-screen">
        <div className="page-title-section">
          <h1 className="page-title">Data Processing</h1>
          <span className="page-description">
            {error ? (
              <span className="error-message">Error: {error}</span>
            ) : isCompleted ? (
              "Processing complete! Click 'Continue' to view results."
            ) : (
              `Processing ${file?.filename || 'your file'}. This may take a few moments to complete.`
            )}
          </span>
        </div>

        {error ? (
          <div className="error-container">
            <FaExclamationTriangle size={60} color="#e74c3c" />
            <p>Processing failed. Please try again or contact support.</p>
          </div>
        ) : showCheckmark ? (
          <div className="checkmark-container">
            <img src={check} alt="Checkmark" height={100}/>
          </div>
        ) : (
          <div className="spinner-wrapper">
            <div className="spinner-border"></div>
            <img src={logo} alt="Logo" className="spinner-logo" />
          </div>
        )}

        <ProgressBar
          steps={totalSteps}
          currentStep={currentStep}
          labels={stepLabels}
          isCompleted={isCompleted}
          icons={stepIcons}
        />
        
        <div className="action-buttons">
          <button 
            className="cancel-button-process" 
            onClick={handleCancel}
          >
            {error || isCompleted ? 'Back' : 'Cancel'}
          </button>
          <button 
            className="continue-button-process"
            onClick={handleContinue}
            disabled={!isCompleted}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;