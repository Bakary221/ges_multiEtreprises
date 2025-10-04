import React, { useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Users, FileText, CreditCard, BarChart3, Activity, TrendingUp, Calendar, Clock } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAttendance: 0,
    totalPayroll: 0,
    totalReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadDashboardData = async () => {
      // Mock data - in real app, fetch from API
      setStats({
        totalEmployees: 24,
        totalAttendance: 156,
        totalPayroll: 45000,
        totalReports: 8,
      });
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  // Mock data for charts
  const attendanceChartData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    datasets: [
      {
        label: 'Présences',
        data: [22, 20, 24, 23, 21, 18],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const departmentData = {
    labels: ['RH', 'Développement', 'Finance', 'Marketing', 'Opérations'],
    datasets: [
      {
        data: [3, 8, 4, 5, 4],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const payrollTrendData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Masse salariale (€)',
        data: [38000, 42000, 39000, 45000, 41000, 48000],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6 shadow-lg">
            <Activity className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Dashboard Administrateur
          </h1>
          <p className="text-gray-600 text-lg">Gestion de votre entreprise et de vos équipes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group relative overflow-hidden bg-blue-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Employés</p>
                <p className="text-3xl font-bold text-white">{stats.totalEmployees}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-blue-200 rounded-full mr-2"></div>
                  <span className="text-blue-100 text-xs">Actifs</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-green-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Présences</p>
                <p className="text-3xl font-bold text-white">{stats.totalAttendance}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-emerald-200 rounded-full mr-2"></div>
                  <span className="text-emerald-100 text-xs">Cette semaine</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-purple-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Paie Générée</p>
                <p className="text-3xl font-bold text-white">€{stats.totalPayroll.toLocaleString()}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-purple-200 rounded-full mr-2"></div>
                  <span className="text-purple-100 text-xs">Ce mois</span>
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
                <p className="text-amber-100 text-sm font-medium mb-1">Rapports</p>
                <p className="text-3xl font-bold text-white">{stats.totalReports}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-amber-200 rounded-full mr-2"></div>
                  <span className="text-amber-100 text-xs">Générés</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Attendance Trend */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Évolution des Présences</h3>
            </div>
            <div className="h-64">
              <Line data={attendanceChartData} options={chartOptions} />
            </div>
          </div>

          {/* Department Distribution */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl mr-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Répartition par Département</h3>
            </div>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={departmentData} options={chartOptions} />
            </div>
          </div>

          {/* Payroll Overview */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20 lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl mr-4">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Évolution de la Masse Salariale</h3>
            </div>
            <div className="h-64">
              <Bar data={payrollTrendData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white border-opacity-20">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mr-4">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Actions Rapides</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1">
              <Users className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="font-bold text-gray-900 mb-2">Gérer les Employés</h4>
              <p className="text-sm text-gray-600">Ajouter, modifier, archiver les employés</p>
            </button>

            <button className="group p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1">
              <Calendar className="h-8 w-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="font-bold text-gray-900 mb-2">Pointage</h4>
              <p className="text-sm text-gray-600">Enregistrer et gérer les présences</p>
            </button>

            <button className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1">
              <CreditCard className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="font-bold text-gray-900 mb-2">Générer la Paie</h4>
              <p className="text-sm text-gray-600">Calculer et valider les bulletins</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;