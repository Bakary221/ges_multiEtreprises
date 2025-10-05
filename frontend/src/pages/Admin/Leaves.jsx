import React, { useState, useEffect } from 'react';
import { leaveService } from '../../services/leaveService';
import { useCompanyTheme } from '../../hooks/useCompanyTheme';
import { CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

const Leaves = () => {
  const theme = useCompanyTheme();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLeaveRequests, setTotalLeaveRequests] = useState(0);

  const itemsPerPage = 8; // 8 demandes par page pour une grille 4x2

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async (page = 1) => {
    try {
      setLoading(true);
      const response = await leaveService.getAllLeaveRequests({ page, limit: itemsPerPage });

      if (response.success) {
        setLeaveRequests(response.data.leaveRequests || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalLeaveRequests(response.data.total || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading leave requests:', error);
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await leaveService.approveLeaveRequest(id, 'APPROVED');
      loadLeaveRequests(currentPage);
    } catch (error) {
      console.error('Error approving leave request:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await leaveService.approveLeaveRequest(id, 'REJECTED');
      loadLeaveRequests(currentPage);
    } catch (error) {
      console.error('Error rejecting leave request:', error);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadLeaveRequests(page);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: theme.primary }}></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Congés</h1>
      </div>

      {/* Leave Requests Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Demandes de congé</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {leaveRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: `${theme.primary}20` }}>
                      <span className="text-lg font-medium" style={{ color: theme.primary }}>
                        {request.employee?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{request.employee?.name}</h3>
                      <p className="text-sm text-gray-500">{request.employee?.position}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    request.status === 'APPROVED'
                      ? 'bg-green-100 text-green-800'
                      : request.status === 'REJECTED'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status === 'APPROVED' ? 'Approuvé' : request.status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date de début:</span>
                    <span className="font-medium text-gray-900">{new Date(request.startDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date de fin:</span>
                    <span className="font-medium text-gray-900">{new Date(request.endDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Durée:</span>
                    <span className="font-medium text-gray-900">
                      {Math.ceil((new Date(request.endDate) - new Date(request.startDate)) / (1000 * 60 * 60 * 24)) + 1} jour(s)
                    </span>
                  </div>
                </div>

                {request.status === 'PENDING' && (
                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex items-center space-x-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Approuver</span>
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex items-center space-x-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <XCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Rejeter</span>
                    </button>
                  </div>
                )}

                {request.status !== 'PENDING' && (
                  <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      {request.status === 'APPROVED' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="text-sm font-medium text-gray-600">
                        {request.status === 'APPROVED' ? 'Demande approuvée' : 'Demande rejetée'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {leaveRequests.length === 0 && !loading && (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune demande de congé</h3>
              <p className="mt-1 text-sm text-gray-500">
                Il n'y a actuellement aucune demande de congé.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalLeaveRequests)} sur {totalLeaveRequests} demande{totalLeaveRequests > 1 ? 's' : ''} de congé
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (page > totalPages) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 rounded-lg border transition-colors duration-200 ${
                        page === currentPage
                          ? 'border-blue-500 bg-blue-50 text-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaves;