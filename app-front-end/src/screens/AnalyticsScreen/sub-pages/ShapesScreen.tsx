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
import { COLORS1, COLORS_COMPONENTS1 } from '../../../data/mockUploads';

// Define interfaces for our props and data structures
interface ShapeStatsItem {
    name: string;
    count: number;
    errorRate: number;
}

interface AllShapesError {
    id: number;
    shape: string;
    error: string;
    frequency: string;
}

interface ShapeDistributionItem {
    name: string;
    percentage: number;
}

interface ShapesScreenProps {
    totalErrors : number;
    shapeStats?: any;
    errorAnalysis?: any;
    allShapesErrors?: any;
    shapeDistribution?: any; // Changed to any to handle different formats
}

// If no props are passed, use default empty component without errors
const ShapesScreen: React.FC<ShapesScreenProps> = (props) => {
    // Use default values if props are not provided
    const { 
        totalErrors,
        shapeStats = [], 
        errorAnalysis = {}, 
        allShapesErrors = {}, 
        shapeDistribution = [] 
    } = props || {};
    // Colors for charts
    const COLORS = COLORS1;
    const COLORS_COMPONENTS = COLORS_COMPONENTS1;
    
const processShapeDistribution = () => {
    let normalized: { name: string, value: number }[] = [];
    console.log(allShapesErrors)
    // Step 1: Normalize shapeDistribution into an array of { name, value }
    if (Array.isArray(allShapesErrors)) {
        if (Array.isArray(allShapesErrors[0])) {
            normalized = allShapesErrors.map(([name, value]) => ({
                name,
                value: typeof value === 'number' ? value : 0
            }));
        } else if (typeof allShapesErrors[0]?.name === 'string' && typeof allShapesErrors[0]?.percentage === 'number') {
            normalized = allShapesErrors.map(item => ({
                name: item.name,
                value: item.percentage
            }));
        }
    } else if (typeof allShapesErrors === 'object' && allShapesErrors !== null) {
        normalized = Object.entries(allShapesErrors).map(([name, value]) => ({
            name,
            value: typeof value === 'number'
                ? value
                : typeof value === 'object' && value !== null && 'percentage' in value
                ? (value as any).percentage
                : 0
        }));
    }

    // Step 2: Sort descending by value
    normalized.sort((a, b) => b.value - a.value);

    // Step 3: Slice top 4 and sum the rest as "Others"
    const topShapes = normalized.slice(0, 4);
    const otherShapes = normalized.slice(4);
    const othersTotal = otherShapes.reduce((sum, item) => sum + item.value, 0);

    const groupedShapes = [...topShapes];
    if (othersTotal > 0) {
        groupedShapes.push({ name: 'Others', value: othersTotal });
    }

    // Step 4: Recalculate percentages relative to the grouped total
    const groupedTotal = groupedShapes.reduce((sum, item) => sum + item.value, 0);

    const withPercentages = groupedShapes.map(item => ({
        name: item.name,
        percentage: groupedTotal > 0 ? Math.round((item.value / groupedTotal) * 100) : 0
    }));

    return withPercentages;
};



    const [percent, setPercent] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [mostErrorShape, setMostErrorShape] = useState<string>('');
    const [mostCommonError, setMostCommonError] = useState<string>('');

    // Process the data to get top error shapes and errors
    useEffect(() => {
        // Handle case when shapeStats contains shape_with_most_error object
        if (shapeStats && typeof shapeStats === 'object' && shapeStats.shapeWithMostError) {
            if (typeof shapeStats.shapeWithMostError === 'object') {
                // Handle case when shapeWithMostError is an object with name and count
                setMostErrorShape(shapeStats.shapeWithMostError.name || '');
                setErrorCount(shapeStats.shapeWithMostError.count || 0);
                setPercent(Math.round((shapeStats.shapeWithMostError.percentage || 0) * 100));
            } else {
                // Handle case when shapeWithMostError is a string
                setMostErrorShape(shapeStats.shapeWithMostError || '');
                
                // Try to find the count from allShapesErrors
                if (typeof allShapesErrors === 'object' && !Array.isArray(allShapesErrors)) {
                    setErrorCount(allShapesErrors[shapeStats.shapeWithMostError] || 0);
                } else if (Array.isArray(allShapesErrors)) {
                    // Try to find the shape in the allShapesErrors array
                    const shapeEntry = allShapesErrors.find(entry => 
                        Array.isArray(entry) && entry[0] === shapeStats.shapeWithMostError
                    );
                    if (shapeEntry) {
                        setErrorCount(shapeEntry[1] || 0);
                    }
                }
            }
        } else if (errorAnalysis && errorAnalysis.shapeWithMostError) {
            // Try to get data from errorAnalysis if available
            if (typeof errorAnalysis.shapeWithMostError === 'object') {
                setMostErrorShape(errorAnalysis.shapeWithMostError.name || '');
                setErrorCount(errorAnalysis.shapeWithMostError.count || 0);
                setPercent(Math.round((errorAnalysis.shapeWithMostError.percentage || 0) * 100));
            } else {
                setMostErrorShape(errorAnalysis.shapeWithMostError || '');
            }
        }
        
        // Set a default common error if we couldn't determine one
        setMostCommonError('Incorrect Placement');
        
        // If we have total errors, calculate percentage
        if (errorAnalysis && errorAnalysis.totalErrors && errorCount) {
            const errorPercentage = Math.round((errorCount / errorAnalysis.totalErrors) * 100);
            if (!isNaN(errorPercentage)) {
                setPercent(errorPercentage);
            }
        }
    }, [shapeStats, errorAnalysis, allShapesErrors]);

    // Format the data for frequent errors chart
    const frequentErrorsData = React.useMemo(() => {
        // Handle different formats of allShapesErrors
        if (Array.isArray(allShapesErrors) && allShapesErrors.length > 0) {
            // If allShapesErrors is array of [key, value] pairs (from Object.entries)
            if (Array.isArray(allShapesErrors[0])) {
                const topErrors = allShapesErrors
                    .sort((a, b) => (b[1] as number) - (a[1] as number))
                    .slice(0, 5)
                    .map(([name, count], index) => ({
                        name,
                        count: count as number,
                        color: COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]
                    }));
                return topErrors;
            }
            
            // If it's an array of objects with shape, error, frequency properties
            if (typeof allShapesErrors[0] === 'object' && !Array.isArray(allShapesErrors[0])) {
                const errorCounts: {[key: string]: {count: number, color?: string}} = {};
                allShapesErrors.forEach((error: any) => {
                    if (error && error.error) {
                        errorCounts[error.error] = errorCounts[error.error] || {count: 0};
                        errorCounts[error.error].count += 1;
                    }
                });
                
                const sortedErrors = Object.entries(errorCounts)
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 5)
                    .map(([name, data], index) => ({
                        name,
                        count: data.count,
                        color: COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]
                    }));
                    
                return sortedErrors;
            }
        }
        
        // If allShapesErrors is an object with shape names as keys and counts as values
        if (typeof allShapesErrors === 'object' && allShapesErrors !== null && !Array.isArray(allShapesErrors)) {
            const topErrors = Object.entries(allShapesErrors)
                .sort((a, b) => (b[1] as number) - (a[1] as number))
                .slice(0, 5)
                .map(([name, count], index) => ({
                    name,
                    count: count as number,
                    color: COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]
                }));
            return topErrors;
        }
        
        return [];
    }, [allShapesErrors]);

    const pieData = [
        { name: 'Used', value: percent },
        { name: 'Remaining', value: 100 - percent },
    ];

    return (
        <div className="components-grid">
            <div className='components-row-1'>
                <div className="card component-card pie-chart-card">
                    <div className="card-title">Error Distribution by Shape</div>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie
                                data={processShapeDistribution()}
                                cx="50%"
                                cy="50%"
                                outerRadius={50}
                                dataKey="percentage"
                                label={({ percentage }) => `${percentage}%`}
                            >
                                {processShapeDistribution().map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            {typeof window !== 'undefined' && window.innerWidth > 320 && (
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
                        {errorCount}
                        <span className='percent'>times</span>
                    </span>
                    <span className="stat-card-error">{mostErrorShape}</span>
                    <span className="stat-card-subtitle">
                        Frequency:
                        <span className='frequency-high'> High</span>
                    </span>
                </div>

                {/* <div className="card file-stats pie-card">
                    <span className="stat-card-title">Shape with Most Errors</span>
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
                    <span className="stat-card-error">{mostCommonError}</span>
                </div> */}
            </div>

            <div className='components-row-2'>
                <div className="card component-card bar-chart-card">
                    <div className="card-title">Top 5 Most Frequent Errors</div>
                    <ResponsiveContainer width="100%" height={250} className='bar-chart'>
                        <BarChart
                            data={frequentErrorsData}
                            layout={typeof window !== 'undefined' && window.innerWidth < 400 ? "horizontal" : "vertical"}
                            margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                            barCategoryGap={15}
                        >
                            <CartesianGrid
                                horizontal={typeof window === 'undefined' || window.innerWidth >= 400}
                                vertical={typeof window !== 'undefined' && window.innerWidth < 400}
                                stroke="#f0f0f0"
                            />
                            <XAxis
                                type={typeof window !== 'undefined' && window.innerWidth < 400 ? "category" : "number"}
                                dataKey={typeof window !== 'undefined' && window.innerWidth < 400 ? "name" : undefined}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 13, fill: '#4B4B4B' }}
                            />
                            <YAxis
                                type={typeof window === 'undefined' || window.innerWidth >= 400 ? "category" : "number"}
                                dataKey={typeof window === 'undefined' || window.innerWidth >= 400 ? "name" : undefined}
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
                                    <th>Error count</th>
                                    <th>Frequency</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Handle different formats of allShapesErrors */}
                                {Array.isArray(allShapesErrors) ? (
                                    Array.isArray(allShapesErrors[0]) ? (
                                        // Handle case when allShapesErrors is array of arrays (from Object.entries)
                                        allShapesErrors.map(([shape, count], idx) => {
                                            // Determine frequency based on count
                                            let frequency = 'Medium';
                                            if (typeof count === 'number') {
                                                if (count > 10) frequency = 'High';
                                                else if (count < 3) frequency = 'Low';
                                            }
                                            
                                            return (
                                                <tr key={`${shape}-${idx}`}>
                                                    <td>{shape}</td>
                                                    <td>{count}</td>
                                                    <td className={`frequency-${frequency.toLowerCase()}`}>
                                                        {frequency}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        // Handle case when allShapesErrors is array of objects
                                        allShapesErrors.map((error: any, idx: number) => (
                                            error && (
                                                <tr key={error.id || `${error.shape}-${error.error}-${idx}`}>
                                                    <td>{error.shape || 'Unknown'}</td>
                                                    <td>{error.error || 'Unknown'}</td>
                                                    <td className={`frequency-${error.frequency?.toLowerCase().replace(' ', '-') || 'medium'}`}>
                                                        {error.frequency || 'Medium'}
                                                    </td>
                                                </tr>
                                            )
                                        ))
                                    )
                                ) : (
                                    // Handle case when allShapesErrors is an object
                                    Object.entries(allShapesErrors || {}).map(([shape, count], idx) => {
                                        // Determine frequency based on count
                                        let frequency = 'Medium';
                                        if (typeof count === 'number') {
                                            if (count > 10) frequency = 'High';
                                            else if (count < 3) frequency = 'Low';
                                        }
                                        
                                        return (
                                            <tr key={`${shape}-${idx}`}>
                                                <td>{shape}</td>
                                                <td>Placement Error</td>
                                                <td className={`frequency-${frequency.toLowerCase()}`}>
                                                    {frequency}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShapesScreen;