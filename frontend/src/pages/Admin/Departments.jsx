import React, { useState, useEffect } from 'react';
import { departmentService } from '../../services/departmentService';
import { useCompanyTheme } from '../../hooks/useCompanyTheme';
import { Plus, Edit, Trash2, Building, ChevronLeft, ChevronRight } from 'lucide-react';

const Departments = () => {
  const theme = useCompanyTheme();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDepartments, setTotalDepartments] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
  });
  const itemsPerPage = 5;

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async (page = 1) => {
    try {
      setLoading(true);
      const response = await departmentService.getAllDepartments({
        page,
        limit: itemsPerPage
      });

      if (response.success) {
        setDepartments(response.data.departments || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalDepartments(response.data.total || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await departmentService.createDepartment(formData);
      setShowCreateModal(false);
      resetForm();
      loadDepartments();
    } catch (error) {
      console.error('Error creating department:', error);
    }
  };

  const resetForm = () => {
    setFormData({ name: '' });
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadDepartments(page);
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Départements</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-all duration-300 transform hover:scale-105"
          style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Département
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => (
          <div key={department.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: `${theme.primary}20` }}>
                <Building className="h-6 w-6" style={{ color: theme.primary }} />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">{department.name}</h3>
                <p className="text-sm text-gray-500">
                  Créé le {new Date(department.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-white border-opacity-20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalDepartments)} sur {totalDepartments} départements
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nouveau département
              </h3>

              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du département
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300"
                    style={{
                      '--tw-ring-color': theme.primary,
                      borderColor: theme.primary
                    }}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
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
                    Créer
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

export default Departments;