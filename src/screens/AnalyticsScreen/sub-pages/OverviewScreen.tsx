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
import {
    targetPercent,
    errorTarget,
    distinctErrorTarget,
    errorRateTimelineData,
    COLORS_COMPONENTS,
    COLORS,
} from '../../../data/mockUploads';

interface PopupData {
    title: string;
    description: string;
    data: { name: string; count: number }[];
}

const OverviewScreen: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [showPopup, setShowPopup] = useState(false);
    const [popupData, setPopupData] = useState<PopupData | null>(null);

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

    const [percent, setPercent] = useState(0);
    const [errorCount, setErrorCount] = useState(0);
    const [distincErrors, setdistincErrors] = useState(0);

    const pieData = [
        { name: 'Used', value: percent },
        { name: 'Remaining', value: 100 - percent },
    ];
    
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
                    </div>
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
                            {pieData.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index]} />
                            ))}
                        </Pie>
                    </PieChart>
                    <span className="stat-card-number">{percent}%</span>
                    <span className="stat-card-title">Error rate</span>
                </div>
            </div>

            <div className='row-2'>
                <div className="card full-width-line-chart">
                    <div className="card-title center">Error Rate Trend Across Files</div>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart
                            data={errorRateTimelineData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 30 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                height={50} 
                                tick={(props) => {
                                    const { x, y, payload } = props;
                                    const entry = errorRateTimelineData.find(item => item.name === payload.value);
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
                                    const entry = errorRateTimelineData.find(item => item.name === name);
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
                        <span className="stat-card-number">164</span>
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
                        <span className="stat-card-number">92</span>
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
                        <span className="stat-card-number">45</span>
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
                        <span className="stat-card-error">KT-0800F-180</span>
                        <span className="stat-card-subtitle">Most used feeder ID</span>
                    </div>
                </div>

                <div className="card part-count-chart">
                    <div className="card-title center">Part Count per Feeder</div>
                    <div className='chart-container'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={[
                                    { name: 'KT-0800F-180', count: 58 },
                                    { name: 'KT-1200F-180', count: 32 },
                                    { name: 'KT-2400-380', count: 18 },
                                    { name: 'KT-1600F-380', count: 12 },
                                    { name: 'KT-3200-380', count: 8 },
                                ]}
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
                                    {COLORS_COMPONENTS.map((color, index) => (
                                        <Cell key={`cell-${index}`} fill={color} />
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
                    <span className="stat-card-number">28</span>
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
                                data={[
                                    { name: 'C-0402', value: 35 },
                                    { name: 'R-0402', value: 28 },
                                    { name: 'C-0603', value: 12 },
                                    { name: 'SOT-23', value: 8 },
                                    { name: 'Others', value: 17 },
                                ]}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="value"
                                activeShape={{}}
                                activeIndex={activeIndex ?? undefined}
                                onMouseEnter={(_, index) => setActiveIndex(index)}
                                onMouseLeave={() => setActiveIndex(null)}
                                label
                            >
                                {COLORS_COMPONENTS.map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
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
                    <span className="stat-card-error">C-0402</span>
                    <span className="stat-card-subtitle">Most common shape</span>
                </div>
            </div>

            <div className="row-5">
                <div className="card stat-card">
                    <FaBox className="stat-icon" />
                    <span className="stat-card-title">Package Types</span>
                    <span className="stat-card-number">12</span>
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
                    <span className="stat-card-error">P0802</span>
                    <span className="stat-card-subtitle">Most common package</span>
                </div>

                <div className="card feeder-type-distribution">
                    <div className="card-title center">Feeder Type Distribution</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                { name: 'Paper', count: 42 },
                                { name: 'Emboss', count: 28 },
                                { name: 'Tray', count: 6 },
                            ]}
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
                                {COLORS_COMPONENTS.map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
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
                                data={[
                                    { name: '8mm', value: 65 },
                                    { name: '12mm', value: 20 },
                                    { name: '16mm+', value: 15 },
                                ]}
                                dataKey="value"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                label
                                animationBegin={400}
                                animationDuration={1500}
                                animationEasing="ease-out"
                            >
                                {COLORS_COMPONENTS.map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
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
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="card package-count-chart">
                    <div className="card-title center">Package Type Counts</div>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={[
                                { name: 'P0802', count: 58 },
                                { name: 'E0804', count: 32 },
                                { name: 'E1208', count: 18 },
                                { name: 'P0804', count: 12 },
                                { name: 'Others', count: 8 },
                            ]}
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
                                {COLORS_COMPONENTS.map((color, index) => (
                                    <Cell key={`cell-${index}`} fill={color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
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