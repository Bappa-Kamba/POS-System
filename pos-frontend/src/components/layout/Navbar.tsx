import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  LogOut,
  User,
  Users,
  Building2,
  BarChart3,
  DollarSign,
  FileText,
  Settings,
  Moon,
  Sun,
  ChevronDown,
  Layers,
  Tag,
  FolderTree,
  UserCog,
  ClipboardList,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

import { useThemeStore } from '../../store/themeStore';
import { useSafeLogout } from '../../hooks/useSafeLogout';
import { SessionEndModal } from '../session/SessionEndModal';
import { RefreshControl } from '../common/RefreshControl';

export const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const catalogDropdownRef = useRef<HTMLDivElement>(null);
  const managementDropdownRef = useRef<HTMLDivElement>(null);
  const reportsDropdownRef = useRef<HTMLDivElement>(null);

  const {
    handleSafeLogout,
    handleSessionEndComplete,
    handleCancel,
    showSessionEndModal,
  } = useSafeLogout({
    onLogoutComplete: () => navigate('/login'),
  });

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await handleSafeLogout();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
      
      if (
        catalogDropdownRef.current &&
        !catalogDropdownRef.current.contains(event.target as Node) &&
        managementDropdownRef.current &&
        !managementDropdownRef.current.contains(event.target as Node) &&
        reportsDropdownRef.current &&
        !reportsDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };

    if (isProfileOpen || openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileOpen, openDropdown]);

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Check if any path in a group is active
  const isGroupActive = (paths: string[]) => {
    return paths.some(path => location.pathname.startsWith(path));
  };

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  // Grouped navigation structure
  const catalogItems = [
    { path: '/products', label: 'Products & Inventory', icon: Package },
    { path: '/subdivisions', label: 'Subdivisions', icon: Layers },
    { path: '/categories', label: 'Categories', icon: Tag },
  ];

  const managementItems = [
    { path: '/users', label: 'Users', icon: Users },
    { path: '/branches', label: 'Branches', icon: Building2 },
    { path: '/expenses', label: 'Expenses', icon: DollarSign },
  ];

  const reportsItems = [
    { path: '/reports', label: 'Reports', icon: BarChart3 },
    { path: '/audit-logs', label: 'Audit Logs', icon: FileText },
  ];

  return (
    <nav className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Brand */}
          <div className="flex items-center gap-8">
            <Link
              to={user?.role === 'ADMIN' ? '/dashboard' : '/pos'}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                POS System
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center gap-1">
              {user?.role === 'ADMIN' && (
                <>
                  {/* Dashboard Link */}
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive('/dashboard')
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Link>

                  {/* Catalog Dropdown */}
                  <div className="relative" ref={catalogDropdownRef}>
                    <button
                      onClick={() => toggleDropdown('catalog')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isGroupActive(catalogItems.map(i => i.path))
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      <FolderTree className="w-4 h-4" />
                      Catalog
                      <ChevronDown className={`w-3 h-3 transition-transform ${
                        openDropdown === 'catalog' ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {openDropdown === 'catalog' && (
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                        {catalogItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setOpenDropdown(null)}
                              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                                isActive(item.path)
                                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Management Dropdown */}
                  <div className="relative" ref={managementDropdownRef}>
                    <button
                      onClick={() => toggleDropdown('management')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isGroupActive(managementItems.map(i => i.path))
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      <UserCog className="w-4 h-4" />
                      Management
                      <ChevronDown className={`w-3 h-3 transition-transform ${
                        openDropdown === 'management' ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {openDropdown === 'management' && (
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                        {managementItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setOpenDropdown(null)}
                              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                                isActive(item.path)
                                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Reports Dropdown */}
                  <div className="relative" ref={reportsDropdownRef}>
                    <button
                      onClick={() => toggleDropdown('reports')}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isGroupActive(reportsItems.map(i => i.path))
                          ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`}
                    >
                      <ClipboardList className="w-4 h-4" />
                      Reports
                      <ChevronDown className={`w-3 h-3 transition-transform ${
                        openDropdown === 'reports' ? 'rotate-180' : ''
                      }`} />
                    </button>
                    {openDropdown === 'reports' && (
                      <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                        {reportsItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setOpenDropdown(null)}
                              className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                                isActive(item.path)
                                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                                  : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* POS Link (always visible) */}
              <Link
                to="/pos"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/pos')
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                POS
              </Link>
            </div>
          </div>

          {/* User Info & Actions */}
          <div className="flex items-center gap-2">
            {/* Refresh Control */}
            <RefreshControl />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="hidden sm:flex flex-col items-start text-sm">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.username}
                  </span>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {user?.role === 'ADMIN' ? 'Administrator' : 'Cashier'}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-neutral-500 dark:text-neutral-400 transition-transform ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-neutral-200 dark:border-neutral-700">
        <div className="px-4 py-2 flex items-center gap-1 overflow-x-auto">
          {user?.role === 'ADMIN' && (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              {catalogItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              {managementItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              {reportsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                      isActive(item.path)
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
          <Link
            to="/pos"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              isActive('/pos')
                ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            POS
          </Link>
        </div>
      </div>

      <SessionEndModal
        isOpen={showSessionEndModal}
        onClose={handleCancel}
        onSessionEnded={handleSessionEndComplete}
      />
    </nav>
  );
};

