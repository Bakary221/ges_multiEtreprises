import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { User, FileText, Calendar, CreditCard, Activity, TrendingUp, Clock, Heart } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    leaveBalance: 0,
    workedHours: 0,
    nextPayroll: '',
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadDashboardData = async () => {
      // Mock data - in real app, fetch from API
      setStats({
        leaveBalance: 15,
        workedHours: 168,
        nextPayroll: '15 Octobre 2024',
        pendingRequests: 2,
      });
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  // Mock data for charts
  const hoursWorkedData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'Heures travaillées',
        data: [42, 38, 45, 43],
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const salaryTrendData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Salaire (€)',
        data: [2800, 2800, 2850, 2850, 2900, 2900],
        backgroundColor: 'rgba(236, 72, 153, 0.8)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full mb-6 shadow-lg">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
            Mon Espace Personnel
          </h1>
          <p className="text-gray-600 text-lg">Bienvenue dans votre tableau de bord employé</p>
        </div>

        {/* Welcome Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 p-8 rounded-2xl shadow-xl">
          <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm"></div>
          <div className="relative z-10 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Bonjour, [Nom de l'employé] !</h2>
                <p className="text-pink-100 mb-4">Consultez vos informations, bulletins de paie et demandes de congé.</p>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Dernière connexion: Aujourd'hui</span>
                  </div>
                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-1" />
                    <span>Statut: Actif</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-rose-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm font-medium mb-1">Solde Congés</p>
                <p className="text-3xl font-bold text-white">{stats.leaveBalance} jours</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-pink-200 rounded-full mr-2"></div>
                  <span className="text-pink-100 text-xs">Disponibles</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-purple-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Heures Travaillées</p>
                <p className="text-3xl font-bold text-white">{stats.workedHours}h</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-purple-200 rounded-full mr-2"></div>
                  <span className="text-purple-100 text-xs">Ce mois</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Clock className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-green-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Prochaine Paie</p>
                <p className="text-2xl font-bold text-white">{stats.nextPayroll}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-emerald-200 rounded-full mr-2"></div>
                  <span className="text-emerald-100 text-xs">Date prévue</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-yellow-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">Demandes</p>
                <p className="text-3xl font-bold text-white">{stats.pendingRequests}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-amber-200 rounded-full mr-2"></div>
                  <span className="text-amber-100 text-xs">En attente</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hours Worked Chart */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Évolution des Heures</h3>
            </div>
            <div className="h-64">
              <Line data={hoursWorkedData} options={chartOptions} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white border-opacity-20">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl mr-4">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Actions Rapides</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <button className="group p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1">
                  <User className="h-6 w-6 text-blue-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-bold text-gray-900">Mon Profil</h4>
                  <p className="text-sm text-gray-600">Informations personnelles</p>
                </button>

                <button className="group p-4 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1">
                  <CreditCard className="h-6 w-6 text-green-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-bold text-gray-900">Mes Bulletins</h4>
                  <p className="text-sm text-gray-600">Historique de paie</p>
                </button>

                <button className="group p-4 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1">
                  <FileText className="h-6 w-6 text-purple-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-bold text-gray-900">Mes Timesheets</h4>
                  <p className="text-sm text-gray-600">Feuilles de temps</p>
                </button>

                <button className="group p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1">
                  <Calendar className="h-6 w-6 text-yellow-600 mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <h4 className="font-bold text-gray-900">Mes Congés</h4>
                  <p className="text-sm text-gray-600">Demandes et solde</p>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white border-opacity-20">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mr-4">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Activité Récente</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Bulletin de paie généré</p>
                <p className="text-xs text-gray-600">Juillet 2024 • €2,900.00</p>
              </div>
              <div className="text-xs text-green-600 font-medium">Réussi</div>
            </div>

            <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Demande de congé approuvée</p>
                <p className="text-xs text-gray-600">3 jours en août 2024</p>
              </div>
              <div className="text-xs text-blue-600 font-medium">Approuvé</div>
            </div>

            <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Timesheet validé</p>
                <p className="text-xs text-gray-600">Semaine 30 • 42 heures</p>
              </div>
              <div className="text-xs text-purple-600 font-medium">Validé</div>
            </div>

            <div className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">Demande de congé en attente</p>
                <p className="text-xs text-gray-600">2 jours en octobre 2024</p>
              </div>
              <div className="text-xs text-yellow-600 font-medium">En attente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;