import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RiDashboardLine, RiListCheck2, RiRestaurantLine, RiGroupLine, RiBarChartLine, RiLogoutBoxLine } from 'react-icons/ri';

const navItems = [
  { to: '/vendor/dashboard',   icon: RiDashboardLine,   label: 'Dashboard' },
  { to: '/vendor/orders',      icon: RiListCheck2,      label: 'Orders' },
  { to: '/vendor/plans',       icon: RiRestaurantLine,  label: 'Meal Plans' },
  { to: '/vendor/subscribers', icon: RiGroupLine,       label: 'Subscribers' },
  { to: '/vendor/analytics',   icon: RiBarChartLine,    label: 'Analytics' },
];

export default function VendorLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col fixed h-full z-40">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">DS</div>
            <div>
              <p className="font-semibold text-sm text-gray-900">DabbaSync</p>
              <p className="text-xs text-gray-400">Vendor Portal</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`
            }>
              <Icon className="w-4.5 h-4.5" /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-semibold text-xs">
              {user?.name?.slice(0,2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">Vendor</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors w-full">
            <RiLogoutBoxLine className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="ml-60 flex-1 p-8 overflow-auto"><Outlet /></main>
    </div>
  );
}
