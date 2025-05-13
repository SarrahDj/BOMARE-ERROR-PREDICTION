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
import userService, { User as ApiUser, UserCreatePayload, UserUpdatePayload, ResetPasswordPayload } from '../../services/user';
import fileService, { UserFile } from '../../services/file';

// Interface for component state
interface User {
  id: number;
  name: string;
  email: string;
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

  const [currentUser, setCurrentUser] = useState<User>({
    id: 1,
    name: "Ahmed",
    email: "ahmed@example.com",
    status: "Active",
    lastLogin: new Date().toISOString().replace('T', ' ').substring(0, 16)
  });


  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  // Form states for user creation and editing
  const [newUser, setNewUser] = useState<UserCreatePayload>({
    username: '',
    email: '',
    password: ''
  });
  
  const [editUser, setEditUser] = useState<UserUpdatePayload>({
    id: 0,
    username: '',
    email: '',
    is_active: true
  });

  const [passwordReset, setPasswordReset] = useState<{
    new_password: string,
    confirm_password: string,
    force_change: boolean
  }>({
    new_password: '',
    confirm_password: '',
    force_change: false
  });

  // States for user and file data
  const [users, setUsers] = useState<User[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [systemLogs] = useState<Log[]>([]);
  const [feedbackFormEnabled, setFeedbackFormEnabled] = useState(true);
  const [modelMetrics, setModelMetrics] = useState<ModelMetrics>({
    accuracy: 95.5,
    precision: 94.8,
    recall: 93.2,
    f1Score: 94.0,
    lastEvaluated: '2025-04-01',
    version: '1.0.3',
    deploymentDate: '2025-03-15'
  });
  const [systemConfig, setSystemConfig] = useState<SystemConfig>({
    allowedFileTypes: ['.csv', '.json', '.xml'],
    maxFileSize: '10 MB',
    userRegistration: 'Admin invitation only',
    sessionTimeout: 30,
    logRetentionDays: 90
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const apiUsers = await userService.getUsers();
      
      // Transform API user format to component format
      const transformedUsers: User[] = apiUsers.map((apiUser: { id: any; username: any; email: any; is_active: any; last_login: any; }) => ({
        id: apiUser.id,
        name: apiUser.username,
        email: apiUser.email,
        status: apiUser.is_active ? 'Active' : 'Inactive',
        lastLogin: apiUser.last_login || 'Never'
      }));
      
      setUsers(transformedUsers);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch files from API
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const apiFiles = await fileService.getUserFiles();
      

      const transformedFiles: File[] = apiFiles.map(file => ({
        id: file.id,
        name: file.filename,
        size: `${(file.file_size / (1024 * 1024)).toFixed(2)} MB`,
        uploadedBy: "file.username", 
        uploadDate: file.upload_date,
        status: file.status.charAt(0).toUpperCase() + file.status.slice(1) 
      }));
      
      setFiles(transformedFiles);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch files:', err);
      setError('Failed to load files. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (currentSection === 'users') {
      fetchUsers();
    } else if (currentSection === 'uploads') {
      fetchFiles();
    }
  }, [currentSection]);


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

  const toggleDropdown = (e: React.MouseEvent<HTMLDivElement>, id: number) => {
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
    // user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
    setSaveError(null);
    setSaveSuccess(null);
    
    if (action === 'edit') {
      setPopupTitle('Edit User');
      setPopupContent('editUser');
      
      // Set the edit user form data
      setEditUser({
        id: user.id,
        username: user.name,
        email: user.email,
        is_active: user.status === 'Active'
      });
    } else if (action === 'delete') {
      setPopupTitle('Delete User');
      setPopupContent('deleteUser');
    } else if (action === 'resetPassword') {
      setPopupTitle('Reset Password');
      setPopupContent('resetPassword');
      setPasswordReset({
        new_password: '',
        confirm_password: '',
        force_change: false
      });
    }
    
    setShowPopup(true);
    setPopupHistory([]);
  };

  const handleFileAction = (file: File, action: string) => {
    setSelectedFile(file);
    setSaveError(null);
    setSaveSuccess(null);
    
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
    setSystemConfig(prev => ({
      ...prev,
      enableFeedbackForm: !feedbackFormEnabled
    }));
  };

  // Handle form input changes
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser(prev => ({ ...prev, [name]: value }));
  };

