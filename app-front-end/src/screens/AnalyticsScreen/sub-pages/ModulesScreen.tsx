import React, { useState, useEffect } from 'react';
import '../AnalyticsScreen.css';
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
  Legend,
} from 'recharts';
import danger from '../../../assets/danger.png';
import { COLORS, COLORS_COMPONENTS } from '../../../data/mockUploads';

// Define the prop types for the component
interface ModulesScreenProps {
  moduleErrors: any;
  allModulesErrors: any;
  errorDistributionByModule: any;
}

const ModulesScreen: React.FC<ModulesScreenProps> = ({
  moduleErrors,
  allModulesErrors,
  errorDistributionByModule
}) => {
  const [percent, setPercent] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [moduleErrorDistribution, setModuleErrorDistribution] = useState<any[]>([]);
  const [frequentErrorsData, setFrequentErrorsData] = useState<any[]>([]);
  const [mostErrorModule, setMostErrorModule] = useState<{name: string, count: number, frequency: string}>({
    name: '',
    count: 0,
    frequency: ''
  });
  const [mostCommonError, setMostCommonError] = useState<{type: string, percentage: number}>({
    type: '',
    percentage: 0
  });

  useEffect(() => {
    // Process module error distribution data for the pie chart
    if (errorDistributionByModule) {
      // Calculate total errors
      const totalErrors = Object.values(errorDistributionByModule).reduce((a: number, b) => a + (b as number), 0);
      
      const formattedData = Object.entries(errorDistributionByModule)
        .map(([key, value]: [string, any]) => ({
          name: key,
          value: value,
          percentage: Math.round((value / totalErrors) * 100)
        }));
      setModuleErrorDistribution(formattedData);
    }

    // Process top 5 module errors for the bar chart
    if (moduleErrors) {
      const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
      
      // Transform the data based on the format
      const formattedData = Object.entries(moduleErrors).map(([moduleName, count], index) => ({
        name: moduleName,
        count: count as number,
        color: colors[index % colors.length]
      }));
      
      setFrequentErrorsData(formattedData);
      
      // Find the module with most errors (first item after sorting)
      if (formattedData.length > 0) {
        const sortedData = [...formattedData].sort((a, b) => b.count - a.count);
        const topModule = sortedData[0];
        
        // Set the most error module info
        setMostErrorModule({
          name: topModule.name,
          count: topModule.count,
          frequency: topModule.count > 50 ? 'High' : topModule.count > 20 ? 'Medium' : 'Low'
        });
        
        // Start the counter animation
        let e = 0;
        const targetCount = topModule.count;
        const interval = setInterval(() => {
          if (e <= targetCount) {
            setErrorCount(e++);
          } else {
            clearInterval(interval);
          }
        }, 15);
      }
    }

    // Find the most common error type across all modules
    if (errorDistributionByModule) {
      const totalErrors = Object.values(errorDistributionByModule).reduce((a: number, b) => a + (b as number), 0);
      const sortedEntries = Object.entries(errorDistributionByModule).sort((a, b) => (b[1] as number) - (a[1] as number));
      
      if (sortedEntries.length > 0) {
        const [topErrorType, count] = sortedEntries[0];
        const percentage = Math.round((count as number) / totalErrors * 100);
        
        setMostCommonError({
          type: topErrorType,
          percentage: percentage
        });
        
        // Start the percentage counter animation
        let p = 0;
        const interval = setInterval(() => {
          if (p <= percentage) {
            setPercent(p++);
          } else {
            clearInterval(interval);
          }
        }, 15);
      }
    }
  }, [moduleErrors, errorDistributionByModule]);

  const pieData = [
    { name: 'Used', value: percent },
    { name: 'Remaining', value: 100 - percent },
  ];

  // Format the module errors for the table
  const formattedAllModulesErrors = React.useMemo(() => {
    if (!allModulesErrors) return [];
    
    // If allModulesErrors is already an array of objects, return it
    if (Array.isArray(allModulesErrors) && !Array.isArray(allModulesErrors[0])) {
      return allModulesErrors;
    }
    
    // Transform data to the required format
    return Object.entries(errorDistributionByModule).map(([moduleName, errorCount]) => {
      // Determine frequency level based on count
      let frequency = 'Low';
      if ((errorCount as number) > 50) frequency = 'High';
      else if ((errorCount as number) > 20) frequency = 'Medium';
      
      return {
        module: moduleName,
        error: errorCount, // Generic error type
        frequency: frequency
      };
    });
  }, [allModulesErrors, errorDistributionByModule]);

  // If data is not loaded yet, show a simple loading indicator
  if (!allModulesErrors || !moduleErrors) {
    return <div className="loading">Loading module data...</div>;
  }

  return (
    <div className="components-grid">
      <div className='components-row-1'>
        <div className="card component-card pie-chart-card">
          <div className="card-title">Error Distribution by Module</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={moduleErrorDistribution}
                cx="50%"
                cy="50%"
                outerRadius={50}
                dataKey="value"
                label={({ percentage }) => `${percentage}%`}
              >
                {moduleErrorDistribution.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value} errors`, name]}/>
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
          <span className="stat-card-title">Module with Most Errors</span>
          <span className="stat-card-number">
            {errorCount}
            <span className='percent'>times</span>
          </span>
          <span className="stat-card-error">{mostErrorModule.name}</span>
          <span className="stat-card-subtitle">
            Frequency:
            <span className={`frequency-${mostErrorModule.frequency.toLowerCase()}`}> {mostErrorModule.frequency}</span>
          </span>
        </div>

        {/* <div className="card file-stats pie-card">
          <span className="stat-card-title">Most Common Error</span>
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
              {pieData.map((_entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
          </PieChart>
          <span className="stat-card-number">
            {percent}
            <span className='percent'>%</span>
          </span>
          <span className="stat-card-error">{mostCommonError.type}</span>
        </div> */}
      </div>

      <div className='components-row-2'>
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
                formatter={(value) => [`${value} errors`, 'Count']}
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
                  <th>Frequency</th>
                </tr>
              </thead>
              <tbody>
                {formattedAllModulesErrors.map((error, index) => (
                  <tr key={index}>
                    <td>{error.module || 'Unknown'}</td>
                    <td>{error.error || 'Module Error'}</td>
                    <td className={`frequency-${(error.frequency || 'medium').toLowerCase().replace(' ', '-')}`}>
                      {error.frequency || 'Medium'}
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
};

export default ModulesScreen;