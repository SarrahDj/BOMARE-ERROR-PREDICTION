import './UploadScreen.css'
import Header from '../../components/Header';
import DragDrop from '../../components/DragDrop';
import RecentUploads from '../../components/RecentUploads';
import RightSidebar from '../../components/RightSideBar';


function UploadScreen() {

  return (
    <>
    <div className='upload-page'>
      <Header/>
      <RightSidebar />
      <div className='wrapper'>
        <DragDrop/>
        <div className='recent-up'>
          <span className='span-1'>Recent uploads</span>
          <span className='span-2'>Type: XML or CSV, Status: Processed, Faulty, Processing</span>
        </div>
        <RecentUploads/>
      </div>
    </div>
    </>
  )
}

export default UploadScreen
