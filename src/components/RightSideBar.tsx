import React, { useState } from 'react';
import './RightSidebar.css';
import {
  FaHome,
  FaClock,
  FaChartBar,
  FaRobot,
  FaFileImport,
  FaUsersCog,
  FaUserShield,
} from 'react-icons/fa';

const navItems = [
  { icon: <FaHome />, label: 'Dashboard' },
  { icon: <FaClock />, label: 'Live Monitoring' },
  { icon: <FaChartBar />, label: 'Data Oversight' },
  { icon: <FaRobot />, label: 'Model Management' },
  { icon: <FaFileImport />, label: 'Import Data' },
  { icon: <FaUsersCog />, label: 'Users' },
  { icon: <FaUserShield />, label: 'Admin Panel' },
];

const RightSidebar = () => {
  const [selected, setSelected] = useState('Dashboard');

  return (
    <div className="notch-sidebar">
      {navItems.map((item, index) => (
        <div
          key={index}
          className={`notch-item ${selected === item.label ? 'selected' : ''}`}
          onClick={() => setSelected(item.label)}
        >
          <div className="icon-wrapper">
            {item.icon}
            <span className="tooltip">{item.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RightSidebar;
