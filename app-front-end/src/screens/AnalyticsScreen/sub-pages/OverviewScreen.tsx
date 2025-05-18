import React, { useEffect, useState } from 'react';
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
    Line,
    LineChart
} from 'recharts';
import csv from '../../../assets/csv.png';
import danger from '../../../assets/danger.png';
import { FiInfo } from 'react-icons/fi';
import { FaBox, FaTimes } from 'react-icons/fa';
import { COLORS_COMPONENTS, COLORS } from '../../../data/mockUploads';

interface PopupData {
    title: string;
    description: string;
    data: { name: string; count: number }[];
}

interface OverviewScreenProps {
    performanceMetrics: {
        errorCount: number;
        distinctErrors: number;
        errorRate: number;
        fileName: string;
        fileSize: number;
        uploadedBy: string;
        uploadDate: string;
    };
    partStats: {
        placedParts: number;
        uniqueParts: number;
        feedersUsed: number;
        topFeeder: string;
        partCountPerFeeder: { name: string; count: number }[];
    };
    shapeStats: {
        shapesUsed: number;
        topShape: string;
        shapeDistribution: { name: string; value: number }[];
    };
    packageStats: {
        packageTypes: number;
        topPackage: string;
        feederTypeDistribution: { name: string; count: number }[];
        tapeWidthDistribution: { name: string; value: number }[];
        packageTypeCounts: { name: string; count: number }[];
    };
    errorAnalysis: {
        errorRateTimeline: Array<{
      name: string;
      errorRate: any;
      uploadDate: string;
      isCurrent: boolean | null | undefined;
    }>;
    };
}

const OverviewScreen: React.FC<OverviewScreenProps> = ({
    performanceMetrics,
    partStats,
    shapeStats,
    packageStats,
    errorAnalysis
}) => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState<PopupData | null>(null);
    const [percent, setPercent] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [distincErrors, setDistincErrors] = useState(0);

    const handleOpenPopup = (title: string, description: string) => {
        const sampleData = Array.from({ length: 15 }, (_, i) => ({
            name: `${title.slice(0, 3)}-${1000 + i}`,
            count: Math.floor(Math.random() * 50) + 5
        })).sort((a, b) => b.count - a.count);

        setPopupData({
            title,
            description,
            data: sampleData
        });
        setShowPopup(true);
    };

    // Create pie data for error rate
    const pieData = [
        { name: 'Used', value: percent },
        { name: 'Remaining', value: 100 - percent },
    ];
   
