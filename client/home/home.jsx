import {AppSidebar} from './homemain'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SidebarProvider>
    <AppSidebar>
      <main>
        <SidebarTrigger />
        {"home"}
      </main>
    </AppSidebar>
    </SidebarProvider>
  </StrictMode>
)