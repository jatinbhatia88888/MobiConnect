import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {VideoRoom} from '../src/videocomp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VideoRoom></VideoRoom>
  </StrictMode>
)