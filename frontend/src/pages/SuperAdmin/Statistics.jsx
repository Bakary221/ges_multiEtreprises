import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { companyService } from '../../services/companyService';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Award,
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import {
  Line,
  Bar,
  Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Statistics = () => {
  const { user, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalCompanies: 0,
    totalEmployees: 0,
    totalPayroll: 0,
    monthlyGrowth: 0,
    activeUsers: 0,
    avgSalary: 0,
    topPerformingCompany: null
  });

  const [chartData, setChartData] = useState({
    revenueTrend: [],
    companyPerformance: [],
    employeeGrowth: [],
    departmentDistribution: [],
    attendanceRate: []
  });

  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || userRole !== 'SUPERADMIN') {
        navigate('/login');
        return;
      }
      loadStatistics();
    }
  }, [authLoading, isAuthenticated, userRole, navigate, timeRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);

      // Get companies data
      const companiesResponse = await companyService.getAllCompanies();
      const companies = companiesResponse.data?.data || [];

      // Get dashboard stats
      const statsResponse = await companyService.getDashboardStats();
      const dashboardStats = statsResponse.data?.data || {};

      // Calculate comprehensive statistics
      const totalRevenue = dashboardStats.payrollData?.reduce((sum, item) => sum + item.amount, 0) || 0;
      const totalCompanies = companies.length;
      const totalEmployees = companies.reduce((sum, company) => sum + (company.employeeCount || 0), 0);
      const totalPayroll = companies.reduce((sum, company) => sum + (company.totalPayroll || 0), 0);
      const avgSalary = totalEmployees > 0 ? Math.round(totalPayroll / totalEmployees) : 0;

      // Find top performing company
      const topCompany = companies.reduce((top, company) =>
        (company.totalPayroll || 0) > (top?.totalPayroll || 0) ? company : top
      , null);

      setStats({
        totalRevenue,
        totalCompanies,
        totalEmployees,
        totalPayroll,
        monthlyGrowth: 12.5,
        activeUsers: totalEmployees,
        avgSalary,
        topPerformingCompany: topCompany
      });

      setChartData({
        revenueTrend: dashboardStats.payrollData || [],
        companyPerformance: companies.map(company => ({
          name: company.name,
          revenue: company.totalPayroll || 0,
          employees: company.employeeCount || 0
        })),
        employeeGrowth: dashboardStats.employeeDistribution || [],
        departmentDistribution: dashboardStats.employeeDistribution || [],
        attendanceRate: dashboardStats.attendanceData || []
      });

    } catch (error) {
      console.error('Error loading statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, change, icon: Icon, color, bgColor, changeType = 'positive' }) => (
    <div className={`${bgColor} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white border-opacity-20`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-80 text-sm font-medium mb-1">{title}</p>
          <p className="text-white text-3xl font-bold mb-2">
            {typeof value === 'number' && value >= 1000
              ? `${(value / 1000).toFixed(1)}k`
              : value?.toLocaleString() || '0'
            }
          </p>
          {change && (
            <div className={`flex items-center text-sm ${
              changeType === 'positive' ? 'text-green-200' : 'text-red-200'
            }`}>
              {changeType === 'positive' ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span className="font-medium">{change}%</span>
              <span className="text-white text-opacity-60 ml-1">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-white bg-opacity-20`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  const revenueChartData = {
    labels: chartData.revenueTrend.map(item => item.month) || [],
    datasets: [
      {
        label: 'Revenus (FCFA)',
        data: chartData.revenueTrend.map(item => item.amount) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const companyPerformanceData = {
    labels: chartData.companyPerformance.map(item => item.name.substring(0, 15) + (item.name.length > 15 ? '...' : '')) || [],
    datasets: [
      {
        label: 'Revenus par entreprise',
        data: chartData.companyPerformance.map(item => item.revenue) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const departmentData = {
    labels: chartData.departmentDistribution.map(item => item.department) || [],
    datasets: [
      {
        data: chartData.departmentDistribution.map(item => item.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
    ],
  };

  const attendanceData = {
    labels: chartData.attendanceRate.map(item => item.day) || [],
    datasets: [
      {
        label: 'Présents',
        data: chartData.attendanceRate.map(item => item.present) || [],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
      {
        label: 'Absents',
        data: chartData.attendanceRate.map(item => item.absent) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            weight: '500'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value) {
            if (value >= 1000000) {
              return (value / 1000000).toFixed(1) + 'M';
            } else if (value >= 1000) {
              return (value / 1000).toFixed(1) + 'k';
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
      }
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full mb-6 shadow-lg">
            <BarChart3 className="h-10 w-10 text-white animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== 'SUPERADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="w-full mx-auto space-y-8">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                <BarChart3 className="h-10 w-10 text-blue-600 mr-4" />
                Statistiques Avancées
              </h1>
              <p className="text-gray-600 text-lg">Analyse complète des performances de votre plateforme</p>
            </div>

            <div className="flex items-center space-x-4">
              {/* Time Range Filter */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                >
                  <option value="1month">1 mois</option>
                  <option value="3months">3 mois</option>
                  <option value="6months">6 mois</option>
                  <option value="1year">1 an</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={loadStatistics}
                className="inline-flex items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Revenus Totaux"
              value={stats.totalRevenue}
              change={stats.monthlyGrowth}
              icon={DollarSign}
              color="bg-green-500"
              bgColor="bg-gradient-to-r from-green-500 to-green-600"
            />
            <StatCard
              title="Entreprises Actives"
              value={stats.totalCompanies}
              change={8.2}
              icon={Building2}
              color="bg-blue-500"
              bgColor="bg-gradient-to-r from-blue-500 to-blue-600"
            />
            <StatCard
              title="Employés Totaux"
              value={stats.totalEmployees}
              change={15.3}
              icon={Users}
              color="bg-purple-500"
              bgColor="bg-gradient-to-r from-purple-500 to-purple-600"
            />
            <StatCard
              title="Salaire Moyen"
              value={stats.avgSalary}
              change={5.7}
              icon={Award}
              color="bg-yellow-500"
              bgColor="bg-gradient-to-r from-yellow-500 to-yellow-600"
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

          {/* Revenue Trend */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Évolution des Revenus</h3>
                <p className="text-gray-600 text-sm">Tendance sur les 6 derniers mois</p>
              </div>
            </div>
            <div className="h-80">
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>

          {/* Company Performance */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl mr-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Performance par Entreprise</h3>
                <p className="text-gray-600 text-sm">Revenus générés par entreprise</p>
              </div>
            </div>
            <div className="h-80">
              <Bar data={companyPerformanceData} options={chartOptions} />
            </div>
          </div>

          {/* Department Distribution */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl mr-4">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Répartition par Département</h3>
                <p className="text-gray-600 text-sm">Distribution des employés</p>
              </div>
            </div>
            <div className="h-80 flex items-center justify-center">
              <Doughnut data={departmentData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom',
                    labels: {
                      usePointStyle: true,
                      padding: 15,
                      font: {
                        size: 11,
                        weight: '500'
                      }
                    }
                  }
                }
              }} />
            </div>
          </div>

          {/* Attendance Rate */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl mr-4">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Taux de Présence</h3>
                <p className="text-gray-600 text-sm">Cette semaine</p>
              </div>
            </div>
            <div className="h-80">
              <Bar data={attendanceData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl mr-4">
              <Award className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Insights et Tendances</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <Target className="h-8 w-8 text-blue-600 mr-3" />
                <h4 className="text-lg font-semibold text-blue-900">Entreprise Leader</h4>
              </div>
              <p className="text-blue-800 font-medium text-xl mb-2">
                {stats.topPerformingCompany?.name || 'N/A'}
              </p>
              <p className="text-blue-600 text-sm">
                {stats.topPerformingCompany?.totalPayroll?.toLocaleString() || 0} FCFA générés
              </p>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center mb-4">
                <Users className="h-8 w-8 text-green-600 mr-3" />
                <h4 className="text-lg font-semibold text-green-900">Croissance RH</h4>
              </div>
              <p className="text-green-800 font-medium text-xl mb-2">
                +{stats.monthlyGrowth}%
              </p>
              <p className="text-green-600 text-sm">
                Augmentation mensuelle
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center mb-4">
                <Clock className="h-8 w-8 text-purple-600 mr-3" />
                <h4 className="text-lg font-semibold text-purple-900">Taux d'Activité</h4>
              </div>
              <p className="text-purple-800 font-medium text-xl mb-2">
                94.2%
              </p>
              <p className="text-purple-600 text-sm">
                Taux de présence moyen
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Statistics;