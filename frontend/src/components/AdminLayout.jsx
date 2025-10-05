import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useCompany } from '../utils/CompanyContext';
import { useNotifications } from '../hooks/useNotifications';
import NotificationContainer from './NotificationContainer';
import {
  Users,
  FileText,
  CreditCard,
  BarChart3,
  Home,
  Calendar,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  Badge,
  Camera
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { company } = useCompany();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const { notifications, removeNotification } = useNotifications();

  const primaryColor = company?.primaryColor || '#4F46E5';
  const secondaryColor = company?.secondaryColor || '#1E40AF';

  // Fonction pour éclaircir une couleur (utilisée pour les éléments secondaires)
  const lightenColor = (color, percent) => {
    // Pour simplifier, on utilise une approche basique
    // En production, utiliser une bibliothèque comme tinycolor2
    if (color.startsWith('#')) {
      const num = parseInt(color.replace("#", ""), 16);
      const amt = Math.round(2.55 * percent);
      const R = (num >> 16) + amt;
      const G = (num >> 8 & 0x00FF) + amt;
      const B = (num & 0x0000FF) + amt;
      return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }
    return color;
  };

  const secondaryLight = lightenColor(secondaryColor, 20);



  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navigation = [
    {
      title: 'Tableau de Bord',
      items: [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
      ]
    },
    {
      title: 'Ressources Humaines',
      items: [
        { name: 'Employés', href: '/admin/employees', icon: Users },
        { name: 'Badges', href: '/admin/badges', icon: Badge },
        { name: 'Départements', href: '/admin/departments', icon: Home },
        { name: 'Congés', href: '/admin/leaves', icon: Calendar },
      ]
    },
    {
      title: 'Suivi & Contrôle',
      items: [
        { name: 'Présences', href: '/admin/attendance', icon: FileText },
        { name: 'Scan Présences', href: '/admin/attendance/scan', icon: Camera },
        { name: 'Timesheets', href: '/admin/timesheets', icon: FileText },
        { name: 'Contrats', href: '/admin/contracts', icon: FileText },
      ]
    },
    {
      title: 'Finance',
      items: [
        { name: 'Paie', href: '/admin/payroll', icon: CreditCard },
        { name: 'Rapports', href: '/admin/reports', icon: BarChart3 },
      ]
    }
  ];


  return (
    <div className="min-h-screen flex" style={{ backgroundColor: `${primaryColor}05` }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <div className="h-full flex flex-col relative overflow-hidden" style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          boxShadow: `0 0 40px ${primaryColor}30`
        }}>
          {/* Background pattern for texture */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>

          {/* Company Header */}
          <div className="flex items-center justify-center h-24 px-4 border-b" style={{ borderBottomColor: secondaryLight }}>
            <div className="flex items-center space-x-3">
              {company?.logo ? (
                <div className="relative">
                  <img
                    src={company.logo}
                    alt={`${company.name} Logo`}
                    className="h-14 w-14 object-contain rounded-xl shadow-lg"
                    style={{
                      border: `3px solid ${secondaryColor}`,
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="h-14 w-14 rounded-xl flex items-center justify-center shadow-lg hidden" style={{ backgroundColor: secondaryColor, border: `3px solid ${secondaryLight}` }}>
                    <Home className="h-7 w-7 text-white" />
                  </div>
                </div>
              ) : (
                <div className="h-14 w-14 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: secondaryColor, border: `3px solid ${secondaryLight}` }}>
                  <Home className="h-7 w-7 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold truncate text-white drop-shadow-sm">
                  {company?.name || 'Entreprise'}
                </h2>
                <p className="text-sm opacity-90" style={{ color: secondaryLight }}>Administration</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 mt-6 px-3 relative z-10">
            <div className="space-y-6">
              {navigation.map((section, sectionIndex) => (
                <div key={section.title}>
                  <h3 className="px-3 text-xs font-semibold uppercase tracking-wider mb-3 text-white/80 drop-shadow-sm">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group hover:scale-105"
                          style={{
                            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                            color: isActive ? 'white' : 'rgba(255, 255, 255, 0.9)',
                            borderLeft: isActive ? `3px solid rgba(255, 255, 255, 0.8)` : '3px solid transparent',
                            backdropFilter: 'blur(10px)',
                            boxShadow: isActive ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'
                          }}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon className="mr-3 h-5 w-5" style={{ color: isActive ? 'white' : 'rgba(255, 255, 255, 0.8)' }} />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          {/* User section */}
          <div className="p-4 border-t relative z-10" style={{ borderTopColor: 'rgba(255, 255, 255, 0.2)' }}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full flex items-center justify-center shadow-lg" style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '2px solid rgba(255, 255, 255, 0.3)'
                }}>
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white drop-shadow-sm">
                  {user?.name || user?.email?.split('@')[0] || 'Admin'}
                </p>
                <p className="text-xs text-white/70">Administrateur</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 p-2 rounded-lg transition-all duration-200 hover:scale-110 shadow-lg"
                style={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  e.target.style.transform = 'scale(1)';
                }}
                title="Déconnexion"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 bg-white shadow-sm border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset lg:hidden"
            style={{ borderRightColor: `${primaryColor}20` }}
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(section =>
                  section.items.some(item => item.href === location.pathname)
                )?.items.find(item => item.href === location.pathname)?.name || 'Dashboard'}
              </h1>
            </div>

            <div className="ml-4 flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full" style={{ backgroundColor: primaryColor }}></span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>

              {/* Company indicator */}
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: primaryColor }}></div>
                <span>{company?.name || 'Entreprise'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6" style={{ backgroundColor: `${primaryColor}02` }}>
          <div className="max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Notification Container */}
      <NotificationContainer
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
};

export default AdminLayout;