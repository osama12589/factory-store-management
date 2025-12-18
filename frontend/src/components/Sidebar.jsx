import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaList,
  FaBoxOpen,
  FaExchangeAlt,
  FaBars,
  FaTimes,
  FaHistory,
  FaSignOutAlt,
  FaHandHoldingHeart,
  FaFileAlt,
  FaUserShield,
  FaEye
} from "react-icons/fa";

export default function Sidebar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const adminMenuItems = [
    { name: "Categories", path: "/categories", icon: <FaList />, adminOnly: true },
    { name: "Items", path: "/items", icon: <FaBoxOpen />, adminOnly: true },
    { name: "Manage Stock", path: "/transactions", icon: <FaExchangeAlt />, adminOnly: true },
    { name: "Active Borrows", path: "/active-borrows", icon: <FaHandHoldingHeart />, adminOnly: true },
  ];

  const commonMenuItems = [
    { name: "Transaction History", path: "/transactions/history", icon: <FaHistory />, adminOnly: false },
    { name: "Reports", path: "/reports", icon: <FaFileAlt />, adminOnly: false },
  ];

  const isAdmin = user?.role === "admin";

  return (
    <>
      {/* Mobile Hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-3 bg-gray-900 text-white rounded-lg shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen w-64 
          bg-linear-to-b from-gray-900 via-gray-900 to-black 
          text-white flex flex-col z-40
          transform transition-transform duration-300 ease-out shadow-2xl
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-800/40">
          <h1 className="text-2xl font-semibold tracking-wide text-gray-100">
            Factory Store
          </h1>
          <p className="text-gray-400 text-xs mt-1">Management System</p>
        </div>

        {/* User Info */}
        <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700/40">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isAdmin ? 'bg-blue-600' : 'bg-green-600'
            }`}>
              {isAdmin ? <FaUserShield size={18} /> : <FaEye size={18} />}
            </div>
            <div>
              <p className="text-sm font-medium text-white capitalize">{user?.username}</p>
              <p className="text-xs text-gray-400 capitalize">
                {isAdmin ? 'Administrator' : 'Viewer'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Admin Only Section */}
          {isAdmin && (
            <>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2">
                Admin Actions
              </div>
              {adminMenuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                    ${
                      isActive
                        ? "bg-gray-800/90 text-white shadow-inner shadow-gray-700"
                        : "text-gray-300 hover:bg-gray-800/70 hover:text-white hover:translate-x-1"
                    }`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  <span className="text-lg opacity-90">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </>
          )}

          {/* Common Section */}
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-2 mt-4">
            View & Reports
          </div>
          {commonMenuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium
                ${
                  isActive
                    ? "bg-gray-800/90 text-white shadow-inner shadow-gray-700"
                    : "text-gray-300 hover:bg-gray-800/70 hover:text-white hover:translate-x-1"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="text-lg opacity-90">{item.icon}</span>
              <span>{item.name}</span>
            </NavLink>
          ))}

          {/* Logout button */}
          <div className="mt-8 pt-6 border-t border-gray-700/40">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 
              bg-linear-to-r from-red-600 to-red-700 
              hover:from-red-500 hover:to-red-600
              text-white font-semibold rounded-lg 
              transition-all shadow-md hover:shadow-red-900/30 active:scale-95"
            >
              <FaSignOutAlt size={18} />
              Logout
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800/40 text-xs text-gray-400 text-center">
          © 2025 Factory Store
        </div>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}