const processedData = () => {
  // Sort descending by value
  const sorted = [...safeShapeDistribution].sort((a, b) => b.value - a.value);

  // Take top 4
  const topFour = sorted.slice(0, 4);

  // Sum the rest
  const otherSum = sorted.slice(4).reduce((acc, cur) => acc + cur.value, 0);

  // Add "Others" only if there is something to group
  if (otherSum > 0) {
    topFour.push({ name: "Others", value: otherSum });
  }

  return topFour;
};
const processedTapeWidthData = () => {
  const sorted = [...safeTapeWidthDistribution].sort((a, b) => b.value - a.value);
  const topFour = sorted.slice(0, 4);
  const otherSum = sorted.slice(4).reduce((acc, cur) => acc + cur.value, 0);
  console.log(topFour)
  if (otherSum > 0) {
    topFour.push({ name: "Others", value: otherSum });
  }

  return topFour;
};

    // Ensure shapeStats data has default values
    const safeShapeDistribution = shapeStats?.shapeDistribution.slice(0,5) || [];
    const safePartCountPerFeeder = partStats?.partCountPerFeeder || [];
    const safeFeederTypeDistribution = packageStats?.feederTypeDistribution || [];
    const safeTapeWidthDistribution = packageStats?.tapeWidthDistribution || [];
    const safePackageTypeCounts = packageStats?.packageTypeCounts || [];
    const safeErrorRateTimeline = errorAnalysis?.errorRateTimeline || [];
    const total = processedData().reduce((sum, item) => sum + item.value, 0);
    useEffect(() => {
        // Initialize values from props
        setPercent(performanceMetrics?.errorRate * 100|| 0);
        setErrorCount(performanceMetrics?.errorCount || 0);
        setDistincErrors(performanceMetrics?.distinctErrors || 0);

    }, [performanceMetrics]);

    console.log("afeShapeDistribution")
    console.log(packageStats)
    return (
        <>
            <div className="row-1">
                <div className="card file-stats">
                    <div className="card-title center">File Info</div>
                    <div className="left">
                        <img src={csv} alt="CSV" />
                        <div className="file-text">
                            <span>{performanceMetrics?.fileName || "file_name.csv"}</span>
                            <span className="file-size">File size: {performanceMetrics?.fileSize || "2.5MB"}</span>
                            <span className="file-size">Uploaded by: {performanceMetrics?.uploadedBy || "user2"}</span>
                            <span className="file-size">Date of upload: {performanceMetrics?.uploadDate || "12 Jan 2025"}</span>
                        </div>
                    </div>
                </div>

                <div className="card file-stats">
                    <img src={danger} alt="danger" />
                    <span className="stat-card-title">Number of errors</span>
                    <span className="stat-card-number">{errorCount}</span>
                    <span className="stat-card-subtitle">Errors in total</span>
                </div>

                {/* <div className="card file-stats">
                    <img src={danger} alt="danger" />
                    <span className="stat-card-title">Distinct errors</span>
                    <span className="stat-card-number">{distincErrors}</span>
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
                            {pieData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                    </PieChart>
                    <span className="stat-card-number">{Math.round(percent) }%</span>
                    <span className="stat-card-title">Error rate</span>
                </div>
            </div>

            <div className='row-2'>
                <div className="card full-width-line-chart">
                    <div className="card-title center">Error Rate Trend Across Files</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={safeErrorRateTimeline}
                            margin={{ top: 20, right: 20, left: 0, bottom: 30 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                height={50} 
                                tick={(props) => {
                                    const { x, y, payload } = props;
                                    const entry = safeErrorRateTimeline.find(item => item.name === payload.value);
                                    return (
                                        <text x={x} y={y} fill="#4B4B4B" fontSize={"1.2rem"} textAnchor="middle">
                                            <tspan x={x} dy="1em">{payload.value}</tspan>
                                            <tspan x={x} dy="1.2em" fontSize={"1rem"} fill="#9D9D9DFF">{entry?.uploadDate}</tspan>
                                        </text>
                                    );
                                }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: '#4B4B4B', fontSize: 12 }}
                                label={{
                                    value: 'Error Rate (%)',
                                    angle: -90,
                                    position: 'insideLeft',
                                    fill: '#4B4B4B',
                                    fontSize: 12,
                                    offset: 15
                                }}
                            />
                            <Tooltip
                                formatter={(value: number) => [`${value}%`, 'Error Rate']}
                                labelFormatter={(name) => {
                                    const entry = safeErrorRateTimeline.find(item => item.name === name);
                                    return [
                                        `File: ${name}`,
                                        `Uploaded: ${entry?.uploadDate}`,
                                        entry?.isCurrent ? '(Last Upload)' : ''
                                    ].filter(Boolean).join('\n');
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="errorRate"
                                stroke="#026DB5"
                                strokeWidth={3}
                                dot={(props) => {
                                    const { cx, cy, payload } = props;
                                    return (
                                        <g>
                                            <circle
                                                cx={cx}
                                                cy={cy}
                                                r={6}
                                                fill={payload.isCurrent ? '#026DB5' : payload.isLast ? '#FFA500' : '#0099FFFF'}
                                                stroke="#fff"
                                                strokeWidth={2}
                                            />
                                            {payload.isLast && (
                                                <circle
                                                    cx={cx}
                                                    cy={cy}
                                                    r={8}
                                                    fill="none"
                                                    stroke="#FFA500"
                                                    strokeWidth={2}
                                                />
                                            )}
                                        </g>
                                    );
                                }}
                                activeDot={{
                                    r: 8,
                                    fill: '#026DB5',
                                    stroke: '#fff',
                                    strokeWidth: 2
                                }}
                                animationDuration={1500}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="row-3">
                <div className="stats-grid">
                    <div className="card stat-card">
                        <FaBox className="stat-icon" />
                        <span className="stat-card-title">Placed Parts</span>
                        <span className="stat-card-number">{partStats?.placedParts || 0}</span>
                        <span className="stat-card-subtitle">Total placed components</span>
                        <FiInfo
                            className="info-icon"
                            onClick={() => handleOpenPopup(
                                "Placed Parts",
                                "Distribution of all placed components across different part numbers"
                            )}
                        />
                    </div>

                    <div className="card stat-card">
                        <FaBox className="stat-icon" />
                        <span className="stat-card-title">Unique Parts</span>
                        <span className="stat-card-number">{partStats?.uniqueParts || 0}</span>
                        <span className="stat-card-subtitle">Unique part numbers</span>
                        <FiInfo
                            className="info-icon"
                            onClick={() => handleOpenPopup(
                                "Unique Parts",
                                "Frequency distribution of unique part numbers used in the assembly"
                            )}
                        />
                    </div>

                    <div className="card stat-card">
                        <FaBox className="stat-icon" />
                        <span className="stat-card-title">Feeders Used</span>
                        <span className="stat-card-number">{partStats?.feedersUsed || 0}</span>
                        <span className="stat-card-subtitle">Unique feeder IDs</span>
                        <FiInfo
                            className="info-icon"
                            onClick={() => handleOpenPopup(
                                "Feeders Used",
                                "Distribution of components across different feeder types"
                            )}
                        />
                    </div>

                    <div className="card stat-card">
                        <FaBox className="stat-icon" />
                        <span className="stat-card-title">Top Feeder</span>
                        <span className="stat-card-error">{partStats?.topFeeder || "N/A"}</span>
                        <span className="stat-card-subtitle">Most used feeder ID</span>
                    </div>
                </div>

                <div className="card part-count-chart">
                    <div className="card-title center">Part Count per Feeder</div>
                    <div className='chart-container'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={safePartCountPerFeeder}
                                layout="vertical"
                                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" fontSize={"1.2rem"} />
                                <YAxis dataKey="name" type="category" width={100} fontSize={"1.2rem"} />
                                <Tooltip />
                                <Bar
                                    dataKey="count"
                                    fill="#026DB5"
                                    animationBegin={100}
                                    animationDuration={1500}
                                    animationEasing="ease-out"
                                >
                                    {safePartCountPerFeeder.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="row-4">
                <div className="card stat-card">
                    <FaBox className="stat-icon" />
                    <span className="stat-card-title">Shapes Used</span>
                    <span className="stat-card-number">{shapeStats?.shapesUsed || 0}</span>
                    <span className="stat-card-subtitle">Unique shape names</span>
                    <FiInfo
                        className="info-icon"
                        onClick={() => handleOpenPopup(
                            "Shapes Used",
                            "Frequency distribution of different component shapes"
                        )}
                    />
                </div>

                <div className="card shape-distribution">
                    <div className="card-title center">Shape Distribution</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={processedData()}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                activeShape={{}}
                                activeIndex={activeIndex ?? undefined}
                                onMouseEnter={(_, index) => setActiveIndex((index * 100)) }
                                onMouseLeave={() => setActiveIndex(null)}
                                label= {({ percent }) => `${(percent * 100).toFixed(1)}%`} 
                            >
                                {safeShapeDistribution.map((_, index) => (
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

                <div className="card stat-card">
                    <FaBox className="stat-icon" />
                    <span className="stat-card-title">Top Shape</span>
                    <span className="stat-card-error">{shapeStats.topShape['name']}</span>
                    <span className="stat-card-subtitle">Most common shape</span>
                </div>
            </div>

            <div className="row-5">
                <div className="card stat-card">
                    <FaBox className="stat-icon" />
                    <span className="stat-card-title">Package Types</span>
                    <span className="stat-card-number">{packageStats?.packageTypes || 0}</span>
                    <span className="stat-card-subtitle">Unique package names</span>
                    <FiInfo
                        className="info-icon"
                        onClick={() => handleOpenPopup(
                            "Package Types",
                            "Distribution of different package types used in the assembly"
                        )}
                    />
                </div>

                <div className="card stat-card">
                    <FaBox className="stat-icon" />
                    <span className="stat-card-title">Top Package</span>
                    <span className="stat-card-error">{packageStats?.topPackage || "N/A"}</span>
                    <span className="stat-card-subtitle">Most common package</span>
                </div>

                <div className="card feeder-type-distribution">
                    <div className="card-title center">Feeder Type Distribution</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={safeFeederTypeDistribution}
                            margin={{ top: 0, right: 30, left: 20, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={"1rem"} />
                            <YAxis fontSize={"1rem"} />
                            <Tooltip />
                            <Bar
                                dataKey="count"
                                fill="#026DB5"
                                animationBegin={300}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            >
                                {safeFeederTypeDistribution.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="row-6">
                <div className="card tape-width-distribution">
                    <div className="card-title center">Tape Width Distribution</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={processedTapeWidthData()}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                label={({ name, value }) => `${((value ) * 100).toFixed(1)}%`}
                                animationBegin={400}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            >
                                {processedTapeWidthData().map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]} />
                                ))}
                            </Pie>
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
                            <Tooltip formatter={(value: number) => `${((value / total) * 100).toFixed(1)}%`}/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* <div className="card package-count-chart">
                    <div className="card-title center">Package Type Counts</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={safePackageTypeCounts}
                            margin={{ top: 0, right: 30, left: 40, bottom: 10 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={"1rem"} />
                            <YAxis fontSize={"1rem"} />
                            <Tooltip />
                            <Bar
                                dataKey="count"
                                fill="#026DB5"
                                animationBegin={500}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            >
                                {safePackageTypeCounts.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div> */}
            </div>

            {showPopup && popupData && (
                <div className="popup-overlay" onClick={() => setShowPopup(false)}>
                    <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                        <div className="popup-header">
                            <h3>{popupData.title} Details</h3>
                            <button className="popup-close" onClick={() => setShowPopup(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className="popup-body">
                            <p className="popup-description">{popupData.description}</p>
                            <div className="popup-chart-container">
                                <div className="chart-wrapper">
                                    <ResponsiveContainer width="100%" height={400}>
                                        <BarChart
                                            data={popupData.data}
                                            layout="vertical"
                                            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" />
                                            <YAxis
                                                dataKey="name"
                                                type="category"
                                                width={80}
                                                tick={{ fontSize: 12 }}
                                            />
                                            <Tooltip />
                                            <Legend />
                                            <Bar
                                                dataKey="count"
                                                fill="#026DB5"
                                                name="Count"
                                                animationDuration={1500}
                                            >
                                                {popupData.data.map((_entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={COLORS_COMPONENTS[index % COLORS_COMPONENTS.length]}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
    
};


export default OverviewScreen;