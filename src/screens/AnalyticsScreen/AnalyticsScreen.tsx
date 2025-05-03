import React, { useState, useEffect, useRef } from 'react';
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
import { FiLayers, FiBox, FiPackage } from 'react-icons/fi'; 
import { FaShare } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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

const AnalyticsScreen: React.FC = () => {
  const navigate = useNavigate();
  const headerRef = useRef<HTMLElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [percent, setPercent] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [distincErrors, setdistincErrors] = useState(0);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const targetPercent = 76;
  const errorTarget = 58;
  const distinctErrorTarget = 13;

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
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

  useEffect(() => {
    let p = 0;
    let e = 0;
    let d = 0;
    const interval = setInterval(() => {
      if (p <= targetPercent) setPercent(p++);
      if (e <= errorTarget) setErrorCount(e++);
      if (d <= distinctErrorTarget) setdistincErrors(d++);
      if (p > targetPercent && e > errorTarget && d > distinctErrorTarget) clearInterval(interval);
    }, 15);
    return () => clearInterval(interval);
  }, []);

  const pieData = [
    { name: 'Used', value: percent },
    { name: 'Remaining', value: 100 - percent },
  ];

  const barData = [
    { name: 'F1', errors: 38 },
    { name: 'F2', errors: 45 },
    { name: 'F3', errors: 42 },
    { name: 'CF', errors: errorCount, isCurrent: true },
  ];

  const componentErrorData = [
    { name: 'Battery Pack', errors: 42, percentage: 32 },
    { name: 'Motor Controller', errors: 38, percentage: 29 },
    { name: 'Charging Port', errors: 25, percentage: 19 },
    { name: 'DC Converter', errors: 15, percentage: 11 },
    { name: 'Thermal System', errors: 10, percentage: 8 },
  ];

  const frequentErrorsData = [
    { name: 'Overheating', count: 28, color: '#026DB5' },
    { name: 'Voltage Fluctuation', count: 22, color: '#0285DB' },
    { name: 'Connection Failure', count: 18, color: '#029DFF' },
    { name: 'Short Circuit', count: 15, color: '#02B5FF' },
    { name: 'Calibration Error', count: 12, color: '#02CDFF' },
  ];
  const allErrorsData = [
    { id: 1, component: 'Battery Pack', error: 'Overheating', frequency: 'High' },
    { id: 2, component: 'Motor Controller', error: 'Voltage Fluctuation', frequency: 'Medium' },
    { id: 3, component: 'Charging Port', error: 'Connection Failure', frequency: 'High' },
    { id: 4, component: 'DC Converter', error: 'Short Circuit', frequency: 'Critical' },
    { id: 5, component: 'Thermal System', error: 'Calibration Error', frequency: 'Low' },
    { id: 6, component: 'Battery Pack', error: 'Cell Imbalance', frequency: 'Medium' },
    { id: 7, component: 'Motor Controller', error: 'Signal Noise', frequency: 'Low' },
    { id: 8, component: 'Battery Pack', error: 'Overheating', frequency: 'High' },
    { id: 9, component: 'Charging Port', error: 'Connection Failure', frequency: 'High' },
    { id: 10, component: 'DC Converter', error: 'Short Circuit', frequency: 'Critical' },
  ];

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
                      <span>file_name.csv</span>
                      <span className="file-size">File size: 2.5MB</span>
                      <span className="file-size">Uploaded by: user2</span>
                      <span className="file-size">Date of upload: 12 Jan 2025</span>
                    </div>
                    <div className="export" 
                      onClick={() => navigate('/ExportScreen')}
                    >
                      <FaShare />
                      Export
                    </div>
                    

                  </div>
                <div className="change-file">Change the file</div>
              </div>

              <div className="card file-stats">
                <img src={danger} alt="danger" />
                <span className="stat-card-title">Number of errors</span>
                <span className="stat-card-number">{errorCount}</span>
                <span className="stat-card-subtitle">Errors in total</span>
              </div>

              <div className="card file-stats">
                <img src={danger} alt="danger" />
                <span className="stat-card-title">Distinct errors</span>
                <span className="stat-card-number">{distincErrors}</span>
                <span className="stat-card-subtitle">Distinct errors</span>
              </div>

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
                <span className="stat-card-number">{percent}%</span>
                <span className="stat-card-title">Error rate</span>
              </div>
            </div>
            
            <div className='row-2'>
              <div className="card full-width-bar-chart">
                <div className="card-title center">Error Rate Comparison (Current vs Last 3 Files)</div>
                <ResponsiveContainer width="100%" height={250} className='bar-chart'>
                  <BarChart
                  layout={window.innerWidth <= 546 ? "horizontal" : "vertical"}
                  data={barData}
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
                    {barData.map((entry, index) => (
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
      
        case 'components':
        return (
          <div className="components-grid">
            <div className='components-row-1'>
                <div className="card component-card pie-chart-card">
                <div className="card-title">Error Distribution by Component</div>
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
                    <span className="stat-card-title">Component with Most Errors</span>
                    <span className="stat-card-number">
                      {errorCount}
                      <span className='percent'>times</span>
                    </span>
                    <span className="stat-card-error">Battery Pack</span>
                    <span className="stat-card-subtitle">
                      Frequency:
                      <span className='frequency-high'> High</span>
                    </span>
                </div>
            
                <div className="card file-stats pie-card">
                  <span className="stat-card-title">Component with Most Errors</span>
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
                      {percent}
                      <span className='percent'>%</span>
                    </span>
                    <span className="stat-card-error">Overheating</span>
                </div>
            </div>

            <div className='components-row-2'>
              <div className="card component-card bar-chart-card">
                  <div className="card-title">Top 5 Most Frequent Errors</div>
                    <ResponsiveContainer width="100%" height={250} className='bar-chart'>
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
                <div className="card-title">All Component Errors</div>
                <div className="errors-table-container">
                    <table className="errors-table">
                    <thead>
                        <tr>
                        <th>Component</th>
                        <th>Error</th>
                        <th>Frequency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allErrorsData.map((error) => (
                        <tr key={error.id}>
                            <td>{error.component}</td>
                            <td>{error.error}</td>
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
            <div className='components-row-1'>
                <div className="card component-card pie-chart-card">
                <div className="card-title">Error Distribution by Module</div>
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
                      {errorCount}
                      <span className='percent'>times</span>
                    </span>
                    <span className="stat-card-error">Battery Pack</span>
                    <span className="stat-card-subtitle">
                      Frequency:
                      <span className='frequency-high'> High</span>
                    </span>
                </div>
            
                <div className="card file-stats pie-card">
                  <span className="stat-card-title">Module with Most Errors</span>
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
                      {percent}
                      <span className='percent'>%</span>
                    </span>
                    <span className="stat-card-error">Overheating</span>
                </div>
            </div>

            <div className='components-row-2'>
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
                        <th>Component</th>
                        <th>Error</th>
                        <th>Frequency</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allErrorsData.map((error) => (
                        <tr key={error.id}>
                            <td>{error.component}</td>
                            <td>{error.error}</td>
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
            <FiLayers className='tab-button-icon'/>
            Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'components' ? 'active' : ''}`}
            onClick={() => handleTabClick('components')}
          >
            <FiBox className='tab-button-icon'/>
            Components
          </button>
          <button
            className={`tab-button ${activeTab === 'modules' ? 'active' : ''}`}
            onClick={() => handleTabClick('modules')}
          >
            <FiPackage className='tab-button-icon'/>
            Modules
          </button>
        </div>

        {renderTabContent()}
      </div>
    </>
  );
};

export default AnalyticsScreen;