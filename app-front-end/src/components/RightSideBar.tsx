import React, { useState, forwardRef } from 'react';
import './RightSidebar.css';
import {
  FaHome,
  FaChartBar,
  FaUpload,
  FaShare,
  FaUserShield,
  FaTimes,
  FaSignOutAlt,
} from 'react-icons/fa';
import {
  IoSettings
} from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../services/auth_context'; // Import the auth context

const navItems = [
  { icon: <FaChartBar />, label: 'Analytics' },
  { icon: <FaUpload />, label: 'Import Data' },
  { icon: <IoSettings />, label: 'Settings' },
];

const RightSidebar = forwardRef<HTMLDivElement>((_, ref) => {
  const [selected, setSelected] = useState('Dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth(); // Get the logout function from auth context

  const handleNavigation = (label: string) => {
    setSelected(label);
    setMenuOpen(false);
    switch (label) {
      case 'Analytics':
        navigate('/Analytics');
        break;
      case 'Import Data':
        navigate('/UploadScreen');
        break;
      case 'Settings':
        navigate('/Admin');
        break;
      case 'Logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout(); // Call the logout function from auth context
    navigate('/login'); // Redirect to login page after logout
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
        {/* Logout button for mobile menu */}
        <div
          className="notch-item"
          onClick={() => handleNavigation('Logout')}
        >
          <div className="icon-wrapper">
            <FaSignOutAlt />
            <span className="tooltip">Logout</span>
          </div>
        </div>
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
        {/* Logout button for desktop sidebar */}
        <div
          className="notch-item logout-item"
          onClick={() => handleNavigation('Logout')}
        >
          <div className="icon-wrapper">
            <FaSignOutAlt />
            <span className="tooltip">Logout</span>
          </div>
        </div>
      </div>
    </>
  );
});

export default RightSidebar;