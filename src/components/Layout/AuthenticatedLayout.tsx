import React, { useState } from 'react';
import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import APIKeyModal from "../Navbar/APIKeyModal"
import GlobalContextManager from "../GlobalContext/GlobalContextManager"
import { WorkspaceActions } from "@/components/WorkspaceActions"
import SyncModal from "../Navbar/SyncModal"
import { useSyncStore } from "../../services/syncStore"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
}

const AuthenticatedLayout: React.FC<AuthenticatedLayoutProps> = ({ children }) => {
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const { isSyncing } = useSyncStore();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/60">
          <SidebarTrigger className="-ml-1" />
          <div className="ml-auto flex items-center gap-2">
             <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsSyncModalOpen(true)} 
                className="gap-2 h-8 text-sidebar-foreground"
                title="Sync Data"
              >
                <RefreshCw size={16} className={isSyncing ? "animate-spin text-indigo-500" : "text-muted-foreground"} />
                <span className="hidden md:inline text-sm">Sync</span>
              </Button>

            <WorkspaceActions />
            <APIKeyModal />
            <SyncModal 
                isOpen={isSyncModalOpen} 
                onClose={() => setIsSyncModalOpen(false)} 
            />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </div>
        <GlobalContextManager />
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AuthenticatedLayout;
