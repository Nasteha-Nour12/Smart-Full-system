// src/layouts/MainLayout.jsx
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="ses-app-bg h-screen overflow-hidden">
      <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      <div className="mx-auto flex h-[calc(100vh-84px)] max-w-[1600px] gap-4 overflow-hidden px-3 pb-4 pt-3 md:px-4">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="ses-panel h-full flex-1 overflow-y-auto rounded-2xl p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
