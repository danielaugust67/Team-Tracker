import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Home, ClipboardCheck, Users, LogOut, PanelLeft, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/sonner";
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const SidebarNav = ({ isSidebarOpen }) => {
  const baseLinkClasses = "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50";
  const activeLinkClasses = "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50";
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  return (
    <>
      <nav className="grid items-start px-4 text-sm font-medium">
        <NavLink to="/dashboard/home" className={({ isActive }) => cn(baseLinkClasses, isActive && activeLinkClasses, !isSidebarOpen && "justify-center")}>
          <Home className="h-4 w-4" />
          <span className={cn(!isSidebarOpen && "lg:hidden")}>Home</span>
        </NavLink>
        <NavLink to="/dashboard/tasks" className={({ isActive }) => cn(baseLinkClasses, isActive && activeLinkClasses, !isSidebarOpen && "justify-center")}>
          <ClipboardCheck className="h-4 w-4" />
          <span className={cn(!isSidebarOpen && "lg:hidden")}>Tasks</span>
        </NavLink>
        <NavLink to="/dashboard/team" className={({ isActive }) => cn(baseLinkClasses, isActive && activeLinkClasses, !isSidebarOpen && "justify-center")}>
          <Users className="h-4 w-4" />
          <span className={cn(!isSidebarOpen && "lg:hidden")}>Team</span>
        </NavLink>
      </nav>
      <div className="mt-auto p-4">
         <Button onClick={handleLogout} variant="ghost" className={cn(baseLinkClasses, "w-full justify-start text-red-500 hover:bg-red-100/50 hover:text-red-600", !isSidebarOpen && "justify-center")}>
           <LogOut className="h-4 w-4" />
           <span className={cn(!isSidebarOpen && "lg:hidden")}>Logout</span>
         </Button>
      </div>
    </>
  );
};


export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={cn(
      "grid h-screen w-full transition-all duration-300 ease-in-out",
      isSidebarOpen ? "lg:grid-cols-[280px_1fr]" : "lg:grid-cols-[70px_1fr]"
    )}>
      <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-[60px] items-center border-b px-6">
            <NavLink to="/dashboard" className="flex items-center gap-2 font-semibold">
              <span className={cn("truncate transition-opacity", !isSidebarOpen && "opacity-0")}>
                Project Dashboard
              </span>
            </NavLink>
          </div>
          <div className="flex-1 py-2">
            <SidebarNav isSidebarOpen={isSidebarOpen} />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6 dark:bg-gray-800/40 sticky top-0 z-10">
          <Button variant="outline" size="icon" className="hidden lg:flex h-8 w-8" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <PanelLeft className="h-4 w-4" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden h-8 w-8">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <div className="flex h-[60px] items-center border-b px-6">
                <NavLink to="/dashboard" className="flex items-center gap-2 font-semibold">
                  <span>Project Dashboard</span>
                </NavLink>
              </div>
              <div className="py-2">
                <SidebarNav isSidebarOpen={true} />
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="text-lg font-semibold">Welcome Back!</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-50 dark:bg-transparent">
            <Outlet /> 
        </main>

        <Toaster richColors position="top-right" />
      </div>
    </div>
  );
}