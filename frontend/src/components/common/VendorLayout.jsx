import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { RiDashboardLine, RiListCheck2, RiRestaurantLine, RiGroupLine, RiBarChartLine, RiLogoutBoxLine, RiMoonLine, RiSunLine } from 'react-icons/ri';

const navItems = [
  { to: '/vendor/dashboard',   icon: RiDashboardLine,  label: 'Dashboard'   },
  { to: '/vendor/orders',      icon: RiListCheck2,     label: 'Orders'      },
  { to: '/vendor/plans',       icon: RiRestaurantLine, label: 'Meal Plans'  },
  { to: '/vendor/subscribers', icon: RiGroupLine,      label: 'Subscribers' },
  { to: '/vendor/analytics',   icon: RiBarChartLine,   label: 'Analytics'   },
];

export default function VendorLayout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      <aside className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col fixed h-full z-40">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center text-white font-bold text-sm">DS</div>
            <div>
              <p className="font-semibold text-sm dark:text-white">DabbaSync</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Vendor Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
              ${isActive
                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'}`
            }>
              <Icon className="w-4 h-4 flex-shrink-0" /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-2">
          {/* Theme toggle */}
          <button onClick={toggle}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium w-full text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            {dark ? <><RiSunLine className="w-4 h-4" /> Light Mode</> : <><RiMoonLine className="w-4 h-4" /> Dark Mode</>}
          </button>

          <div className="flex items-center gap-3 px-1 py-1">
            <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/40 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 font-semibold text-xs flex-shrink-0">
              {user?.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium dark:text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Vendor</p>
            </div>
          </div>

          <button onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors w-full px-1 py-1">
            <RiLogoutBoxLine className="w-4 h-4" /> Sign out
          </button>
        </div>
      </aside>

      <main className="ml-60 flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}