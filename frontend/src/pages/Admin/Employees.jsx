import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Eye, Edit, Archive, UserPlus, ChevronLeft, ChevronRight, MoreVertical, X, Save, Loader } from 'lucide-react';
import { useAuth } from '../../utils/AuthContext';
import { useCompany } from '../../utils/CompanyContext';
import { useCompanyTheme } from '../../hooks/useCompanyTheme';
import { employeeService } from '../../services/employeeService';
import { departmentService } from '../../services/departmentService';

const Employees = () => {
  const { company } = useCompany();
  const theme = useCompanyTheme();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    position: '',
    department: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [departments, setDepartments] = useState([]);
  const [employeeForm, setEmployeeForm] = useState({
    name: '',
    position: '',
    salary: '',
    email: '',
    departmentId: '',
    contractType: '',
    startDate: '',
    endDate: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemsPerPage = 8; // 8 employés par page pour une grille 4x2

  const loadEmployees = async (page = 1, searchFilters = {}) => {
    try {
      setLoading(true);

      const response = await employeeService.getEmployees({
        page,
        limit: itemsPerPage,
        ...searchFilters
      });

      if (response.success) {
        setEmployees(response.data.employees || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalEmployees(response.data.total || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await departmentService.getAllDepartments();
      if (response.success) {
        setDepartments(response.data.departments || []);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!employeeForm.name.trim()) {
      errors.name = 'Le nom est requis';
    }

    if (!employeeForm.position.trim()) {
      errors.position = 'Le poste est requis';
    }

    if (!employeeForm.salary || isNaN(employeeForm.salary) || parseFloat(employeeForm.salary) <= 0) {
      errors.salary = 'Le salaire doit être un nombre positif';
    }

    if (!employeeForm.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(employeeForm.email)) {
      errors.email = 'L\'email n\'est pas valide';
    }

    if (employeeForm.startDate && employeeForm.endDate) {
      if (new Date(employeeForm.startDate) >= new Date(employeeForm.endDate)) {
        errors.endDate = 'La date de fin doit être après la date de début';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateEmployee = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const employeeData = {
        ...employeeForm,
        salary: parseFloat(employeeForm.salary),
        departmentId: employeeForm.departmentId ? parseInt(employeeForm.departmentId) : undefined,
        startDate: employeeForm.startDate || undefined,
        endDate: employeeForm.endDate || undefined,
      };

      // Remove empty fields
      Object.keys(employeeData).forEach(key => {
        if (employeeData[key] === undefined || employeeData[key] === '') {
          delete employeeData[key];
        }
      });

      await employeeService.createEmployee(employeeData);

      // Reset form and close modal
      setEmployeeForm({
        name: '',
        position: '',
        salary: '',
        email: '',
        departmentId: '',
        contractType: '',
        startDate: '',
        endDate: ''
      });
      setFormErrors({});
      setShowAddEmployeeModal(false);

      // Reload employees list
      loadEmployees(currentPage, filters);

      // Show success modal
      setSuccessMessage('Employé créé avec succès ! Un email de bienvenue et son badge d\'accès lui ont été envoyés.');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error creating employee:', error);
      alert('Erreur lors de la création de l\'employé: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddEmployeeClick = () => {
    loadDepartments();
    setShowAddEmployeeModal(true);
  };

  const handleFormChange = (field, value) => {
    setEmployeeForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  useEffect(() => {
    loadEmployees(1, filters);
  }, []);

  const handleSearch = () => {
    loadEmployees(1, filters);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      position: '',
      department: '',
      status: ''
    });
    loadEmployees(1, {});
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      loadEmployees(page, filters);
    }
  };

  const handleViewEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeModal(true);
  };

  const handleArchiveEmployee = async (employeeId) => {
    if (window.confirm('Êtes-vous sûr de vouloir archiver cet employé ?')) {
      try {
        await employeeService.archiveEmployee(employeeId);
        loadEmployees(currentPage, filters);
      } catch (error) {
        console.error('Error archiving employee:', error);
        alert('Erreur lors de l\'archivage de l\'employé');
      }
    }
  };

  const getStatusColor = (employee) => {
    const status = employee.user?.status || 'ACTIVE';
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (employee) => {
    const status = employee.user?.status || 'ACTIVE';
    switch (status) {
      case 'ACTIVE': return 'Actif';
      case 'INACTIVE': return 'Inactif';
      default: return status;
    }
  };

  if (loading && employees.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Chargement des employés...</p>
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
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Employés</h1>
                <p className="text-gray-600 text-lg">{totalEmployees} employé{totalEmployees > 1 ? 's' : ''} dans {company?.name || 'l\'entreprise'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filtres</span>
              </button>
              <button
                onClick={handleAddEmployeeClick}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-300 transform hover:scale-105"
                style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
              >
                <UserPlus className="h-5 w-5" />
                <span>Nouvel Employé</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-white border-opacity-20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rechercher</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nom, email..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Poste</label>
                <input
                  type="text"
                  placeholder="Développeur, Manager..."
                  value={filters.position}
                  onChange={(e) => handleFilterChange('position', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Département</label>
                <select
                  value={filters.department}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les départements</option>
                  <option value="IT">IT</option>
                  <option value="HR">RH</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les statuts</option>
                  <option value="ACTIVE">Actif</option>
                  <option value="INACTIVE">Inactif</option>
                  <option value="SUSPENDED">Suspendu</option>
                </select>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                <X className="h-4 w-4" />
                <span>Effacer les filtres</span>
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-2 rounded-lg text-white font-medium transition-all duration-300"
                style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
              >
                Rechercher
              </button>
            </div>
          </div>
        )}

        {/* Employees Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white border-opacity-20 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {employees.map((employee) => (
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
                      <p className="text-sm text-gray-500">{employee.user?.email || 'Aucun email'}</p>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(employee)}`}>
                    {getStatusText(employee)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Poste:</span>
                    <span className="font-medium text-gray-900">{employee.position}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Département:</span>
                    <span className="font-medium text-gray-900">{employee.department?.name || 'Non assigné'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Salaire:</span>
                    <span className="font-medium text-gray-900">{company?.currency || 'XOF'} {employee.salary?.toLocaleString() || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewEmployee(employee)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">Voir</span>
                  </button>
                  <div className="flex items-center space-x-2">
                    <button
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors duration-200"
                      title="Modifier"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleArchiveEmployee(employee.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                      title="Archiver"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {employees.length === 0 && !loading && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun employé trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                {Object.values(filters).some(v => v) ? 'Essayez de modifier vos filtres.' : 'Commencez par ajouter un employé.'}
              </p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-white border-opacity-20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalEmployees)} sur {totalEmployees} employé{totalEmployees > 1 ? 's' : ''}
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

        {/* Employee Details Modal */}
        {showEmployeeModal && selectedEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Détails de l'employé</h2>
                  <button
                    onClick={() => setShowEmployeeModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center">
                    <div className="h-20 w-20 rounded-full flex items-center justify-center mr-6" style={{ backgroundColor: `${theme.primary}20` }}>
                      <span className="text-2xl font-medium" style={{ color: theme.primary }}>
                        {selectedEmployee.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.name}</h3>
                      <p className="text-gray-600">{selectedEmployee.position}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-2 ${getStatusColor(selectedEmployee)}`}>
                        {getStatusText(selectedEmployee)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Informations personnelles</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Email:</span> {selectedEmployee.user?.email || 'Non spécifié'}</p>
                        <p><span className="font-medium">Téléphone:</span> {selectedEmployee.phone || 'Non spécifié'}</p>
                        <p><span className="font-medium">Adresse:</span> {selectedEmployee.address || 'Non spécifiée'}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Informations professionnelles</h4>
                      <div className="space-y-2">
                        <p><span className="font-medium">Poste:</span> {selectedEmployee.position}</p>
                        <p><span className="font-medium">Département:</span> {selectedEmployee.department?.name || 'Non assigné'}</p>
                        <p><span className="font-medium">Salaire:</span> {company?.currency || 'XOF'} {selectedEmployee.salary?.toLocaleString()}</p>
                        <p><span className="font-medium">Type de contrat:</span> {selectedEmployee.contractType || 'Non spécifié'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Dates importantes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Date d'embauche</p>
                        <p className="font-medium">{selectedEmployee.startDate ? new Date(selectedEmployee.startDate).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date de fin</p>
                        <p className="font-medium">{selectedEmployee.endDate ? new Date(selectedEmployee.endDate).toLocaleDateString('fr-FR') : 'Non spécifiée'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Dernière mise à jour</p>
                        <p className="font-medium">{new Date(selectedEmployee.updatedAt).toLocaleDateString('fr-FR')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Employee Modal */}
        {showAddEmployeeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Ajouter un nouvel employé</h2>
                  <button
                    onClick={() => setShowAddEmployeeModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom complet <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={employeeForm.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ex: Jean Dupont"
                      />
                      {formErrors.name && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                      )}
                    </div>

                    {/* Position */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Poste <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={employeeForm.position}
                        onChange={(e) => handleFormChange('position', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.position ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ex: Développeur Full Stack"
                      />
                      {formErrors.position && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.position}</p>
                      )}
                    </div>

                    {/* Salary */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Salaire ({company?.currency || 'XOF'}) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={employeeForm.salary}
                        onChange={(e) => handleFormChange('salary', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.salary ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ex: 500000"
                        min="0"
                        step="0.01"
                      />
                      {formErrors.salary && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.salary}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        value={employeeForm.email}
                        onChange={(e) => handleFormChange('email', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Ex: jean.dupont@entreprise.com"
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>

                    {/* Department */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Département
                      </label>
                      <select
                        value={employeeForm.departmentId}
                        onChange={(e) => handleFormChange('departmentId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un département</option>
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.id}>
                            {dept.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Contract Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de contrat
                      </label>
                      <select
                        value={employeeForm.contractType}
                        onChange={(e) => handleFormChange('contractType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un type</option>
                        <option value="FIXE">CDI / CDD</option>
                        <option value="HONORAIRE">Freelance / Honoraires</option>
                      </select>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de début
                      </label>
                      <input
                        type="date"
                        value={employeeForm.startDate}
                        onChange={(e) => handleFormChange('startDate', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* End Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="date"
                        value={employeeForm.endDate}
                        onChange={(e) => handleFormChange('endDate', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          formErrors.endDate ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.endDate}</p>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => setShowAddEmployeeModal(false)}
                      className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                      disabled={isSubmitting}
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleCreateEmployee}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-6 py-3 text-white rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: `linear-gradient(to right, ${theme.primary}, ${theme.secondary})` }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin" />
                          <span>Création...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Créer l'employé</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
              <div className="p-8">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Succès !</h3>
                  <p className="text-gray-600 mb-6">{successMessage}</p>
                  <button
                    onClick={() => setShowSuccessModal(false)}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-200"
                  >
                    Fermer
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

export default Employees;