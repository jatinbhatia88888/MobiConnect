import {Loginpage} from './loginmain.jsx'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
 <link href="../src/styles.css" rel="stylesheet"></link>
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Loginpage></Loginpage>
  </StrictMode>
)