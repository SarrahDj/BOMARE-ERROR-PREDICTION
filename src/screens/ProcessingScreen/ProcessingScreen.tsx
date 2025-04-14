// ProcessingScreen.tsx
import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import logo from '../../assets/lo.png';
import check from '../../assets/checkmark.svg'
import './ProcessingScreen.css';
import ProgressBar from '../../components/ProgressBar';
import { FaFileAlt, FaExclamationTriangle, FaChartBar, FaFileExport } from 'react-icons/fa'; // Custom icons for each step
import { useNavigate } from 'react-router-dom';

interface ProcessStep {
  title: string;
  description: string;
  processingTime?: number;
}

const ProcessingScreen = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);

  const steps: ProcessStep[] = [
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
    let timeoutId: NodeJS.Timeout;
    const processStep = (stepIndex: number) => {
      if (stepIndex <= totalSteps) {
        setCurrentStep(stepIndex);

        if (stepIndex < totalSteps) {
          const currentProcessingTime = steps[stepIndex - 1]?.processingTime || 2000;
          timeoutId = setTimeout(() => {
            processStep(stepIndex + 1);
          }, currentProcessingTime);
        } else {
          setTimeout(() => {
            setIsProcessing(false);
            setIsCompleted(true);
            setShowCheckmark(true);
          }, 5000);
        }
      }
    };

    processStep(1);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [totalSteps]);

  const handleCancel = () => {
    const confirmCancel = window.confirm("Are you sure you want to cancel processing? This will take you back to the upload screen.");
    if (confirmCancel) {
      console.log("Redirecting to upload screen...");
    }
  };

  const handleContinue = () => {
    navigate('/ExportScreen');
  };

  return (
    <>
      <Header />
      <div className="processing-screen">
        <div className="page-title-section">
          <h1 className="page-title">Data Processing</h1>
          <span className="page-description">
            {isCompleted 
              ? "Processing complete! Click 'Continue' to view results." 
              : "Your file is being processed. This may take a few moments to complete."}
          </span>
        </div>

        {showCheckmark ? (
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
            className="cancel-button" 
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button 
            className="continue-button"
            onClick={handleContinue}
            disabled={!isCompleted}
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default ProcessingScreen;
