import React, { useState, useEffect } from 'react';
import { contractService } from '../../services/contractService';
import { employeeService } from '../../services/employeeService';
import { useCompanyTheme } from '../../hooks/useCompanyTheme';
import { Plus, FileText, Calendar, Edit, ChevronLeft, ChevronRight } from 'lucide-react';

const Contracts = () => {
  const theme = useCompanyTheme();
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContracts, setTotalContracts] = useState(0);

  const itemsPerPage = 8; // 8 contrats par page pour une grille 4x2
  const [formData, setFormData] = useState({
    type: '',
    startDate: '',
    endDate: '',
    salary: '',
    employeeId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (page = 1) => {
    try {
      setLoading(true);
      const [contractResponse, employeeResponse] = await Promise.all([
        contractService.getAllContracts({ page, limit: itemsPerPage }),
        employeeService.getAllEmployees()
      ]);

      if (contractResponse.success) {
        setContracts(contractResponse.data.contracts || []);
        setTotalPages(contractResponse.data.totalPages || 1);
        setTotalContracts(contractResponse.data.total || 0);
        setCurrentPage(page);
      }

      setEmployees(employeeResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setContracts([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await contractService.createContract(formData);
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating contract:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await contractService.updateContract(editingContract.id, formData);
      setEditingContract(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error updating contract:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      type: '',
      startDate: '',
      endDate: '',
      salary: '',
      employeeId: '',
    });
  };

  const openEditModal = (contract) => {
    setEditingContract(contract);
    setFormData({
      type: contract.type,
      startDate: contract.startDate.split('T')[0],
      endDate: contract.endDate ? contract.endDate.split('T')[0] : '',
      salary: contract.salary,
      employeeId: contract.employeeId,
    });
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Contrats</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-300 transform hover:scale-105"
          style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Contrat
        </button>
      </div>

      {/* Contracts Grid */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Contrats</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {contracts.map((contract) => (
              <div key={contract.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center mr-4" style={{ backgroundColor: `${theme.primary}20` }}>
                      <FileText className="h-6 w-6" style={{ color: theme.primary }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{contract.employee?.name}</h3>
                      <p className="text-sm text-gray-500">{contract.type}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date de début:</span>
                    <span className="font-medium text-gray-900">{new Date(contract.startDate).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date de fin:</span>
                    <span className="font-medium text-gray-900">
                      {contract.endDate ? new Date(contract.endDate).toLocaleDateString('fr-FR') : 'Indéterminé'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Salaire:</span>
                    <span className="font-medium text-gray-900">€{contract.salary}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Durée:</span>
                    <span className="font-medium text-gray-900">
                      {contract.endDate
                        ? `${Math.ceil((new Date(contract.endDate) - new Date(contract.startDate)) / (1000 * 60 * 60 * 24))} jours`
                        : 'Indéterminé'
                      }
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openEditModal(contract)}
                    className="flex items-center space-x-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="text-sm font-medium">Modifier</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {contracts.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun contrat trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par créer le premier contrat.
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalContracts)} sur {totalContracts} contrat{totalContracts > 1 ? 's' : ''}
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

      {/* Create/Edit Modal */}
      {(showCreateModal || editingContract) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingContract ? 'Modifier le contrat' : 'Nouveau contrat'}
              </h3>

              <form onSubmit={editingContract ? handleUpdate : handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employé
                    </label>
                    <select
                      value={formData.employeeId}
                      onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                      style={{
                        '--tw-ring-color': theme.primary,
                        borderColor: theme.primary
                      }}
                      required
                    >
                      <option value="">Sélectionner un employé</option>
                      {employees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type de contrat
                    </label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                      style={{
                        '--tw-ring-color': theme.primary,
                        borderColor: theme.primary
                      }}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                        style={{
                          '--tw-ring-color': theme.primary,
                          borderColor: theme.primary
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                        style={{
                          '--tw-ring-color': theme.primary,
                          borderColor: theme.primary
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Salaire (€)
                    </label>
                    <input
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                      style={{
                        '--tw-ring-color': theme.primary,
                        borderColor: theme.primary
                      }}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingContract(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md transition-all duration-300"
                    style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
                  >
                    {editingContract ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;