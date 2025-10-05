import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import {
  Building2,
  Users,
  FileText,
  CreditCard,
  User,
  LogOut,
  Menu,
  X,
  BarChart3,
  Settings,
  Home,
  Calendar,
  Bell,
  ChevronDown
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const confirmLogout = () => {
    setLogoutModalOpen(false);
    handleLogout();
  };

  const getNavigationItems = () => {
    switch (userRole) {
      case 'SUPERADMIN':
        return [
          {
            title: 'Principal',
            items: [
              { name: 'Dashboard', href: '/superadmin/dashboard', icon: BarChart3 },
            ]
          },
          {
            title: 'Gestion',
            items: [
              { name: 'Entreprises', href: '/superadmin/companies', icon: Building2 },
              { name: 'Statistiques', href: '/superadmin/statistics', icon: BarChart3 },
            ]
          }
        ];
      case 'CAISSIER':
        return [
          {
            title: 'Tableau de Bord',
            items: [
              { name: 'Dashboard', href: '/caissier/dashboard', icon: Home },
            ]
          },
          {
            title: 'Paiements',
            items: [
              { name: 'Paiements', href: '/caissier/payments', icon: CreditCard },
              { name: 'Reçus', href: '/caissier/receipts', icon: FileText },
            ]
          },
          {
            title: 'Employés',
            items: [
              { name: 'Employés', href: '/caissier/employees', icon: Users },
            ]
          }
        ];
      case 'EMPLOYEE':
        return [
          {
            title: 'Tableau de Bord',
            items: [
              { name: 'Dashboard', href: '/employee/dashboard', icon: Home },
            ]
          },
          {
            title: 'Mon Espace',
            items: [
              { name: 'Mon Profil', href: '/employee/profile', icon: User },
              { name: 'Mes Congés', href: '/employee/leaves', icon: Calendar },
            ]
          },
          {
            title: 'Documents',
            items: [
              { name: 'Mes Bulletins', href: '/employee/payslips', icon: FileText },
              { name: 'Mes Timesheets', href: '/employee/timesheets', icon: FileText },
            ]
          }
        ];
      default:
        return [];
    }
  };

  const navigation = getNavigationItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Header - Full Width */}
      <div className="sticky top-0 z-20 flex h-16 bg-white shadow-sm border-b border-gray-200">
        <button
          onClick={() => setSidebarOpen(true)}
          className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* Logo for mobile */}
        <div className="flex items-center px-4 lg:hidden">
          <Building2 className="h-6 w-6 text-indigo-600" />
          <span className="ml-2 text-lg font-semibold text-gray-900">PayrollSys</span>
        </div>

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
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Settings */}
            <button className="p-2 text-gray-400 hover:text-gray-600">
              <Settings className="h-5 w-5" />
            </button>

            {/* User menu */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email?.split('@')[0] || 'Utilisateur'}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {userRole?.toLowerCase()}
                </div>
              </div>
              <button
                onClick={() => setLogoutModalOpen(true)}
                className="p-2 text-gray-400 hover:text-gray-600"
                title="Déconnexion"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-10 lg:hidden">
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          </div>
        )}

        {/* Sidebar */}
        <div className={`fixed top-16 bottom-0 left-0 z-10 w-56 bg-white shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
            <Building2 className="h-8 w-8 text-white" />
            <span className="ml-2 text-xl font-semibold text-white">PayrollSys</span>
          </div>

          <nav className="mt-6">
            <div className="px-3 space-y-4">
              {navigation.map((section, sectionIndex) => (
                <div key={section.title}>
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    {section.title}
                  </h3>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-150 ${
                            isActive
                              ? `shadow-sm border-r-2`
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 pl-12 pr-6">
          <main className="max-w-screen-2xl mx-auto ml-[250px]">
            {children}
          </main>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setLogoutModalOpen(false)}></div>

          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative z-10">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <LogOut className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                Confirmer la déconnexion
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                onClick={() => setLogoutModalOpen(false)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                onClick={confirmLogout}
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;