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
import api from '../../services/api';
import { useCompanyTheme } from '../../hooks/useCompanyTheme';

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
  const theme = useCompanyTheme();
  const [stats, setStats] = useState({
    successfulPayments: 0,
    pendingPayments: 0,
    totalEmployees: 0,
    receiptsGenerated: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch real data from API
        const response = await api.get('/caissier/dashboard/stats');
        setStats(response.data.data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Fallback to mock data if API fails
        setStats({
          successfulPayments: 0,
          pendingPayments: 0,
          totalEmployees: 0,
          receiptsGenerated: 0,
        });
      } finally {
        setLoading(false);
      }
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group relative overflow-hidden p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" style={{ backgroundColor: theme.primary }}>
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium mb-1 opacity-90">Paiements Réussis</p>
                <p className="text-3xl font-bold text-white">{stats.successfulPayments}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 opacity-70"></div>
                  <span className="text-white text-xs opacity-80">Ce mois</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" style={{ backgroundColor: theme.secondary }}>
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium mb-1 opacity-90">En Attente</p>
                <p className="text-3xl font-bold text-white">{stats.pendingPayments}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 opacity-70"></div>
                  <span className="text-white text-xs opacity-80">À traiter</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium mb-1 opacity-90">Employés</p>
                <p className="text-3xl font-bold text-white">{stats.totalEmployees}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 opacity-70"></div>
                  <span className="text-white text-xs opacity-80">Actifs</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2" style={{ backgroundColor: theme.primary, opacity: 0.9 }}>
            <div className="absolute inset-0 bg-white bg-opacity-10 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium mb-1 opacity-90">Reçus Générés</p>
                <p className="text-3xl font-bold text-white">{stats.receiptsGenerated}</p>
                <div className="mt-2 flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-2 opacity-70"></div>
                  <span className="text-white text-xs opacity-80">Ce mois</span>
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
          <div className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl mr-4" style={{ backgroundColor: theme.primary }}>
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Évolution des Paiements</h3>
            </div>
            <div className="h-64">
              <Line data={paymentTrendData} options={chartOptions} />
            </div>
          </div>

          {/* Payment Methods */}
          <div className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl mr-4" style={{ backgroundColor: theme.secondary }}>
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Méthodes de Paiement</h3>
            </div>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={paymentMethodsData} options={chartOptions} />
            </div>
          </div>

          {/* Monthly Payments */}
          <div className="group bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20 lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="p-3 rounded-xl mr-4" style={{ background: `linear-gradient(135deg, ${theme.primary}, ${theme.secondary})` }}>
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
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white border-opacity-20">
          <div className="flex items-center mb-6">
            <div className="p-3 rounded-xl mr-4" style={{ backgroundColor: theme.primary }}>
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Actions Rapides</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button className="group p-6 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1" style={{ backgroundColor: `${theme.primary}10`, border: `1px solid ${theme.primary}20` }}>
              <CreditCard className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" style={{ color: theme.primary }} />
              <h4 className="font-bold text-gray-900 mb-2">Traiter les Paiements</h4>
              <p className="text-sm text-gray-600">Valider et effectuer les transactions</p>
            </button>

            <button className="group p-6 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1" style={{ backgroundColor: `${theme.secondary}10`, border: `1px solid ${theme.secondary}20` }}>
              <Users className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" style={{ color: theme.secondary }} />
              <h4 className="font-bold text-gray-900 mb-2">Consulter Employés</h4>
              <p className="text-sm text-gray-600">Voir les informations des employés</p>
            </button>

            <button className="group p-6 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1" style={{ backgroundColor: `${theme.primary}10`, border: `1px solid ${theme.primary}20` }}>
              <Receipt className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" style={{ color: theme.primary }} />
              <h4 className="font-bold text-gray-900 mb-2">Générer Reçus</h4>
              <p className="text-sm text-gray-600">Imprimer et envoyer les reçus</p>
            </button>

            <a href="/caissier/payruns" className="group p-6 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1 block" style={{ backgroundColor: `${theme.secondary}10`, border: `1px solid ${theme.secondary}20` }}>
              <FileText className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" style={{ color: theme.secondary }} />
              <h4 className="font-bold text-gray-900 mb-2">Gérer Payruns</h4>
              <p className="text-sm text-gray-600">Valider et clôturer les périodes de paie</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;