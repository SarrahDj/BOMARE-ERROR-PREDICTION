import React, { useState, forwardRef } from 'react';
import './RightSidebar.css';
import {
  FaHome,
  FaChartBar,
  FaUpload,
  FaShare,
  FaUserShield,
  FaTimes
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const navItems = [
  { icon: <FaHome />, label: 'Dashboard' },
  { icon: <FaChartBar />, label: 'Analytics' },
  { icon: <FaUpload />, label: 'Import Data' },
  { icon: <FaShare />, label: 'Export' },
  { icon: <FaUserShield />, label: 'Admin Panel' },
];

const RightSidebar = forwardRef<HTMLDivElement>((_, ref) => {
  const [selected, setSelected] = useState('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (label: string) => {
    setSelected(label);
    setMenuOpen(false);
    switch (label) {
      case 'Dashboard':
        navigate('/dashboard');
        break;
      case 'Analytics':
        navigate('/AnalyticsScreen');
        break;
      case 'Import Data':
        navigate('/UploadScreen');
        break;
      case 'Export':
        navigate('/ExportScreen');
        break;
      case 'Admin Panel':
        navigate('/AdminPanelScreen');
        break;
      default:
        break;
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <div className={`hamburger ${menuOpen ? 'open' : ''}`} onClick={toggleMenu}>
        <div />
        <div />
        <div />
      </div>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <FaTimes className="close-icon" onClick={toggleMenu} />
        {navItems.map((item, index) => (
          <div
            key={index}
            className={`notch-item ${selected === item.label ? 'selected' : ''}`}
            onClick={() => handleNavigation(item.label)}
          >
            <div className="icon-wrapper">
              {item.icon}
              <span className="tooltip">{item.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="notch-sidebar" ref={ref}>
        {navItems.map((item, index) => (
          <div
            key={index}
            className={`notch-item ${selected === item.label ? 'selected' : ''}`}
            onClick={() => handleNavigation(item.label)}
          >
            <div className="icon-wrapper">
              {item.icon}
              <span className="tooltip">{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
});

export default RightSidebar;