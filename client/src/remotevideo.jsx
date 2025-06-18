import "./videocomp.css"
import React, { useEffect, useRef, useState } from 'react';

export function VideoSlider({
  localStream,
  localScreenStream,
  remoteStreams = {},
  remoteScreenStreams = {},
  controlButtons = [],
 trigger
}) {
  const [pinnedId, setPinnedId] = useState(null);
  const [boxList, setBoxList] = useState([]);

  
  const videoRefs = useRef({});

  useEffect(() => {
    const updatedList = [];

    if (localStream) {
      updatedList.push({ id: 'local', label: 'You', stream: localStream });
    }

    if (localScreenStream) {
      updatedList.push({ id: 'local-screen', label: 'Your Screen', stream: localScreenStream });
    }

    for (const [id, stream] of Object.entries(remoteStreams)) {
      if (stream) updatedList.push({ id, label: `User ${id}`, stream });
    }

    for (const [id, stream] of Object.entries(remoteScreenStreams)) {
      if (stream) updatedList.push({ id: `screen-${id}`, label: `Screen ${id}`, stream });
    }

    setBoxList(updatedList);
    if (pinnedId && !updatedList.find(b => b.id === pinnedId)) {
    setPinnedId(null);
  }
  }, [localStream, localScreenStream, remoteStreams, remoteScreenStreams,trigger]);

  // Cleanup streams from removed refs
  useEffect(() => {
    console.log("cleanup called");
    const activeIds = new Set(boxList.map(b => b.id));
    for (const id in videoRefs.current) {
      if (!activeIds.has(id)) {
        const video = videoRefs.current[id];
        if (video && video.srcObject) {
          video.srcObject.getTracks().forEach(t => t.stop());
          video.srcObject = null;
        }
        delete videoRefs.current[id];
      }
    }
  },[boxList,trigger]);

  const getBoxesPerPage = () => {
    const width = window.innerWidth;
    if (width <= 480) return 2;
    if (width <= 768) return 4;
    return 6;
  };

  const paginated = () => {
    const boxesPerPage = getBoxesPerPage();
    const rest = boxList.filter(b => b.id !== pinnedId);
    const pages = [];
    for (let i = 0; i < rest.length; i += boxesPerPage) {
      pages.push(rest.slice(i, i + boxesPerPage));
    }
    return pages;
  };

  const renderVideoBox = ({ id, stream, label }, isPinned = false) => (
    <div key={id} className={`video-box ${isPinned ? 'pinned fullscreen-box' : 'grid-box'}`}>
      <video
        autoPlay
        playsInline
        muted={id === 'local' || id === 'local-screen'}
        ref={el => {
          if (el && stream && el.srcObject !== stream) {
            el.srcObject = stream;
            videoRefs.current[id] = el;
          }
        }}
      />
      <span style={{ position: 'absolute', bottom: '2px', left: '4px', color: '#fff', fontSize: '12px' }}>
        {label}
      </span>
      <button className="pin-btn" onClick={() => setPinnedId(prev => (prev === id ? null : id))}>
       <i class="fas fa-thumbtack"></i>
      </button>
    </div>
  );

return (
  <>
    <div id="slider" className="slider">
      
      {/* Page for pinned video, if exists */}
      {pinnedId && boxList.find(b => b.id === pinnedId) && (
  <div className="page">
    {renderVideoBox(boxList.find(b => b.id === pinnedId), true)}
  </div>
)}


      {/* Other video pages */}
      {paginated().map((page, i) => (
        <div className="page" key={`page-${i}`}>
          {page.map(video => renderVideoBox(video))}
        </div>
      ))}
    </div>

    <div className="bottom-bar">
      {controlButtons.map((btn, index) => (
        <span key={index}>{btn}</span>
      ))}
    </div>
  </>
);

}
