import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { RiHome4Line, RiSearchLine, RiBookmarkLine, RiWalletLine, RiUserLine } from 'react-icons/ri';

const navItems = [
  { to: '/customer/dashboard',     icon: RiHome4Line,    label: 'Home' },
  { to: '/customer/browse',        icon: RiSearchLine,   label: 'Browse' },
  { to: '/customer/subscriptions', icon: RiBookmarkLine, label: 'My Plans' },
  { to: '/customer/wallet',        icon: RiWalletLine,   label: 'Wallet' },
  { to: '/customer/profile',       icon: RiUserLine,     label: 'Profile' },
];

export default function CustomerLayout() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Outlet />
      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex z-50 shadow-lg">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) =>
            `flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors ${isActive ? 'text-brand-600' : 'text-gray-400 hover:text-gray-600'}`
          }>
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
