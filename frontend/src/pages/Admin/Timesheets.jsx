import React, { useState, useEffect } from 'react';
import { timesheetService } from '../../services/timesheetService';
import { employeeService } from '../../services/employeeService';
import { useCompanyTheme } from '../../hooks/useCompanyTheme';
import { CheckCircle, Clock, User, ChevronLeft, ChevronRight } from 'lucide-react';

const Timesheets = () => {
  const theme = useCompanyTheme();
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTimesheets, setTotalTimesheets] = useState(0);

  const itemsPerPage = 8; // 8 timesheets par page pour une grille 4x2

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      const [timesheetResponse, employeeResponse] = await Promise.all([
        timesheetService.getAllTimesheets({ page, limit: itemsPerPage }),
        employeeService.getAllEmployees()
      ]);

      if (timesheetResponse.success) {
        setTimesheets(timesheetResponse.data.timesheets || []);
        setTotalPages(timesheetResponse.data.totalPages || 1);
        setTotalTimesheets(timesheetResponse.data.total || 0);
        setCurrentPage(page);
      }

      setEmployees(employeeResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setTimesheets([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (id) => {
    try {
      await timesheetService.validateTimesheet(id);
      loadData(currentPage); // Reload data
    } catch (error) {
      console.error('Error validating timesheet:', error);
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadData(page);
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Timesheets</h1>
      </div>

      {/* Timesheets Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Feuilles de temps</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {timesheets.map((timesheet) => (
              <div key={timesheet.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: `${theme.primary}20` }}>
                      <span className="text-lg font-medium" style={{ color: theme.primary }}>
                        {timesheet.employee?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{timesheet.employee?.name}</h3>
                      <p className="text-sm text-gray-500">{timesheet.employee?.position}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    timesheet.validated
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {timesheet.validated ? 'Validé' : 'En attente'}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Mois:</span>
                    <span className="font-medium text-gray-900">{timesheet.month}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Heures travaillées:</span>
                    <span className="font-medium text-gray-900">{timesheet.hoursWorked}h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Heures normales:</span>
                    <span className="font-medium text-gray-900">160h</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Écart:</span>
                    <span className={`font-medium ${timesheet.hoursWorked >= 160 ? 'text-green-600' : 'text-red-600'}`}>
                      {timesheet.hoursWorked - 160 > 0 ? '+' : ''}{timesheet.hoursWorked - 160}h
                    </span>
                  </div>
                </div>

                {!timesheet.validated && (
                  <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleValidate(timesheet.id)}
                      className="flex items-center space-x-1 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Valider</span>
                    </button>
                  </div>
                )}

                {timesheet.validated && (
                  <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-sm font-medium text-gray-600">Timesheet validé</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {timesheets.length === 0 && !loading && (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun timesheet trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                Il n'y a actuellement aucun timesheet.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalTimesheets)} sur {totalTimesheets} timesheet{totalTimesheets > 1 ? 's' : ''}
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

export default Timesheets;