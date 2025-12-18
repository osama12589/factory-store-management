import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar is now fixed outside — no need to include here */}
      <Sidebar />

      {/* Main Content Area - Pushes content right of sidebar */}
      <main className="flex-1 md:ml-64 transition-all duration-300">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}