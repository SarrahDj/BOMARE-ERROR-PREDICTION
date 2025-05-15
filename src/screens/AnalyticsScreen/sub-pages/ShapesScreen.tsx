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
import {
    allErrorsData,
    COLORS,
    COLORS_COMPONENTS,
    componentErrorData,
    distinctErrorTarget,
    errorTarget,
    frequentErrorsData,
    targetPercent
} from '../../../data/mockUploads';

const ShapesScreen: React.FC = () => {

    const [percent, setPercent] = useState(0);
    const [errorCount, setErrorCount] = useState(0);

    useEffect(() => {
        let p = 0;
        let e = 0;
        let d = 0;
        const interval = setInterval(() => {
            if (p <= targetPercent) setPercent(p++);
            if (e <= errorTarget) setErrorCount(e++);
            if (p > targetPercent && e > errorTarget && d > distinctErrorTarget) clearInterval(interval);
        }, 15);
        return () => clearInterval(interval);
    }, []);

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
                                data={componentErrorData}
                                cx="50%"
                                cy="50%"
                                outerRadius={50}
                                dataKey="percentage"
                                label={({ percentage }) => `${percentage}%`}
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
                    <span className="stat-card-title">Shape with Most Errors</span>
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
};

export default ShapesScreen;