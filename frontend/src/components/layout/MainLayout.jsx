// src/layouts/MainLayout.jsx
import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="ses-app-bg min-h-screen">
      <Navbar onMenuToggle={() => setSidebarOpen((prev) => !prev)} />
      <div className="mx-auto flex max-w-[1600px] gap-4 px-3 pb-4 pt-3 md:px-4">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="ses-panel min-h-[calc(100vh-90px)] flex-1 rounded-2xl p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
