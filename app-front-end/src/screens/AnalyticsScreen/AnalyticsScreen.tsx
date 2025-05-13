import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AnalyticsScreen.css';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import Header from '../../components/Header';
import csv from '../../assets/csv.png';
import danger from '../../assets/danger.png';
import RightSidebar from '../../components/RightSideBar';
import { FaChartLine, FaShare, FaEye } from 'react-icons/fa';
import csvIcon from '../../assets/csv.png';
import excelIcon from '../../assets/excel.png';
import { HiDownload } from 'react-icons/hi';
import { FiLayers, FiBox, FiPackage, FiRefreshCw, FiShare2 } from 'react-icons/fi';
import { UserFile } from '../../services/file';
import { 
  ProcessingJob, 
  ProcessingResult, 
  ErrorSummary, 
  ModuleError, 
  ModuleErrorT,
  ShapeError
} from '../../services/processing';
import fileProcessingService from '../../services/processing';
import fileService from '../../services/file';

const COLORS = ['#026DB5', '#eeeeee'];
const COLORS_COMPONENTS = [
  '#026DB5',
  '#026DB5CF',
  '#026DB5A5',
  '#026DB571',
  '#026DB557',
  '#026DB525',
  '#026DB51B'
];

interface LocationState {
  processingResults: ProcessingResult[] | null;
  processedFile: UserFile | null;
  processedJob: ProcessingJob | null;
}

interface ComponentError {
  name: string;
  errors: number;
  percentage: number;
}

interface FrequentError {
  name: string;
  count: number;
  color: string;
}

interface DetailedError {
  id: number;
  component: string;
  error: string;
  frequency: string;
}

const AnalyticsScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [errorRate, setErrorRate] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);
  const [distinctErrors, setDistinctErrors] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('overview');
  
  // State for processing results
  const [processingResults, setProcessingResults] = useState<ProcessingResult[] | null>(null);
  const [processedFile, setProcessedFile] = useState<UserFile | null>(null);
  const [processedJob, setProcessedJob] = useState<ProcessingJob | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for component and module data
  const [componentErrorData, setComponentErrorData] = useState<ComponentError[]>([]);
  const [moduleErrorData, setmoduleErrorData] = useState<ComponentError[]>([]);

  const [frequentErrorsData, setFrequentErrorsData] = useState<FrequentError[]>([]);
  const [allErrorsData, setAllErrorsData] = useState<DetailedError[]>([]);
  const [exportFileContent, setExportFileContent] = useState<any[]>([]);
  const [topErrorComponent, setTopErrorComponent] = useState<string>('');
  const [topErrorModule, setTopErrorModule] = useState<string>('');
  const [fileComparison, setFileComparison] = useState<any[]>([]);
  
  // Use state data or try to load from API if needed
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.processingResults && state?.processedFile && state?.processedJob) {
      // Use the data passed from processing screen
      setProcessingResults(state.processingResults);
      setProcessedFile(state.processedFile);
      setProcessedJob(state.processedJob);
      setIsLoading(false);
      
      // Calculate metrics based on results
      if (state.processingResults.length > 0) {
        processResultData(state.processingResults[0]);
      }
    } else {
      // If no state, try to get the last processed file
      fetchLastProcessedFile();
    }
  }, [location]);
  
  const fetchLastProcessedFile = async () => {
    try {
      setIsLoading(true);
      const recentFiles = await fileService.getUserFiles();
      
      if (recentFiles && recentFiles.length > 0) {
        // Get the most recent processed file
        const recentFile = recentFiles.find(f => f.status === 'processed');
        
        if (recentFile) {
          // Get the processing details
          const fileProcessing = await fileProcessingService.getFileWithProcessing(recentFile.id);
          
          setProcessedFile(fileProcessing.file);
          setProcessedJob(fileProcessing.job);
          setProcessingResults(fileProcessing.results);
          
          // Calculate metrics based on results
          if (fileProcessing.results && fileProcessing.results.length > 0) {
            processResultData(fileProcessing.results[0]);
          }
          
          // Fetch export file content if job ID is available
          if (fileProcessing.job && fileProcessing.job.id) {
            fetchExportFileContent(fileProcessing.job.id);
          }
        } else {
          setError('No processed files found. Please process a file first.');
        }
      } else {
        setError('No files found. Please upload and process a file first.');
      }
    } catch (err) {
      console.error('Error fetching file data:', err);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const processResultData = (result: ProcessingResult) => {
    if (!result) return;
    
    // Extract data from results
    const aiScore = result.ai_score;
    const predictionData = result.prediction_data;
    
    // Calculate basic metrics
    const errorRateValue = Math.round(predictionData.error_summary.ErrorRate * 100);
    setErrorRate(errorRateValue);
    
    // Get error summary data
    const errorSummary = predictionData.error_summary;
    setTotalErrors(errorSummary.PredictedErrors);
    
    // Calculate distinct errors from top errors
    const topErrors = predictionData.top_error_partnumbers;
    setDistinctErrors(Object.keys(topErrors).length);
    
    // Process component data (from top_shapes)
    processComponentData(predictionData.top_shapes);
    
    // Process module data (from top_modules)
    processModuleData(predictionData.top_modules);
    
    // Generate comparison data for previous files
    generateFileComparisonData(errorRateValue);
  };

  const fetchExportFileContent = async (jobId: number) => {
    try {
      // First get the exports for this result
      const exports = await fileProcessingService.getResultExports(jobId);
      
      // If there are any exports (particularly CSV exports), get the content
      const csvExport = exports.find(exp => exp.export_type === 'csv');
      if (csvExport) {
        const content = await fileProcessingService.getExportFileContent(csvExport.id);
        setExportFileContent(content);
      }
    } catch (err) {
      console.error('Error fetching export file content:', err);
    }
  };
  
  const processComponentData = (topShapes: Record<string, ShapeError>) => {
    // Convert shapes data to component error format
    const componentData: ComponentError[] = [];
    let totalErrors = 0;
    
    // First calculate total errors
    Object.entries(topShapes).forEach(([name, data]) => {
      totalErrors += data.ErrorCount;
    });
    
    // Then create component data with percentages
    Object.entries(topShapes).forEach(([name, data], index) => {
      if (index < 5) { // Only take top 5
        const percentage = Math.round((data.ErrorCount / totalErrors) * 100);
        componentData.push({
          name,
          errors: data.ErrorCount,
          percentage
        });
      }
    });
    
    // Sort by errors (descending)
    componentData.sort((a, b) => b.errors - a.errors);
    setComponentErrorData(componentData);
    
    // Set top error component
    if (componentData.length > 0) {
      setTopErrorComponent(componentData[0].name);
    }
    
    // Generate frequent errors data
    generateFrequentErrorsData(topShapes);
    
    // Generate detailed errors table
    generateDetailedErrorsData(topShapes);
  };
  
  const processModuleData = (topModules: Record<string, ModuleError>) => {
    const moduleData: ComponentError[] = [];

    if (Object.keys(topModules).length > 0) {
      // Find module with most errors
      let maxErrors = 0;
      let topModuleName = '';
      
      Object.entries(topModules).forEach(([name, data]) => {
        if (data.ErrorCount > maxErrors) {
          maxErrors = data.ErrorCount;
          topModuleName = name;
        }
      });

          // Then create component data with percentages
    Object.entries(topModules).forEach(([name, data], index) => {
      if (index < 5) { // Only take top 5
        const percentage = Math.round((data.ErrorCount / totalErrors) * 100);
        moduleData.push({
          name,
          errors: data.ErrorCount,
          percentage
        });
      }
    });

   moduleErrorData.sort((a, b) => b.errors - a.errors);
    setmoduleErrorData(moduleData);
      
      setTopErrorModule(topModuleName);
    }
  };
  
  const generateFrequentErrorsData = (topShapes: Record<string, ShapeError>) => {
    const colors = ['#026DB5', '#0285DB', '#029DFF', '#02B5FF', '#02CDFF'];
    const errors: FrequentError[] = [];
    
    Object.entries(topShapes).forEach(([name, data], index) => {
      if (index < 5) { // Only take top 5
        errors.push({
          name,
          count: data.ErrorCount,
          color: colors[index % colors.length]
        });
      }
    });
    
    // Sort by count (descending)
    errors.sort((a, b) => b.count - a.count);
    setFrequentErrorsData(errors);
  };
  
  const generateDetailedErrorsData = (topShapes: Record<string, ShapeError>) => {
    const detailedErrors: DetailedError[] = [];
    let id = 1;
    
    Object.entries(topShapes).forEach(([shapeName, shapeData]) => {
      // Determine frequency based on error count
      let frequency = 'Low';
      if (shapeData.ErrorCount > 30) {
        frequency = 'Critical';
      } else if (shapeData.ErrorCount > 20) {
        frequency = 'High';
      } else if (shapeData.ErrorCount > 10) {
        frequency = 'Medium';
      }
      
      detailedErrors.push({
        id: id++,
        component: shapeName.split(':')[0] || 'Unknown Component',
        error: shapeName.split(':')[1] || shapeName,
        frequency
      });
    });
    
    // Sort by frequency (Critical first)
    const frequencyOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    detailedErrors.sort((a, b) => {
      return frequencyOrder[a.frequency as keyof typeof frequencyOrder] - 
             frequencyOrder[b.frequency as keyof typeof frequencyOrder];
    });
    
    setAllErrorsData(detailedErrors);
  };
  
  const generateFileComparisonData = (currentErrorRate: number) => {
    // This would ideally come from historical data, but for now we'll simulate it
    const comparisonData = [
      { name: 'F1', errors: Math.round(currentErrorRate * 0.8) },
      { name: 'F2', errors: Math.round(currentErrorRate * 0.95) },
      { name: 'F3', errors: Math.round(currentErrorRate * 0.9) },
      { name: 'CF', errors: currentErrorRate, isCurrent: true },
    ];
    
    setFileComparison(comparisonData);
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleRefresh = () => {
    fetchLastProcessedFile();
  };

  useEffect(() => {
    const updateLayout = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
      if (sidebarRef.current) setSidebarWidth(sidebarRef.current.offsetWidth);
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

  const pieData = [
    { name: 'Used', value: errorRate },
    { name: 'Remaining', value: 100 - errorRate },
  ];

 // If we're still loading or have an error
  if (isLoading) {
    return (
      <>
        <Header ref={headerRef} />
        <RightSidebar ref={sidebarRef} />
        <div
          className="analytics-content"
          style={{
            marginTop: `${headerHeight}px`,
            marginRight: `${sidebarWidth}px`,
            height: `calc(100vh - ${headerHeight}px)`,
            width: `calc(100vw - ${sidebarWidth}px)`
          }}
        >
          <div className="page-title">Analytics & Statistics</div>
          <div className="loading-container">
            <div className="spinner-border"></div>
            <p>Loading analytics data...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header ref={headerRef} />
        <RightSidebar ref={sidebarRef} />
        <div
          className="analytics-content"
          style={{
            marginTop: `${headerHeight}px`,
            marginRight: `${sidebarWidth}px`,
            height: `calc(100vh - ${headerHeight}px)`,
            width: `calc(100vw - ${sidebarWidth}px)`
          }}
        >
          <div className="page-title">Analytics & Statistics</div>
          <div className="error-container">
            <FiRefreshCw size={60} color="#e74c3c" onClick={handleRefresh} style={{ cursor: 'pointer' }} />
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <>
            <div className="row-1">
              <div className="card file-stats">
                <div className="card-title center">File Info</div>
                <div className="left">
                  <img src={csv} alt="CSV" />
                  <div className="file-text">
                    <span>{processedFile?.filename || 'file_name.csv'}</span>
                    <span className="file-size">
                      File size: {processedFile ? 
                        `${(processedFile.file_size / (1024 * 1024)).toFixed(2)}MB` : 
                        '2.5MB'}
                    </span>
                    <span className="file-size">Uploaded by: {processedFile ? 'you' : 'user2'}</span>
                    <span className="file-size">
                      Date of upload: {processedFile ? 
                        new Date(processedFile.upload_date).toLocaleDateString() : 
                        '12 Jan 2025'}
                    </span>
                  </div>
                </div>
              </div>
  
              <div className="card file-stats">
                <img src={danger} alt="danger" />
                <span className="stat-card-title">Number of errors</span>
                <span className="stat-card-number">{totalErrors}</span>
                <span className="stat-card-subtitle">Errors in total</span>
              </div>
  
              {/* <div className="card file-stats">
                <img src={danger} alt="danger" />
                <span className="stat-card-title">Distinct errors</span>
                <span className="stat-card-number">{distinctErrors}</span>
                <span className="stat-card-subtitle">Distinct errors</span>
              </div> */}
  
              <div className="card file-stats pie-card">
                <PieChart width={70} height={70}>
                  <Pie
                    data={pieData}
                    innerRadius={20}
                    outerRadius={30}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    animationDuration={1000}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
                <span className="stat-card-number">{errorRate}%</span>
                <span className="stat-card-title">Error rate</span>
              </div>
            </div>
            
            <div className="row-2">
              <div className="card full-width-bar-chart">
                <div className="card-title center">Error Rate Comparison (Current vs Last 3 Files)</div>
                <ResponsiveContainer width="100%" height={250} className="bar-chart">
                  <BarChart
                    layout={window.innerWidth <= 546 ? "horizontal" : "vertical"}
                    data={fileComparison}
                    margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
                    barCategoryGap={15}
                  >
                    <CartesianGrid stroke="#ddd" vertical={window.innerWidth > 546} horizontal={window.innerWidth <= 546} />
                    <XAxis
                      type={window.innerWidth <= 546 ? "category" : "number"}
                      dataKey={window.innerWidth <= 546 ? "name" : undefined}
                      tickLine={false}
                      tick={{ fontSize: 16, fill: '#4B4B4B' }}
                    />
                    <YAxis
                      type={window.innerWidth <= 546 ? "number" : "category"}
                      dataKey={window.innerWidth > 546 ? "name" : undefined}
                      tickLine={false}
                      tick={{ fontSize: 16, fill: '#4B4B4B' }}
                    />
                    <Tooltip />
                    <defs>
                      <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#026DB5" />
                        <stop offset="100%" stopColor="#0099FFFF" />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="errors"
                      radius={[3, 3, 3, 3]}
                      barSize={20}
                      isAnimationActive={true}
                      animationDuration={1000}
                      fill="url(#gradient1)"
                    >
                      {fileComparison.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.isCurrent ? '#026DB5' : '#0099FFFF'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        );
        
      case 'shapes':
        return (
          <div className="components-grid">
            <div className="components-row-1">
              <div className="card component-card pie-chart-card">
                <div className="card-title">Error Distribution by Shape</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={componentErrorData}
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      dataKey="percentage"
                      label={({ percentage }) => `${percentage}%`}
                    >
                      {componentErrorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    {window.innerWidth > 320 && (
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        wrapperStyle={{
                          fontSize: '12px',
                          paddingLeft: '10px',
                          width: '120px'
                        }}
                        iconSize={10}
                        iconType="circle"
                      />
                    )}
                  </PieChart>
                </ResponsiveContainer>
              </div>
  
              <div className="card file-stats">
                <img src={danger} alt="danger" />
                <span className="stat-card-title">Shape with Most Errors</span>
                <span className="stat-card-number">
                  {componentErrorData.length > 0 ? componentErrorData[0].errors : 0}
                  <span className="percent">times</span>
                </span>
                <span className="stat-card-error">{topErrorComponent}</span>
                <span className="stat-card-subtitle">
                  Frequency:
                  <span className="frequency-high"> High</span>
                </span>
              </div>
              
              <div className="card file-stats pie-card">
                <span className="stat-card-title">Shape Error Rate</span>
                <PieChart width={70} height={70}>
                  <Pie
                    data={pieData}
                    innerRadius={20}
                    outerRadius={30}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    animationDuration={1000}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
                <span className="stat-card-number">
                  {errorRate}
                  <span className="percent">%</span>
                </span>
                <span className="stat-card-error">{frequentErrorsData.length > 0 ? frequentErrorsData[0].name : ""}</span>
              </div>
            </div>
  
            <div className="components-row-2">
              <div className="card component-card bar-chart-card">
                <div className="card-title">Top 5 Most Frequent Errors</div>
                <ResponsiveContainer width="100%" height={250} className="bar-chart">
                  <BarChart
                    data={frequentErrorsData}
                    layout={window.innerWidth < 400 ? "horizontal" : "vertical"}
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    barCategoryGap={15}
                  >
                    <CartesianGrid 
                      horizontal={window.innerWidth >= 400} 
                      vertical={window.innerWidth < 400} 
                      stroke="#f0f0f0" 
                    />
                    <XAxis 
                      type={window.innerWidth < 400 ? "category" : "number"} 
                      dataKey={window.innerWidth < 400 ? "name" : undefined}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 13, fill: '#4B4B4B' }}
                    />
                    <YAxis 
                      type={window.innerWidth < 400 ? "number" : "category"} 
                      dataKey={window.innerWidth >= 400 ? "name" : undefined}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 13, fill: '#4B4B4B' }}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[0, 8, 8, 0]}
                      barSize={20}
                      animationDuration={1500}
                    >
                      {frequentErrorsData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
    
              <div className="card component-card table-card">
                <div className="card-title">All Shape Errors</div>
                <div className="errors-table-container">
                  <table className="errors-table">
                    <thead>
                      <tr>
                        <th>Shape</th>
                        <th>Frequency</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allErrorsData.map((error) => (
                        <tr key={error.id}>
                          <td>{error.component}</td>
                          <td className={`frequency-${error.frequency.toLowerCase().replace(' ', '-')}`}>
                            {error.frequency}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
  
      case 'modules':  
        return (
          <div className="components-grid">
            <div className="components-row-1">
              <div className="card component-card pie-chart-card">
                <div className="card-title">Error Distribution by Module</div>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={moduleErrorData}
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      dataKey="percentage"
                      label={({ percentage }) => `${percentage}%`}
                    >
                      {moduleErrorData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend 
                      layout="vertical" 
                      align="right" 
                      verticalAlign="middle"
                      wrapperStyle={{
                        fontSize: '12px',
                        paddingLeft: '10px',
                        width: '120px'
                      }}
                      iconSize={10}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
  
              <div className="card file-stats">
                <img src={danger} alt="danger" />
                <span className="stat-card-title">Module with Most Errors</span>
                <span className="stat-card-number">
                  {moduleErrorData.length > 0 ? moduleErrorData[0].errors : 0}
                  <span className="percent">times</span>
                </span>
                <span className="stat-card-error">{topErrorModule}</span>
                <span className="stat-card-subtitle">
                  Frequency:
                  <span className="frequency-high"> High</span>
                </span>
              </div>
            
              <div className="card file-stats pie-card">
                <span className="stat-card-title">Module Error Rate</span>
                <PieChart width={70} height={70}>
                  <Pie
                    data={pieData}
                    innerRadius={20}
                    outerRadius={30}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    animationDuration={1000}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
                <span className="stat-card-number">
                  {errorRate}
                  <span className="percent">%</span>
                </span>
                <span className="stat-card-error">Overheating</span>
              </div>
            </div>
  
            <div className="components-row-2">
              <div className="card component-card bar-chart-card">
                <div className="card-title">Top 5 Most Frequent Errors</div>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={frequentErrorsData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                    barCategoryGap={15}
                  >
                    <CartesianGrid horizontal={false} stroke="#f0f0f0" />
                    <XAxis 
                      type="number" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 13, fill: '#4B4B4B' }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 13, fill: '#4B4B4B' }}
                      width={100}
                    />
                    <Tooltip 
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #ddd',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[0, 8, 8, 0]}
                      barSize={20}
                      animationDuration={1500}
                    >
                      {frequentErrorsData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
    
              <div className="card component-card table-card">
                <div className="card-title">All Modules Errors</div>
                <div className="errors-table-container">
                  <table className="errors-table">
                    <thead>
                      <tr>
                        <th>Module</th>
                        <th>Error</th>
                      
                      </tr>
                    </thead>
                    <tbody>
                      {moduleErrorData.map((error) => (
                        <tr key={error.name}>
                          <td>{error.name}</td>
                          <td>{error.errors}</td>
                          {/* <td className={`frequency-${error.frequency.toLowerCase().replace(' ', '-')}`}>
                            {error.frequency}
                          </td> */}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      case 'export':
        return (
          <>
            <div className="view-analytics">
              <FaEye className="analytics-icon" />
              <span>View Results File</span>
            </div>
            <p className="download-description">
              Download a copy of the results of the prediction to share with others
            </p>
            <div className="export-boxes">
              <div className="export-box">
                <div className="icon-and-text-left">
                  <img src={csvIcon} alt="CSV" />
                  <span>Export to CSV</span>
                </div>
                <HiDownload className="download-icon" />
              </div>
  
              <div className="export-box">
                <div className="icon-and-text-left">
                  <img src={excelIcon} alt="Excel" />
                  <span>Export to Excel</span>
                </div>
                <HiDownload className="download-icon" />
              </div>
            </div>
          </>
        ); 
      default:
        return null;
    }
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
        <div className="page-title">Analytics & Statistics</div>
        
        <div className="tabs-container">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => handleTabClick('overview')}
          >
            <FiLayers className="tab-button-icon"/>
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'shapes' ? 'active' : ''}`}
            onClick={() => handleTabClick('shapes')}
          >
            <FiBox className="tab-button-icon"/>
            Shapes
          </button>
          {/* <button
            className={`tab-button ${activeTab === 'components' ? 'active' : ''}`}
            onClick={() => handleTabClick('components')}
          >
            <FiBox className="tab-button-icon"/>
            Components
          </button> */}
          <button
            className={`tab-button ${activeTab === 'modules' ? 'active' : ''}`}
            onClick={() => handleTabClick('modules')}
          >
            <FiPackage className="tab-button-icon"/>
            Modules
          </button>
          <button
            className={`tab-button ${activeTab === 'export' ? 'active' : ''}`}
            onClick={() => handleTabClick('export')}
          >
            <FiShare2 className="tab-button-icon"/>
            Export
          </button>
        </div>
  
        {renderTabContent()}
      </div>
    </>
  );};

  export default AnalyticsScreen;