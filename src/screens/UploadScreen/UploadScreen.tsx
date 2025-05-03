import './UploadScreen.css'
import Header from '../../components/Header';
import DragDrop from '../../components/DragDrop';
import RecentUploads from '../../components/RecentUploads';
import RightSidebar from '../../components/RightSideBar';
import { useEffect, useRef, useState } from 'react';


function UploadScreen() {
  const headerRef = useRef<HTMLDivElement>(null);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [headerHeight, setHeaderHeight] = useState(0);
    const [sidebarWidth, setSidebarWidth] = useState(0);

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
  

  return (
    <>
      <Header ref={headerRef}/>
      <RightSidebar ref={sidebarRef}/>
      <div 
      className='upload-content'
      style={{
        marginTop: `${headerHeight}px`,
        marginRight: `${sidebarWidth}px`,
  
      }}
      >
        <span className='page-title'>Uploading Files</span>
        <DragDrop/>
        <div className='recent-up'>
          <span className='span-1'>Recent uploads</span>
          <span className='span-2'>Type: XML or CSV, Status: Processed, Faulty, Processing</span>
        </div>
        <RecentUploads/>
      </div>
    </>
  )
}

export default UploadScreen
