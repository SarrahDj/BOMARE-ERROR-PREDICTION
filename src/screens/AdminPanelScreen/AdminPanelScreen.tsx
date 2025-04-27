import React, { useState, useEffect, useRef } from 'react';
import Header from '../../components/Header';
import RightSideBar from '../../components/RightSideBar';
import { 
  FiUsers, 
  FiUpload, 
  FiCpu, 
  FiClock,
  FiEdit,
  FiKey,
  FiTrash,
  FiSearch,
  FiDownload, 
} from 'react-icons/fi';
import { 
  FaCog, 
  FaEdit, 
  FaTrash, 
  FaKey, 
  FaEllipsisV,
  FaArrowLeft,
  FaSearch,
  FaDownload,
  FaFilter,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import './AdminPanelScreen.css';
import csv from '../../assets/csv.png';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
}

interface File {
  id: number;
  name: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  status: string;
}

interface Log {
  id: number;
  event: string;
  user: string;
  organization: string;
  timestamp: string;
}

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastEvaluated: string;
  version: string;
  deploymentDate: string;
}

interface SystemConfig {
  allowedFileTypes: string[];
  maxFileSize: string;
  userRegistration: string;
  sessionTimeout: number;
  enableFeedbackForm: boolean;
  logRetentionDays: number;
}

