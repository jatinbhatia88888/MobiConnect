import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {VideoRoom} from '../src/videocomp.jsx'
const query = new URLSearchParams(window.location.search);
    const roomName = query.get("room");
    // const roomName="alloo"
createRoot(document.getElementById('root')).render(
 
    

    <VideoRoom roomName={roomName}></VideoRoom>
 
)