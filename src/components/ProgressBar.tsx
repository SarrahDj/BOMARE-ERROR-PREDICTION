import React, { useState, useEffect, useRef } from 'react';
import './ProgressBar.css';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  steps: number;
  currentStep: number;
  labels?: string[];
  icons: React.ElementType[];
  onComplete?: () => void;
  isCompleted?: boolean;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
   
  currentStep = 1, 
  labels = [],
  steps = labels.length, 
  icons,
  onComplete,
  isCompleted = false 
}) => {
  const [animatedStep, setAnimatedStep] = useState(currentStep);
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    if (currentStep > prevStepRef.current) {
      setAnimatedStep(currentStep);
      if (currentStep === steps && onComplete) {
        onComplete();
      }
    }
    prevStepRef.current = currentStep;
  }, [currentStep, steps, onComplete]);

  const renderSteps = () => {
    const stepsArray = [];
  
    for (let i = 1; i <= steps; i++) {
      const isStepCompleted = i < currentStep || (isCompleted && i === steps);
      const isStepCurrent = i === currentStep && !isCompleted;
      const stepStatus = isStepCompleted ? 'completed' : isStepCurrent ? 'active' : 'inactive';
      const IconComponent = icons[i - 1];
  
      stepsArray.push(
        <div key={i} className={`progress-step ${stepStatus}`}>
          <div className="step-indicator">
            {isStepCompleted ? (
              <Check size={24} color="#1976d2" strokeWidth={3} />
            ) : (
              <IconComponent size={24} color={isStepCurrent || i > currentStep  ? "#FFFFFFFF" : "#1976d2"} />
            )}
          </div>
          {labels[i - 1] && (
            <div className="step-label">
              <h3>Step {i}</h3>
              <p>{labels[i - 1]}</p>
            </div>
          )}
        </div>
      );

      if (i < steps) {
        const lineIsCompleted = i < currentStep;
        stepsArray.push(
          <div
            key={`line-${i}`}
            className={`progress-line ${lineIsCompleted ? 'completed' : 'inactive'}`}
          />
        );
      }
    }
  
    return stepsArray;
  };
  
  

  return (
    <div className="progress-bar-container">
      <div className="progress-bar">
        {renderSteps()}
      </div>
    </div>
  );
};

export default ProgressBar;