  const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'status') {
      setEditUser(prev => ({ 
        ...prev, 
        is_active: value === 'Active' 
      }));
    } else {
      setEditUser(prev => ({ 
        ...prev, 
        [name === 'name' ? 'username' : name]: value 
      }));
    }
  };

  const handlePasswordResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setPasswordReset(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSystemConfigChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'maxFileSize') {
      setSystemConfig(prev => ({
        ...prev,
        maxFileSize: value + ' MB'
      }));
    }
  };

  // Submit handlers
  const handleCreateUser = async () => {
    // Input validation
    if (!newUser.username || !newUser.email || !newUser.password) {
      setSaveError('All fields are required');
      return;
    }
    
    try {
      setIsLoading(true);
      setSaveError(null);
      
      await userService.createUser({
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
      });
      
      // Refresh the user list
      await fetchUsers();
      
      // Show success message
      setSaveSuccess('User created successfully');
      
      // Close the popup after a short delay
      setTimeout(() => {
        setShowPopup(false);
        setNewUser({
          username: '',
          email: '',
          password: ''
        });
      }, 1500);
      
    } catch (error) {
      console.error('Failed to create user:', error);
      setSaveError('Failed to create user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    
    // Input validation
    if (!editUser.username || !editUser.email) {
      setSaveError('Name, email  are required');
      return;
    }
    
    try {
      setIsLoading(true);
      setSaveError(null);
      
      await userService.updateUser({
        id: selectedUser.id,
        username: editUser.username,
        email: editUser.email,
        is_active: editUser.is_active
      });
      
      // Refresh the user list
      await fetchUsers();
      
      // Show success message
      setSaveSuccess('User updated successfully');
      
      // Close the popup after a short delay
      setTimeout(() => {
        setShowPopup(false);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to update user:', error);
      setSaveError('Failed to update user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setIsLoading(true);
      setSaveError(null);
      
      await userService.deleteUser(selectedUser.id);
      
      // Refresh the user list
      await fetchUsers();
      
      // Show success message
      setSaveSuccess('User deleted successfully');
      
      // Close the popup after a short delay
      setTimeout(() => {
        setShowPopup(false);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to delete user:', error);
      setSaveError('Failed to delete user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    
    // Validate passwords match
    if (passwordReset.new_password !== passwordReset.confirm_password) {
      setSaveError('Passwords do not match');
      return;
    }
    
    // Validate password is not empty
    if (!passwordReset.new_password) {
      setSaveError('Password cannot be empty');
      return;
    }
    
    try {
      setIsLoading(true);
      setSaveError(null);
      
      await userService.resetPassword({
        id: selectedUser.id,
        new_password: passwordReset.new_password,
        force_change: passwordReset.force_change
      });
      
      // Show success message
      setSaveSuccess('Password reset successfully');
      
      // Close the popup after a short delay
      setTimeout(() => {
        setShowPopup(false);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to reset password:', error);
      setSaveError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!selectedFile) return;
    
    try {
      setIsLoading(true);
      setSaveError(null);
      
      // await fileService.deleteFile(selectedFile.id);
      
      // Refresh the file list
      await fetchFiles();
      
      // Show success message
      setSaveSuccess('File deleted successfully');
      
      // Close the popup after a short delay
      setTimeout(() => {
        setShowPopup(false);
      }, 1500);
      
    } catch (error) {
      console.error('Failed to delete file:', error);
      setSaveError('Failed to delete file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = () => {
    // In a real app, you would save the config to the server here
    setSaveSuccess('Configuration saved successfully');
    setTimeout(() => {
      setSaveSuccess(null);
    }, 3000);
  };

  const handleDownloadFile = (fileId: number) => {
    // In a real app, you would download the file here
    console.log('Downloading file:', fileId);
  };
  

  return (
    <>
    <Header ref={headerRef} />
    <RightSideBar ref={sidebarRef} />
    <div 
    className="main-layout"
    style={{
      marginTop: `${headerHeight}px`,
    }}
    >
      
      <div className="content-wrapper">
      <span className='page-title'>Settings Panel</span>
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
              </div>
              <div 
                className={`sidebar-item ${currentSection === 'uploads' ? 'active' : ''}`} 
                onClick={() => setCurrentSection('uploads')}
              >
                <FiUpload className="sidebar-icon" />
                <span>Upload Monitoring</span>
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
                      + Add
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
                          {/* <th onClick={() => requestSort('role')}>
                            <div className="th-content">
                              Role {getSortIcon('role')}
                            </div>
                          </th> */}
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
                            {/* <td>{user.role}</td> */}
                            <td>
                              <span className={`status-badge ${user.status === 'Active' ? 'active' : 'inactive'}`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="options-cell">
                              <span>{user.lastLogin}</span>
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
      <h2>Account Settings</h2>
    </div>
    
    <div className="config-container">
      <div className="config-card">
        <h3>Profile Information</h3>
        <div className="info-row">
          <span className="info-label">Name:</span>
          <span className="info-value">{currentUser.name}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Email:</span>
          <span className="info-value">{currentUser.email}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Status:</span>
          <span className="info-value">
            <span className={`status-badge ${currentUser.status === 'Active' ? 'active' : 'inactive'}`}>
              {currentUser.status}
            </span>
          </span>
        </div>
        <div className="info-row">
          <span className="info-label">Last Login:</span>
          <span className="info-value">{currentUser.lastLogin}</span>
        </div>
        
        <button 
          className="save-settings-btn" 
          onClick={() => {
            setSelectedUser(currentUser);
            setPopupTitle('Edit Profile');
            setPopupContent('editUser');
            setShowPopup(true);
          }}
        >
          <FiEdit /> Edit Profile
        </button>
      </div>

      <div className="config-card">
        <h3>Security</h3>
        <div className="info-row">
          <span className="info-label">Password:</span>
          <span className="info-value">••••••••</span>
        </div>
        
        <button 
          className="save-settings-btn" 
          onClick={() => {
            setSelectedUser(currentUser);
            setPopupTitle('Change Password');
            setPopupContent('resetPassword');
            setShowPopup(true);
          }}
        >
          <FiKey /> Change Password
        </button>
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
                    {/* <div className="form-group">
                      <label>Role</label>
                      <select>
                        <option>Select role</option>
                        <option>Admin</option>
                        <option>Engineer</option>
                        <option>Read-only</option>
                      </select>
                    </div> */}
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
                    {/* <div className="form-group">
                      <label>Role</label>
                      <select defaultValue={selectedUser.role}>
                        <option>Admin</option>
                        <option>Engineer</option>
                        <option>Read-only</option>
                      </select>
                    </div> */}
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