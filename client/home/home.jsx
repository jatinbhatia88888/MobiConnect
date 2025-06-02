import {Homepage} from './homemain.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'


createRoot(document.getElementById('root')).render(
  <StrictMode>
   <Homepage></Homepage>
  </StrictMode>
)