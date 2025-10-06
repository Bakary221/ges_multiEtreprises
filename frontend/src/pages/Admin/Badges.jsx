import React, { useState, useEffect } from 'react';
import { Badge, Download, QrCode, Search, Eye, RefreshCw, Printer, Users, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCompany } from '../../utils/CompanyContext';
import { useCompanyTheme } from '../../hooks/useCompanyTheme';
import { useNotifications } from '../../hooks/useNotifications';
import { employeeService } from '../../services/employeeService';

const Badges = () => {
  const { company } = useCompany();
  const theme = useCompanyTheme();
  const { addNotification } = useNotifications();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [generatingBadge, setGeneratingBadge] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    hasBadge: 'all' // all, with, without
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 8
  });
  const [badgeStats, setBadgeStats] = useState({
    totalWithBadges: 0,
    totalWithoutBadges: 0
  });

  useEffect(() => {
    loadEmployees(1); // Reset to page 1 when filters change
  }, [filters]);

  const loadEmployees = async (page = pagination.currentPage) => {
    try {
      setLoading(true);
      const response = await employeeService.getEmployees({
        page,
        limit: pagination.limit,
        ...filters
      });

      if (response.success) {
        // Add badge status to employees
        const employeesWithBadgeStatus = (response.data.employees || []).map(employee => ({
          ...employee,
          hasBadge: employee.badgeGeneratedAt ? true : false,
          badgeUrl: employee.badgeGeneratedAt ? `/uploads/badges/badge_${employee.id}.pdf` : null
        }));

        setEmployees(employeesWithBadgeStatus);
        setPagination({
          currentPage: response.data.currentPage,
          totalPages: response.data.totalPages,
          total: response.data.total,
          limit: response.data.limit
        });

        if (response.data.stats) {
          setBadgeStats({
            totalWithBadges: response.data.stats.totalWithBadges || 0,
            totalWithoutBadges: response.data.stats.totalWithoutBadges || 0
          });
        }
      }
    } catch (error) {
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      loadEmployees(newPage);
    }
  };

  const generateBadge = async (employeeId) => {
    setGeneratingBadge(true);
    try {
      // Call backend to generate badge
      const response = await fetch(`/api/employees/${employeeId}/badge`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to generate badge');
      }

      const data = await response.json();

      if (data.success) {
        // Update employee in list
        setEmployees(prev => prev.map(emp =>
          emp.id === employeeId
            ? {
                ...emp,
                hasBadge: true,
                badgeGeneratedAt: new Date().toISOString(),
                badgeUrl: `/uploads/badges/badge_${emp.id}.pdf`,
                qrCode: data.data.qrCode
              }
            : emp
        ));

        // Show badge modal
        const employee = employees.find(e => e.id === employeeId);
        if (employee) {
          setSelectedEmployee({
            ...employee,
            hasBadge: true,
            badgeGeneratedAt: new Date().toISOString(),
            badgeUrl: `/uploads/badges/badge_${employee.id}.pdf`,
            qrCode: data.data.qrCode
          });
          setShowBadgeModal(true);
        }

        addNotification('Badge généré avec succès !', 'success', 5000, false);
      }
    } catch (error) {
      addNotification('Erreur lors de la génération du badge: ' + error.message, 'error');
    } finally {
      setGeneratingBadge(false);
    }
  };

  const printBadge = async (employeeId) => {
    try {
      console.log('🖨️ FRONTEND: Starting print for employee:', employeeId);

      // Fetch the PDF through the authenticated API endpoint
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      console.log('🖨️ FRONTEND: API URL:', apiUrl);
      const response = await fetch(`${apiUrl}/employees/${employeeId}/badge-pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      console.log('🖨️ FRONTEND: Response status:', response.status, 'headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🖨️ FRONTEND: Response error:', errorText);
        throw new Error(`Failed to fetch PDF: ${response.status} - ${errorText}`);
      }

      // Get the PDF as blob
      const pdfBlob = await response.blob();
      console.log('🖨️ FRONTEND: Blob received, size:', pdfBlob.size, 'type:', pdfBlob.type);

      if (pdfBlob.size === 0) {
        throw new Error('PDF blob is empty');
      }

      // Create object URL for the blob
      const pdfUrl = URL.createObjectURL(pdfBlob);
      console.log('🖨️ FRONTEND: Object URL created:', pdfUrl);

      // Open PDF in new window for printing
      const printWindow = window.open(pdfUrl, '_blank', 'width=800,height=600');
      console.log('🖨️ FRONTEND: Print window opened:', !!printWindow);

      // Wait a bit for the PDF to load, then trigger print
      setTimeout(() => {
        if (printWindow) {
          try {
            printWindow.focus();
            printWindow.print();
            console.log('🖨️ FRONTEND: Print triggered');
          } catch (error) {
            console.error('🖨️ FRONTEND: Error printing PDF:', error);
          }
        } else {
          console.error('🖨️ FRONTEND: Print window not opened');
        }
        // Clean up the object URL after printing
        setTimeout(() => {
          URL.revokeObjectURL(pdfUrl);
          console.log('🖨️ FRONTEND: Object URL cleaned up');
        }, 5000);
      }, 1000);

    } catch (error) {
      console.error('🖨️ FRONTEND: Error printing badge:', error);
      addNotification('Erreur lors de l\'impression du badge: ' + error.message, 'error', 5000, false);
    }
  };

  const viewBadge = async (employee) => {
    try {
      // Fetch badge details including QR code
      const response = await fetch(`/api/employees/${employee.id}/badge-details`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedEmployee({
            ...employee,
            qrCode: data.data.qrCode,
            qrData: data.data.qrData,
            badgeUrl: data.data.badgeUrl
          });
        } else {
          setSelectedEmployee(employee);
        }
      } else {
        setSelectedEmployee(employee);
      }
    } catch (error) {
      console.error('Error fetching badge details:', error);
      setSelectedEmployee(employee);
    }
    setShowBadgeModal(true);
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !filters.search ||
      employee.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.matricule?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesBadge = filters.hasBadge === 'all' ||
      (filters.hasBadge === 'with' && employee.badgeUrl) ||
      (filters.hasBadge === 'without' && !employee.badgeUrl);

    return matchesSearch && matchesBadge;
  });

  const totalEmployees = pagination.total;

  if (loading && employees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement des badges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="w-full space-y-6">

        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white border-opacity-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-3 rounded-xl mr-4" style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}>
                <Badge className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Badges</h1>
                <p className="text-gray-600 text-lg">{totalEmployees} employé{totalEmployees > 1 ? 's' : ''} dans {company?.name || 'l\'entreprise'}</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Badges générés</p>
                  <p className="text-3xl font-bold">{badgeStats.totalWithBadges || 0}</p>
                </div>
                <Badge className="h-8 w-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Sans badge</p>
                  <p className="text-3xl font-bold">{badgeStats.totalWithoutBadges}</p>
                </div>
                <Users className="h-8 w-8 opacity-80" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Taux de couverture</p>
                  <p className="text-3xl font-bold">
                    {totalEmployees > 0 ? Math.round((badgeStats.totalWithBadges / totalEmployees) * 100) : 0}%
                  </p>
                </div>
                <QrCode className="h-8 w-8 opacity-80" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white border-opacity-20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Nom ou matricule..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut badge</label>
              <select
                value={filters.hasBadge}
                onChange={(e) => setFilters(prev => ({ ...prev, hasBadge: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les employés</option>
                <option value="with">Avec badge</option>
                <option value="without">Sans badge</option>
              </select>
            </div>
          </div>
        </div>

        {/* Employees Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white border-opacity-20 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: `${theme.primary}20` }}>
                      <span className="text-lg font-medium" style={{ color: theme.primary }}>
                        {employee.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.matricule}</p>
                    </div>
                  </div>
                  {employee.badgeUrl ? (
                    <div className="flex items-center text-green-600">
                      <Badge className="h-5 w-5 mr-1" />
                      <span className="text-xs font-medium">Badge OK</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <Badge className="h-5 w-5 mr-1" />
                      <span className="text-xs font-medium">Sans badge</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Poste:</span>
                    <span className="font-medium text-gray-900">{employee.position}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Département:</span>
                    <span className="font-medium text-gray-900">{employee.department?.name || 'Non assigné'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  {employee.badgeUrl ? (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => viewBadge(employee)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                        title="Voir le badge"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Voir</span>
                      </button>
                      <button
                        onClick={() => printBadge(employee.id)}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-800 transition-colors duration-200"
                        title="Imprimer le badge"
                      >
                        <Printer className="h-4 w-4" />
                        <span className="text-sm font-medium">Imprimer</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => generateBadge(employee.id)}
                      disabled={generatingBadge}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium transition-all duration-300 disabled:opacity-50"
                      style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
                    >
                      {generatingBadge ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <QrCode className="h-4 w-4" />
                      )}
                      <span>Générer Badge</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredEmployees.length === 0 && (
            <div className="text-center py-12">
              <Badge className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun employé trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {Object.values(filters).some(v => v && v !== 'all') ? 'Essayez de modifier vos filtres.' : 'Tous les employés ont des badges !'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {((pagination.currentPage - 1) * pagination.limit) + 1} à {Math.min(pagination.currentPage * pagination.limit, pagination.total)} sur {pagination.total} employés
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                          pagination.currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Badge Modal */}
        {showBadgeModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Badge Employé</h2>
                  <button
                    onClick={() => setShowBadgeModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="text-center space-y-6">
                  {/* Employee Info */}
                  <div>
                    <div className="h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${theme.primary}20` }}>
                      <span className="text-3xl font-medium" style={{ color: theme.primary }}>
                        {selectedEmployee.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h3>
                    <p className="text-gray-600">{selectedEmployee.position}</p>
                    <p className="text-sm text-gray-500">Matricule: {selectedEmployee.matricule}</p>
                    {selectedEmployee.department && (
                      <p className="text-sm text-gray-500">Département: {selectedEmployee.department.name}</p>
                    )}
                  </div>

                  {/* QR Code */}
                  {selectedEmployee.qrCode && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Code QR du Badge</h4>
                      <img
                        src={selectedEmployee.qrCode}
                        alt="QR Code Badge"
                        className="w-40 h-40 mx-auto border border-gray-300 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-3">
                        Scannez ce QR code pour pointer
                      </p>
                      <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                        <strong>Données :</strong> {selectedEmployee.matricule} • {selectedEmployee.company?.name}
                      </div>
                    </div>
                  )}

                </div>

                {/* Actions */}
                <div className="flex space-x-4 mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => printBadge(selectedEmployee.id)}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg text-white font-medium transition-all duration-300"
                    style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
                  >
                    <Printer className="h-5 w-5" />
                    <span>Imprimer le Badge PDF</span>
                  </button>
                  <button
                    onClick={() => generateBadge(selectedEmployee.id)}
                    disabled={generatingBadge}
                    className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-5 w-5 ${generatingBadge ? 'animate-spin' : ''}`} />
                    <span>Regénérer Badge</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Badges;