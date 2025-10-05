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
import { Users, FileText, CreditCard, BarChart3, Activity, TrendingUp, Calendar, Clock, RefreshCw } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';
import { useCompany } from '../../utils/CompanyContext';
import { useCompanyTheme } from '../../hooks/useCompanyTheme';
import { employeeService } from '../../services/employeeService';

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
  const { company } = useCompany();
  const theme = useCompanyTheme();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalAttendance: 0,
    totalPayroll: 0,
    totalReports: 0,
  });
  const [chartsData, setChartsData] = useState({
    attendanceData: [],
    employeeDistribution: [],
    payrollData: []
  });
  const [loading, setLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [hasRealData, setHasRealData] = useState(false);

  const loadDashboardData = async (isRetry = false) => {
    try {
      const [statsResponse, chartsResponse] = await Promise.all([
        employeeService.getCompanyStats(),
        employeeService.getDashboardCharts()
      ]);

      console.log('📊 Stats response:', statsResponse);
      console.log('📊 Charts response:', chartsResponse);
      console.log('📊 statsResponse.data exists?', !!statsResponse.data);
      console.log('📊 statsResponse.data type:', typeof statsResponse.data);
      console.log('📊 statsResponse.data value:', statsResponse.data);
      console.log('📊 chartsResponse.data exists?', !!chartsResponse.data);
      console.log('📊 chartsResponse.data type:', typeof chartsResponse.data);
      console.log('📊 chartsResponse.data value:', chartsResponse.data);

      if (statsResponse.data) {
        setStats(statsResponse.data);
        setHasRealData(true);
        console.log('✅ Real data loaded successfully:', statsResponse.data);
      } else {
        console.log('❌ No stats data in response');
      }

      if (chartsResponse.data) {
        setChartsData(chartsResponse.data);
        console.log('✅ Charts data loaded successfully');
      } else {
        console.log('❌ No charts data in response');
      }

      setRetryCount(0); // Reset retry count on success
    } catch (apiError) {
      console.error(`API calls failed (attempt ${retryCount + 1}):`, apiError);
      console.error('API Error response:', apiError.response);
      console.error('API Error status:', apiError.response?.status);
      console.error('API Error data:', apiError.response?.data);
      console.error('API Error config:', apiError.config);

      // Auto-retry up to 3 times with increasing delay
      if (retryCount < 3 && !isRetry) {
        setRetryCount(prev => prev + 1);
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`🔄 Retrying in ${delay}ms...`);
        setTimeout(() => loadDashboardData(true), delay);
        return;
      }

      // After all retries failed, show error state
      setStats({
        totalEmployees: 'Erreur',
        totalAttendance: 'Erreur',
        totalPayroll: 'Erreur',
        totalReports: 'Erreur',
      });
      setChartsData({
        attendanceData: [],
        employeeDistribution: [],
        payrollData: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [company]);

  // Manual refresh function
  const handleRefresh = () => {
    setLoading(true);
    setRetryCount(0);
    loadDashboardData();
  };

  // Dynamic data for charts
  const attendanceChartData = {
    labels: chartsData.attendanceData?.map(item => item.day) || [],
    datasets: [
      {
        label: 'Présences',
        data: chartsData.attendanceData?.map(item => item.present) || [],
        borderColor: theme.primary,
        backgroundColor: `${theme.primary}20`,
        tension: 0.4,
      },
    ],
  };

  const departmentData = {
    labels: chartsData.employeeDistribution?.map(item => item.department) || [],
    datasets: [
      {
        data: chartsData.employeeDistribution?.map(item => item.count) || [],
        backgroundColor: [
          `${theme.primary}CC`,
          `${theme.primary}99`,
          `${theme.primary}66`,
          '#F59E0BCC',
          '#EF4444CC',
        ],
      },
    ],
  };

  const payrollTrendData = {
    labels: chartsData.payrollData?.map(item => item.month) || [],
    datasets: [
      {
        label: `Masse salariale (${company?.currency || 'XOF'})`,
        data: chartsData.payrollData?.map(item => item.amount) || [],
        backgroundColor: `${theme.primary}CC`,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement du tableau de bord...</p>
          <p className="text-gray-500 text-sm mt-2">Récupération des données de {company?.name || 'l\'entreprise'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="w-full space-y-4">

        {/* Company Header */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white border-opacity-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt="Company logo"
                  className="h-16 w-16 rounded-2xl object-contain mr-6 shadow-lg"
                />
              ) : (
                <div className="h-16 w-16 rounded-2xl flex items-center justify-center mr-6 shadow-lg" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}>
                  <span className="text-2xl font-bold text-white">
                    {company?.name?.charAt(0)?.toUpperCase() || 'C'}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{company?.name || 'Entreprise'}</h1>
                <p className="text-gray-600 text-lg">Tableau de bord - {new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
               <div className="flex items-center space-x-2">
                 <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.primary }} title="Couleur primaire"></div>
                 <div className="w-4 h-4 rounded-full" style={{ backgroundColor: theme.secondary }} title="Couleur secondaire"></div>
               </div>
               <div className="text-right">
                 <p className="text-sm text-gray-600">Devise</p>
                 <p className="font-semibold text-gray-900">{company?.currency || 'XOF'}</p>
                 <div className="flex items-center space-x-2 mt-1">
                   <div className={`w-2 h-2 rounded-full ${hasRealData ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                   <span className="text-xs text-gray-500">
                     {hasRealData ? 'Données à jour' : 'Chargement...'}
                   </span>
                 </div>
               </div>
               <button
                 onClick={handleRefresh}
                 disabled={loading}
                 className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                 title="Actualiser les données"
               >
                 <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                 <span className="text-sm font-medium">Actualiser</span>
               </button>
             </div>
          </div>
        </div>


        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Carte 1 - Employés */}
          <div
            className="group relative overflow-hidden p-8 rounded-2xl shadow-xl transition-all duration-300"
            style={theme.style.primaryBackground}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Employés</p>
                <p className="text-3xl font-bold text-white">{stats.totalEmployees}</p>
                <div className="mt-2 flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  ></div>
                  <span className="text-blue-100 text-xs">
                    Actifs dans {company?.name || "l'entreprise"}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Carte 2 - Présences */}
          <div
            className="group relative overflow-hidden p-8 rounded-2xl shadow-xl transition-all duration-300"
            style={{ backgroundColor: `${theme.primary}E6` }}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium mb-1">Présences</p>
                <p className="text-3xl font-bold text-white">{stats.totalAttendance}</p>
                <div className="mt-2 flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  ></div>
                  <span className="text-white text-xs">
                    Ce mois ({new Date().toLocaleDateString('fr-FR', { month: 'short' })})
                  </span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Carte 3 - Masse Salariale */}
          <div
            className="group relative overflow-hidden p-8 rounded-2xl shadow-xl transition-all duration-300"
            style={theme.style.secondaryBackground}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium mb-1">Masse Salariale</p>
                <p className="text-3xl font-bold text-white">
                  {company?.currency || 'XOF'} {stats.totalPayroll.toLocaleString()}
                </p>
                <div className="mt-2 flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  ></div>
                  <span className="text-white text-xs">Paiements effectués</span>
                </div>
              </div>
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Carte 4 - Bulletins */}
          <div
            className="group relative overflow-hidden p-8 rounded-2xl shadow-xl transition-all duration-300"
            style={{ backgroundColor: `${theme.primary}CC` }}
          >
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium mb-1">Bulletins</p>
                <p className="text-3xl font-bold text-white">{stats.totalReports}</p>
                <div className="mt-2 flex items-center">
                  <div
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
                  ></div>
                  <span className="text-white text-xs">Générés ce mois</span>
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
              <div className="p-3 rounded-xl mr-4" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}>
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
              <div className="p-3 rounded-xl mr-4" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.primary}99)` }}>
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
              <div className="p-3 rounded-xl mr-4" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.primary}99)` }}>
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
            <div className="p-3 rounded-xl mr-4" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}>
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Actions Rapides - {company?.name || 'Entreprise'}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button className="group p-6 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1" style={{ background: `linear-gradient(to bottom right, ${theme.primary}15, ${theme.primary}25)`, border: `1px solid ${theme.primary}30` }}>
              <Users className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" style={{ color: theme.primary }} />
              <h4 className="font-bold text-gray-900 mb-2">Équipe {company?.name || 'Entreprise'}</h4>
              <p className="text-sm text-gray-600">Gérer les {stats.totalEmployees} employé{stats.totalEmployees > 1 ? 's' : ''} actifs</p>
            </button>

            <button className="group p-6 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1" style={{ background: `linear-gradient(to bottom right, ${theme.primary}15, ${theme.primary}25)`, border: `1px solid ${theme.primary}30` }}>
              <Calendar className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" style={{ color: theme.primary }} />
              <h4 className="font-bold text-gray-900 mb-2">Suivi des Présences</h4>
              <p className="text-sm text-gray-600">{stats.totalAttendance} présence{stats.totalAttendance > 1 ? 's' : ''} enregistrée{stats.totalAttendance > 1 ? 's' : ''} ce mois</p>
            </button>

            <button className="group p-6 rounded-xl hover:shadow-lg transition-all duration-300 text-left transform hover:-translate-y-1" style={{ background: `linear-gradient(to bottom right, ${theme.primary}15, ${theme.primary}25)`, border: `1px solid ${theme.primary}30` }}>
              <CreditCard className="h-8 w-8 mb-3 group-hover:scale-110 transition-transform duration-300" style={{ color: theme.primary }} />
              <h4 className="font-bold text-gray-900 mb-2">Gestion Paie</h4>
              <p className="text-sm text-gray-600">{stats.totalReports} bulletin{stats.totalReports > 1 ? 's' : ''} généré{stats.totalReports > 1 ? 's' : ''} en {company?.currency || 'XOF'}</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;