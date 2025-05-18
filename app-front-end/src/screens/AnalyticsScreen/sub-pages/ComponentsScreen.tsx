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
interface ComponentsScreenProps {
    errorAnalysis: any;
    allPartsErrors: any[];
}

const ComponentsScreen: React.FC<ComponentsScreenProps> = ({
    errorAnalysis,
    allPartsErrors,
}) => {
    const [percent, setPercent] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [componentErrorData, setComponentErrorData] = useState<any[]>([]);
    const [frequentErrorsData, setFrequentErrorsData] = useState<any[]>([]);
    const [mostErrorComponent, setMostErrorComponent] = useState<{name: string, count: number, frequency: string}>({
        name: '',
        count: 0,
        frequency: ''
    });
    const [mostCommonError, setMostCommonError] = useState<{type: string, percentage: number}>({
        type: '',
        percentage: 0
    });
    
  const formattedPartsErrors = React.useMemo(() => {
    const distribution = errorAnalysis?.errorDistributionByPartNumber || {};

    return Object.entries(distribution).map(([component, errorCount], index) => ({
        component,
        error: Number(errorCount),
        frequency: determineFrequency(Number(errorCount))
    }));
}, [errorAnalysis]);

    
    // Helper function to determine frequency level based on error count
    function determineFrequency(count: number): string {
        if (count >= 10) return 'High';
        if (count >= 5) return 'Medium';
        return 'Low';
    }

    useEffect(() => {
        // Process component error data for the pie chart
if (errorAnalysis && errorAnalysis.errorDistributionByPartNumber) {
    const distribution = Object.entries(errorAnalysis.errorDistributionByPartNumber);
    
    // Step 1: Sort by error count descending
    const sorted = distribution.sort();

    // Step 2: Take top 4
    const top = sorted.slice(0, 4);
    const others = sorted.slice(4);

    // Step 3: Calculate total errors
    const total = errorAnalysis.totalErrors || top.reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0)
        + others.reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0);

    // Step 4: Map top 4 with percentage
    const chartData = top.map(([key, value]) => ({
        name: key,
        percentage: total > 0 ? (Number(value) / total) * 100 : 0
    }));

    // Step 5: Sum others
    const othersTotal = others.reduce((sum, [, val]) => sum + (typeof val === 'number' ? val : 0), 0);

    if (othersTotal > 0) {
        chartData.push({
            name: 'Others',
            percentage: total > 0 ? (othersTotal / total) * 100 : 0
        });
    }

    setComponentErrorData(chartData);
}


        // Create frequent errors data for the bar chart
        if (errorAnalysis && errorAnalysis.topPartsWithErrors) {
            const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];
            const formattedData = Object.entries(errorAnalysis.topPartsWithErrors)
                .map(([name, count]: [string, any], index: number) => ({
                    name,
                    count: typeof count === 'number' ? count : 0,
                    color: colors[index % colors.length]
                }));
            setFrequentErrorsData(formattedData);
        }

        // Find the component with most errors
        if (errorAnalysis && errorAnalysis.partWithMostError) {
            const mostError = errorAnalysis.partWithMostError;
            console.log(mostError)
            setMostErrorComponent({
                name: mostError.name,
                count: mostError.count ,
                frequency: determineFrequency(mostError.count)
            });
            console.log(errorAnalysis.totalErrors)
            
            // Start the counter animation
            let e = 0;
            const interval = setInterval(() => {
                if (e <= (mostError.count || 0)) {
                    setErrorCount(e++);
                } else {
                    clearInterval(interval);
                }
            }, 15);
        }

        // Set the most common error type
        if (errorAnalysis) {
            // We'll use the first error type as most common for this example
            const firstErrorType = Object.keys(errorAnalysis.errorDistributionByPartNumber || {})[0];
            const percentage = errorAnalysis.partWithMostError?.percentage || 0;
            
            setMostCommonError({
                type: firstErrorType || 'Unknown',
                percentage: percentage * 100 // Convert to percentage
            });
            
            // Start the percentage counter animation
            let p = 0;
            const targetPercent = Math.round(percentage * 100);
            const interval = setInterval(() => {
                if (p <= targetPercent) {
                    setPercent(p++);
                } else {
                    clearInterval(interval);
                }
            }, 15);
        }
    }, [errorAnalysis]);

    const pieData = [
        { name: 'Used', value: percent },
        { name: 'Remaining', value: 100 - percent },
    ];

    // If data is not loaded yet, show a simple loading indicator
    if (!formattedPartsErrors || !errorAnalysis) {
        return <div className="loading">Loading component data...</div>;
    }

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
                                label={({ percentage }) => `${Math.round(percentage * 100) / 100}%`}
                            >
                                {componentErrorData.map((_entry, index) => (
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
                    <span className="stat-card-error">{mostErrorComponent.name}</span>
                    <span className="stat-card-subtitle">
                        Frequency:
                        <span className={`frequency-${mostErrorComponent.frequency.toLowerCase()}`}> {mostErrorComponent.frequency}</span>
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
                                    <th>Error count</th>
                                    <th>Frequency</th>
                                </tr>
                            </thead>
                            <tbody>
                                {formattedPartsErrors.map((error, index) => (
                                    <tr key={index}>
                                        <td>{error.component}</td>
                                        <td>{error.error }</td>
                                        <td className={`frequency-${(error.frequency || '').toLowerCase().replace(' ', '-')}`}>
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

export default ComponentsScreen;