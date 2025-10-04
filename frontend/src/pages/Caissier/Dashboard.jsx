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
import { CreditCard, Users, FileText, CheckCircle, Activity, TrendingUp, DollarSign, Receipt } from 'lucide-react';

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
    successfulPayments: 0,
    pendingPayments: 0,
    totalEmployees: 0,
    receiptsGenerated: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const loadDashboardData = async () => {
      // Mock data - in real app, fetch from API
      setStats({
        successfulPayments: 156,
        pendingPayments: 23,
        totalEmployees: 24,
        receiptsGenerated: 89,
      });
      setLoading(false);
    };

    loadDashboardData();
  }, []);

  // Mock data for charts
  const paymentTrendData = {
    labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Paiements Réussis',
        data: [120, 135, 148, 162, 145, 178],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
      },
      {
        label: 'Paiements en Attente',
        data: [15, 18, 12, 25, 20, 23],
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const paymentMethodsData = {
    labels: ['Virement', 'Orange Money', 'Wave', 'Espèces'],
    datasets: [
      {
        data: [45, 30, 20, 5],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  const monthlyPaymentsData = {
    labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      {
        label: 'Montant (€)',
        data: [12500, 15200, 13800, 16800],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-6 shadow-lg">
            <DollarSign className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-2">
            Dashboard Caissier
          </h1>
          <p className="text-gray-600 text-lg">Gestion des paiements et transactions</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group relative overflow-hidden bg-green-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Paiements Réussis</p>
                <p className="text-3xl font-bold text-white">{stats.successfulPayments}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-emerald-200 rounded-full mr-2"></div>
                  <span className="text-emerald-100 text-xs">Ce mois</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-yellow-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm font-medium mb-1">En Attente</p>
                <p className="text-3xl font-bold text-white">{stats.pendingPayments}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-amber-200 rounded-full mr-2"></div>
                  <span className="text-amber-100 text-xs">À traiter</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
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

          <div className="group relative overflow-hidden bg-purple-600 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Reçus Générés</p>
                <p className="text-3xl font-bold text-white">{stats.receiptsGenerated}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-purple-200 rounded-full mr-2"></div>
                  <span className="text-purple-100 text-xs">Ce mois</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Receipt className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Trends */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Évolution des Paiements</h3>
            </div>
            <div className="h-64">
              <Line data={paymentTrendData} options={chartOptions} />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl mr-4">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Méthodes de Paiement</h3>
            </div>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={paymentMethodsData} options={chartOptions} />
            </div>
          </div>

          {/* Monthly Payments */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20 lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-4">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Paiements Mensuels</h3>
            </div>
            <div className="h-64">
              <Bar data={monthlyPaymentsData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white border-opacity-20">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl mr-4">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Actions Rapides</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="group p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1">
              <CreditCard className="h-8 w-8 text-emerald-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="font-bold text-gray-900 mb-2">Traiter les Paiements</h4>
              <p className="text-sm text-gray-600">Valider et effectuer les transactions</p>
            </button>

            <button className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1">
              <Users className="h-8 w-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="font-bold text-gray-900 mb-2">Consulter Employés</h4>
              <p className="text-sm text-gray-600">Voir les informations des employés</p>
            </button>

            <button className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1">
              <Receipt className="h-8 w-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform duration-300" />
              <h4 className="font-bold text-gray-900 mb-2">Générer Reçus</h4>
              <p className="text-sm text-gray-600">Imprimer et envoyer les reçus</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;