const AdminPanel: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(0);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [currentSection, setCurrentSection] = useState<string>('users');
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [popupContent, setPopupContent] = useState<string>('');
  const [popupTitle, setPopupTitle] = useState<string>('');
  const [popupHistory, setPopupHistory] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{key: string, direction: string} | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);


  const generateMockData = () => {
    const arabicNames = ['Ahmed', 'Mohamed', 'Youssef', 'Ali', 'Omar', 'Khaled', 'Bilal', 'Samir', 'Karim', 'Adel'];
    const roles = ['Admin', 'Engineer', 'Read-only'];
    const statuses = ['Active', 'Inactive'];
    const organizations = ['System Admin', 'Engineering', 'Support'];
    const fileStatuses = ['Processed', 'Processing', 'Failed'];
    
    // Generate random date within last 30 days
    const randomDate = (daysBack: number) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
      return date;
    };

    // Users
    const users: User[] = Array.from({length: 5}, (_, i) => ({
      id: i + 1,
      name: arabicNames[Math.floor(Math.random() * arabicNames.length)],
      email: `${arabicNames[Math.floor(Math.random() * arabicNames.length)].toLowerCase()}@example.com`,
      role: roles[Math.floor(Math.random() * roles.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      lastLogin: randomDate(30).toISOString().replace('T', ' ').substring(0, 16)
    }));

    // Files
    const files: File[] = Array.from({length: 5}, (_, i) => ({
      id: i + 1,
      name: `components_config_${randomDate(30).toISOString().split('T')[0]}.${['txt', 'csv', 'json', 'xlsx'][Math.floor(Math.random() * 4)]}`,
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      uploadedBy: arabicNames[Math.floor(Math.random() * arabicNames.length)],
      uploadDate: randomDate(30).toISOString().replace('T', ' ').substring(0, 16),
      status: fileStatuses[Math.floor(Math.random() * fileStatuses.length)]
    }));

    // System logs
    const logEvents = [
      'User login',
      'File uploaded',
      'Password reset',
      'User invited',
      'Configuration changed',
      'System maintenance'
    ];
    
    const systemLogs: Log[] = Array.from({length: 10}, (_, i) => ({
      id: i + 1,
      event: logEvents[Math.floor(Math.random() * logEvents.length)],
      user: Math.random() > 0.3 ? arabicNames[Math.floor(Math.random() * arabicNames.length)] : 'System',
      organization: organizations[Math.floor(Math.random() * organizations.length)],
      timestamp: randomDate(7).toISOString().replace('T', ' ').substring(0, 16)
    }));

    // Model metrics
    const modelMetrics: ModelMetrics = {
      accuracy: Math.random() * 10 + 90,
      precision: Math.random() * 10 + 90,
      recall: Math.random() * 10 + 90,
      f1Score: Math.random() * 10 + 90,
      lastEvaluated: randomDate(30).toISOString().split('T')[0],
      version: `1.0.${Math.floor(Math.random() * 5)}`,
      deploymentDate: randomDate(90).toISOString().split('T')[0]
    };

    // System config
    const systemConfig: SystemConfig = {
      allowedFileTypes: ['.csv', '.json', '.xml'],
      maxFileSize: '10 MB',
      userRegistration: 'Admin invitation only',
      sessionTimeout: 30,
      enableFeedbackForm: Math.random() > 0.5,
      logRetentionDays: 90
    };

    return { users, files, systemLogs, modelMetrics, systemConfig };
  };

  const { users: initialUsers, files: initialFiles, systemLogs: initialLogs, modelMetrics, systemConfig } = generateMockData();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [files, setFiles] = useState<File[]>(initialFiles);
  const [systemLogs] = useState<Log[]>(initialLogs);
  const [feedbackFormEnabled, setFeedbackFormEnabled] = useState(systemConfig.enableFeedbackForm);

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

  const toggleDropdown = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    
    if (dropdownOpen === id) {
      setDropdownOpen(null);
      setDropdownPosition(null);
    } else {
      setDropdownOpen(id);
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX - 130 // Adjust dropdown position
      });
    }
  };

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.ellipsis-icon') && !target.closest('.dropdown-content')) {
        setDropdownOpen(null);
        setDropdownPosition(null);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const requestSort = (key: string) => {
    let direction = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig && sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'none';
    }

    setSortConfig(direction === 'none' ? null : { key, direction });
  };

  const getSortedData = (data: any[], key: string) => {
    if (!sortConfig || sortConfig.key !== key || sortConfig.direction === 'none') {
      return [...data];
    }

    return [...data].sort((a, b) => {
      if (a[key] < b[key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) return <FaSort />;
    if (sortConfig.direction === 'ascending') return <FaSortUp />;
    if (sortConfig.direction === 'descending') return <FaSortDown />;
    return <FaSort />;
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupLogsByDate = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const grouped: Record<string, Log[]> = {};

    systemLogs.forEach(log => {
      const logDate = log.timestamp.split(' ')[0];
      let displayDate = logDate;

      if (logDate === today) {
        displayDate = 'Today';
      } else if (logDate === yesterdayStr) {
        displayDate = 'Yesterday';
      }

      if (!grouped[displayDate]) {
        grouped[displayDate] = [];
      }
      grouped[displayDate].push(log);
    });

    return grouped;
  };

  const groupedLogs = groupLogsByDate();

  const handleUserAction = (user: User, action: string) => {
    setSelectedUser(user);
    
    if (action === 'edit') {
      setPopupTitle('Edit User');
      setPopupContent('editUser');
    } else if (action === 'delete') {
      setPopupTitle('Delete User');
      setPopupContent('deleteUser');
    } else if (action === 'resetPassword') {
      setPopupTitle('Reset Password');
      setPopupContent('resetPassword');
    }
    
    setShowPopup(true);
    setPopupHistory([]);
  };

  const handleFileAction = (file: File, action: string) => {
    setSelectedFile(file);
    
    if (action === 'view') {
      setPopupTitle('View File Details');
      setPopupContent('viewFile');
    } else if (action === 'delete') {
      setPopupTitle('Delete File');
      setPopupContent('deleteFile');
    }
    
    setShowPopup(true);
    setPopupHistory([]);
  };

  const navigatePopup = (screen: string, addToHistory = true) => {
    if (addToHistory) {
      setPopupHistory([...popupHistory, popupContent]);
    }
    setPopupContent(screen);
  };

  const goBackPopup = () => {
    if (popupHistory.length > 0) {
      const previousScreen = popupHistory[popupHistory.length - 1];
      setPopupContent(previousScreen);
      setPopupHistory(popupHistory.slice(0, -1));
    } else {
      setShowPopup(false);
    }
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setShowPopup(false);
    }
  };

  const handleToggleChange = () => {
    setFeedbackFormEnabled(!feedbackFormEnabled);
  };

  return (
    <>
    <Header ref={headerRef} />
    <RightSideBar ref={sidebarRef} />
    <div 
    className="main-layout"
    style={{
      marginTop: `${headerHeight}px`,
      marginRight: `${sidebarWidth}px`,
      height: `calc(100vh - ${headerHeight}px)`,
      width: `calc(100vw - ${sidebarWidth}px)`
    }}
    >

      <div className="content-wrapper">
        <div 
          className="admin-container"
        >
          <div className="admin-panel">
            <div className="panel-sidebar">
              <div 
                className={`sidebar-item ${currentSection === 'users' ? 'active' : ''}`} 
                onClick={() => setCurrentSection('users')}
              >
                <FiUsers className="sidebar-icon" />
                <span>User Management</span>
                {/* <div className={`${currentSection === 'users' ? 'border-active' : ''}`}></div> */}
              </div>
              <div 
                className={`sidebar-item ${currentSection === 'uploads' ? 'active' : ''}`} 
                onClick={() => setCurrentSection('uploads')}
              >
                <FiUpload className="sidebar-icon" />
                <span>Upload Monitoring</span>
                {/* <div className={`${currentSection === 'uploads' ? 'border-active' : ''}`}></div> */}
              </div>
              <div 
                className={`sidebar-item ${currentSection === 'model' ? 'active' : ''}`} 
                onClick={() => setCurrentSection('model')}
              >
                <FiCpu className="sidebar-icon" />
                <span>Model Oversight</span>
              </div>
              <div 
                className={`sidebar-item ${currentSection === 'logs' ? 'active' : ''}`} 
                onClick={() => setCurrentSection('logs')}
              >
                <FiClock className="sidebar-icon" />
                <span>System Logs</span>
              </div>
              <div 
                className={`sidebar-item ${currentSection === 'config' ? 'active' : ''}`} 
                onClick={() => setCurrentSection('config')}
              >
                <FaCog className="sidebar-icon" />
                <span>Configuration</span>
              </div>
            </div>
            
            <div className="panel-content">
              {currentSection === 'users' && (
                <div className="section-content">
                  <div className="section-header">
                    <h2>User Management</h2>
                    <button className="add-button" onClick={() => {
                      setPopupTitle('Add New User');
                      setPopupContent('addUser');
                      setShowPopup(true);
                      setPopupHistory([]);
                    }}>
                      + Add User
                    </button>
                  </div>
                  
                  <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search users..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th onClick={() => requestSort('name')}>
                            <div className="th-content">
                              Name {getSortIcon('name')}
                            </div>
                          </th>
                          <th onClick={() => requestSort('email')}>
                            <div className="th-content">
                              Email {getSortIcon('email')}
                            </div>
                          </th>
                          <th onClick={() => requestSort('role')}>
                            <div className="th-content">
                              Role {getSortIcon('role')}
                            </div>
                          </th>
                          <th onClick={() => requestSort('status')}>
                            <div className="th-content">
                              Status {getSortIcon('status')}
                            </div>
                          </th>
                          <th onClick={() => requestSort('lastLogin')}>
                            <div className="th-content">
                              Last Login {getSortIcon('lastLogin')}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedData(filteredUsers, sortConfig?.key || '').map(user => (
                          <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                              <span className={`status-badge ${user.status === 'Active' ? 'active' : 'inactive'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="options-cell">
                              <span>{user.lastLogin}</span>
                              <div className="row-actions">
                                <div className="ellipsis-icon" onClick={(e) => toggleDropdown(e, user.id)}>
                                  <FaEllipsisV />
                                </div>
                                {dropdownOpen === user.id && dropdownPosition && (
                                  <div 
                                    className="dropdown-content"
                                    style={{
                                      top: dropdownPosition.top,
                                      left: dropdownPosition.left
                                    }}
                                  >
                                    <div className="dropdown-item" onClick={() => handleUserAction(user, 'edit')}>
                                      <FiEdit className='dropdown-icon'/> Edit
                                    </div>
                                    <div className="dropdown-item" onClick={() => handleUserAction(user, 'resetPassword')}>
                                      <FiKey className='dropdown-icon'/> Reset Password
                                    </div>
                                    <div className="dropdown-item delete" onClick={() => handleUserAction(user, 'delete')}>
                                      <FiTrash className='dropdown-icon'/> Delete
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {currentSection === 'uploads' && (
                <div className="section-content">
                  <div className="section-header">
                    <h2>Upload Monitoring</h2>
                  </div>
                  
                  <div className="search-bar">
                    <FaSearch className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search files..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="filter-button">
                      <FaFilter /> Filter
                    </div>
                  </div>
                  
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th onClick={() => requestSort('name')}>
                            <div className="th-content">
                              File Name {getSortIcon('name')}
                            </div>
                          </th>
                          <th onClick={() => requestSort('size')}>
                            <div className="th-content">
                              Size {getSortIcon('size')}
                            </div>
                          </th>
                          <th onClick={() => requestSort('uploadedBy')}>
                            <div className="th-content">
                              Uploaded By {getSortIcon('uploadedBy')}
                            </div>
                          </th>
                          <th onClick={() => requestSort('uploadDate')}>
                            <div className="th-content">
                              Upload Date {getSortIcon('uploadDate')}
                            </div>
                          </th>
                          <th onClick={() => requestSort('status')}>
                            <div className="th-content">
                              Status {getSortIcon('status')}
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {getSortedData(filteredFiles, sortConfig?.key || '').map(file => (
                          <tr key={file.id}>
                            <td>{file.name}</td>
                            <td>{file.size}</td>
                            <td>{file.uploadedBy}</td>
                            <td>{file.uploadDate}</td>
                            <td className="options-cell">
                              <span className={`status-badge ${
                                file.status === 'Processed' ? 'success' : 
                                file.status === 'Processing' ? 'warning' : 'error'
                              }`}>
                                {file.status}
                              </span>
                              <div className="row-actions">
                                <div className="ellipsis-icon" onClick={(e) => toggleDropdown(e, file.id)}>
                                  <FaEllipsisV />
                                </div>
                                {dropdownOpen === file.id && dropdownPosition && (
                                  <div 
                                    className="dropdown-content"
                                    style={{
                                      top: dropdownPosition.top,
                                      left: dropdownPosition.left
                                    }}
                                  >
                                    <div className="dropdown-item" onClick={() => handleFileAction(file, 'view')}>
                                      <FiSearch className='dropdown-icon'/> View Details
                                    </div>
                                    <div className="dropdown-item" onClick={() => handleFileAction(file, 'download')}>
                                      <FiDownload className='dropdown-icon'/> Download
                                    </div>
                                    <div className="dropdown-item delete" onClick={() => handleFileAction(file, 'delete')}>
                                      <FiTrash className='dropdown-icon'/> Delete
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {currentSection === 'model' && (
                <div className="section-content">
                  <div className="section-header">
                    <h2>Model Oversight</h2>
                  </div>
                  
                  <div className="model-details">
                    <div className="model-card">
                      <h3>Model Information</h3>
                      <div className="info-row">
                        <span className="info-label">Version:</span>
                        <span className="info-value">{modelMetrics.version}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Deployment Date:</span>
                        <span className="info-value">{modelMetrics.deploymentDate}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">Last Evaluated:</span>
                        <span className="info-value">{modelMetrics.lastEvaluated}</span>
                      </div>
                    </div>

                    <div className="model-card">
                      <h3>Performance Metrics</h3>
                      <div className="metrics-container">
                        <div className="metric-item">
                          <div className="metric-value">{modelMetrics.accuracy.toFixed(1)}%</div>
                          <div className="metric-label">Accuracy</div>
                        </div>
                        <div className="metric-item">
                          <div className="metric-value">{modelMetrics.precision.toFixed(1)}%</div>
                          <div className="metric-label">Precision</div>
                        </div>
                        <div className="metric-item">
                          <div className="metric-value">{modelMetrics.recall.toFixed(1)}%</div>
                          <div className="metric-label">Recall</div>
                        </div>
                        <div className="metric-item">
                          <div className="metric-value">{modelMetrics.f1Score.toFixed(1)}%</div>
                          <div className="metric-label">F1 Score</div>
                        </div>
                      </div>
                    </div>
                    <div className="model-card">
                      <h3>Model Settings</h3>
                      <div className="settings-container">
                        <div className="setting-item">
                          <label>Confidence Threshold</label>
                          <div className="slider-container">
                            <input type="range" min="0" max="100" defaultValue="75" />
                            <span>75%</span>
                          </div>
                        </div>
                        <div className="setting-item">
                          <label>Enable Model Feedback</label>
                          <label className="switch">
                            <input 
                              type="checkbox" 
                              checked={feedbackFormEnabled} 
                              onChange={handleToggleChange}
                            />
                            <span className="slider round"></span>
                          </label>
                        </div>
                      </div>
                      <button className="save-settings-btn">Save Settings</button>
                    </div>
                  </div>
                </div>
              )}
              
              {currentSection === 'logs' && (
                <div className="section-content">
                  <div className="section-header">
                    <h2>System Logs</h2>
                    <button className="export-button">
                      <FaDownload /> Export Logs
                    </button>
                  </div>
                  
                  <div className="log-filters">
                    <div className="filter-group">
                      <label>Legal Entity:</label>
                      <select>
                        <option>All Entities</option>
                        <option>System Admin</option>
                        <option>Engineering</option>
                        <option>Support</option>
                      </select>
                    </div>
                    <div className="filter-group">
                      <label>Date Period:</label>
                      <select>
                        <option>Today</option>
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Custom...</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="logs-timeline">
                    {Object.entries(groupedLogs).map(([date, logs]) => (
                      <div className="timeline-section" key={date}>
                        <h3 className="timeline-header">{date}</h3>
                        {logs.map(log => (
                          <div className="log-entry" key={log.id}>
                            <div className="log-icon">
                              <FiClock />
                            </div>
                            <div className="log-content">
                              <div className="log-message">{log.event}</div>
                              <div className="log-meta">{log.organization}</div>
                            </div>
                            <div className="log-timestamp">{log.timestamp.split(' ')[1]}</div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {currentSection === 'config' && (
                <div className="section-content">
                  <div className="section-header">
                    <h2>System Configuration</h2>
                  </div>
                  
                  <div className="config-container">
                    <div className="config-card">
                      <h3>File Settings</h3>
                      <div className="config-item">
                        <label>Allowed File Types</label>
                        <div className="tag-container">
                          {systemConfig.allowedFileTypes.map((type, index) => (
                            <span key={index} className="config-tag">{type}</span>
                          ))}
                          <button className="add-tag">+</button>
                        </div>
                      </div>
                      <div className="config-item">
                        <label>Maximum File Size</label>
                        <div className="input-with-unit">
                          <input type="text" defaultValue="10" />
                          <span>MB</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="config-buttons">
                      <button className="cancel-config-btn">Cancel</button>
                      <button className="save-config-btn">Save Changes</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showPopup && (
        <div className="popup-overlay" onClick={handleOutsideClick}>
          <div className="popup-container">
            <div className="popup-header">
              {popupHistory.length > 0 && (
                <button className="back-button" onClick={goBackPopup}>
                  <FaArrowLeft />
                </button>
              )}
              <h3>{popupTitle}</h3>
              <button className="close-button" onClick={() => setShowPopup(false)}>×</button>
            </div>
            
            <div className="popup-content">
              {popupContent === 'addUser' && (
                <form className="form-container">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" placeholder="Enter full name" />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" placeholder="Enter email address" />
                  </div>
                  <div>
                    <div className="form-group">
                      <label>Role</label>
                      <select>
                        <option>Select role</option>
                        <option>Admin</option>
                        <option>Engineer</option>
                        <option>Read-only</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Initial Password</label>
                      <input type="password" placeholder="Enter initial password" />
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="cancel-button" onClick={() => setShowPopup(false)}>Cancel</button>
                    <button type="button" className="submit-button" onClick={() => setShowPopup(false)}>Add User</button>
                  </div>
                </form>
              )}
              
              {popupContent === 'editUser' && selectedUser && (
                <form className="form-container">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" defaultValue={selectedUser.name} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" defaultValue={selectedUser.email} />
                  </div>
                  <div className='role-status'>
                    <div className="form-group">
                      <label>Role</label>
                      <select defaultValue={selectedUser.role}>
                        <option>Admin</option>
                        <option>Engineer</option>
                        <option>Read-only</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select defaultValue={selectedUser.status}>
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="cancel-button-edit" onClick={() => setShowPopup(false)}>Cancel</button>
                    <button type="button" className="submit-button-edit" onClick={() => setShowPopup(false)}>Save</button>
                  </div>
                </form>
              )}
              
              {popupContent === 'deleteUser' && selectedUser && (
                <div className="confirmation-content">
                  <div className="warning-icon">⚠️</div>
                  <p>Are you sure you want to delete the user <strong>{selectedUser.name}</strong>?</p>
                  <p>This action cannot be undone. The user will lose all access to the system.</p>
                  <div className="form-actions">
                    <button type="button" className="cancel-button-psw" onClick={() => setShowPopup(false)}>Cancel</button>
                    <button type="button" className="delete-button" onClick={() => setShowPopup(false)}>Delete User</button>
                  </div>
                </div>
              )}
              
              {popupContent === 'resetPassword' && selectedUser && (
                <div className="form-container">
                  <p>Reset password for user: <strong>{selectedUser.name}</strong></p>
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" placeholder="Enter new password" />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" placeholder="Confirm new password" />
                  </div>
                  <div className="checkbox-group">
                    <input type="checkbox" id="force-reset" />
                    <label htmlFor="force-reset">Force user to change password on next login</label>
                  </div>
                  <div className="form-actions">
                    <button type="button" className="cancel-button-psw" onClick={() => setShowPopup(false)}>Cancel</button>
                    <button type="button" className="submit-button" onClick={() => setShowPopup(false)}>Reset Password</button>
                  </div>
                </div>
              )}
              
              {popupContent === 'viewFile' && selectedFile && (
                <div className="file-details">
                  <div className="file-prev">
                    <img src={csv} alt="csv-file" className="csv-icon" />
                    <div className="file-name">{selectedFile.name}</div>
                  </div>
                  <div className="details-table">
                    <div className="detail-row">
                      <span className="detail-label">Size:</span>
                      <span className="detail-value">{selectedFile.size}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Uploaded By:</span>
                      <span className="detail-value">{selectedFile.uploadedBy}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Upload Date:</span>
                      <span className="detail-value">{selectedFile.uploadDate}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value status-${selectedFile.status.toLowerCase()}`}>{selectedFile.status}</span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button className="download-button">
                      <FaDownload /> Download
                    </button>
                    <button className="delete-button" onClick={() => navigatePopup('deleteFile')}>
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              )}
              
              {popupContent === 'deleteFile' && selectedFile && (
                <div className="confirmation-content">
                  <div className="warning-icon">⚠️</div>
                  <p>Are you sure you want to delete the file <strong>{selectedFile.name}</strong>?</p>
                  <p>This action cannot be undone.</p>
                  <div className="form-actions">
                    <button type="button" className="cancel-button-psw" onClick={() => setShowPopup(false)}>Cancel</button>
                    <button type="button" className="delete-button" onClick={() => setShowPopup(false)}>Delete File</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
};


export default AdminPanel