import {ProfileSetup} from './profilepage.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
 
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ProfileSetup></ProfileSetup>
  </StrictMode>
)