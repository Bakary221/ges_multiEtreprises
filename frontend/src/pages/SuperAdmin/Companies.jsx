import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../utils/AuthContext';
import { Building2, Plus, Edit, Trash2, Users, Eye, LogIn, Search, Filter, ChevronLeft, ChevronRight, List } from 'lucide-react';

const Companies = () => {
  const { user, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    currency: 'EUR',
    logo: '',
    primaryColor: '#6B7280',
    secondaryColor: '#374151',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated || userRole !== 'SUPERADMIN') {
        navigate('/login');
        return;
      }
      loadCompanies();
    }
  }, [authLoading, isAuthenticated, userRole, navigate]);

  useEffect(() => {
    let filtered = companies;
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (currencyFilter) {
      filtered = filtered.filter(company => company.currency === currencyFilter);
    }
    setFilteredCompanies(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [companies, searchTerm, currencyFilter]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when items per page changes
  }, [itemsPerPage]);

  const loadCompanies = async () => {
    try {
      const response = await companyService.getAllCompanies();
      const companiesData = response.data?.data || response.data || [];
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await companyService.createCompany(formData);
      setShowCreateModal(false);
      setFormData({ name: '', currency: 'EUR', logo: '', primaryColor: '#6B7280', secondaryColor: '#374151' });
      loadCompanies();
    } catch (error) {
      console.error('Error creating company:', error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await companyService.updateCompany(editingCompany.id, formData);
      setEditingCompany(null);
      setFormData({ name: '', currency: 'EUR' });
      loadCompanies();
    } catch (error) {
      console.error('Error updating company:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      try {
        await companyService.deleteCompany(id);
        loadCompanies();
      } catch (error) {
        console.error('Error deleting company:', error);
      }
    }
  };

  const handleImpersonate = async (companyId) => {
    try {
      await companyService.impersonateCompany(companyId);
      // Redirect to admin dashboard or refresh page
      window.location.href = '/admin/dashboard';
    } catch (error) {
      console.error('Error impersonating company:', error);
    }
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name,
      currency: company.currency || 'EUR',
      logo: company.logo || '',
      primaryColor: company.primaryColor || '#6B7280',
      secondaryColor: company.secondaryColor || '#374151',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-600 rounded-full mb-6 shadow-lg">
            <Building2 className="h-10 w-10 text-white animate-pulse" />
          </div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">
            {authLoading ? 'Vérification de l\'authentification...' : 'Chargement des entreprises...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== 'SUPERADMIN') {
    return null; // Sera redirigé par useEffect
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="w-full mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Entreprises</h1>
              <p className="text-gray-600 text-lg">Gérez toutes les entreprises de votre plateforme</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle Entreprise
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher une entreprise..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 appearance-none"
                >
                  <option value="">Toutes les devises</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="XOF">XOF (CFA)</option>
                </select>
              </div>
            </div>
            <div className="sm:w-48">
              <div className="relative">
                <List className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 appearance-none"
                >
                  <option value={6}>6 par page</option>
                  <option value={9}>9 par page</option>
                  <option value={12}>12 par page</option>
                  <option value={18}>18 par page</option>
                </select>
              </div>
            </div>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {paginatedCompanies.map((company) => (
              <div key={company.id} className="group bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                {/* Header with Logo and Company Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="p-4 rounded-2xl shadow-xl" style={{ backgroundColor: company.primaryColor || '#6B7280' }}>
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="h-10 w-10 object-contain" />
                        ) : (
                          <Building2 className="h-10 w-10 text-white" />
                        )}
                      </div>
                      {/* Color indicators */}
                      <div className="absolute -bottom-1 -right-1 flex space-x-1">
                        <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: company.primaryColor || '#6B7280' }} title="Couleur primaire"></div>
                        <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: company.secondaryColor || '#374151' }} title="Couleur secondaire"></div>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">{company.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{company.currency}</p>
                    </div>
                  </div>
                </div>

                {/* Company Stats */}
                <div className="space-y-3 mb-6">
                  {/* Employee Count */}
                  <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-3 text-gray-500" />
                      <span className="font-medium">{company.employeeCount} employés</span>
                    </div>
                  </div>

                  {/* Admin and Creation Date */}
                  <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                    <span>Admin: {company.adminName || 'Non défini'}</span>
                    <span>Créée le {new Date(company.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleImpersonate(company.id)}
                    className="flex-1 inline-flex items-center justify-center px-4 py-3 border border-blue-300 text-sm font-semibold rounded-xl text-blue-700 bg-white hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Se connecter
                  </button>
                  <button
                    onClick={() => openEditModal(company)}
                    className="p-3 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                    title="Modifier"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(company.id)}
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                    title="Supprimer"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {companies.length === 0 ? 'Aucune entreprise' : 'Aucun résultat'}
              </h3>
              <p className="text-gray-500 mb-6">
                {companies.length === 0 ? 'Commencez par créer votre première entreprise.' : 'Aucun entreprise ne correspond à vos critères de recherche.'}
              </p>
              {companies.length === 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Créer la première entreprise
                </button>
              )}
            </div>
          )}

          {filteredCompanies.length > 0 && (
            <div className="flex items-center justify-between mt-12 bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <div className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">{filteredCompanies.length}</span> entreprises au total •
                Affichage de <span className="font-medium text-gray-900">{startIndex + 1}</span> à <span className="font-medium text-gray-900">{Math.min(startIndex + itemsPerPage, filteredCompanies.length)}</span>
              </div>

              <div className="flex items-center space-x-1">
                {/* Previous Button */}
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-400 transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Précédent
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'text-blue-600 bg-white border-blue-300 hover:bg-blue-50 hover:text-blue-700'
                        } border`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-blue-400 transition-all duration-200"
                >
                  Suivant
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCompany) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCompany ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
              </h3>

              <form onSubmit={editingCompany ? handleUpdate : handleCreate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'entreprise
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Devise
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                    <option value="XOF">XOF (CFA)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo (URL)
                  </label>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur primaire
                    </label>
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur secondaire
                    </label>
                    <input
                      type="color"
                      value={formData.secondaryColor}
                      onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                      className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setEditingCompany(null);
                      setFormData({ name: '', currency: 'EUR', logo: '', primaryColor: '#6B7280', secondaryColor: '#374151' });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    {editingCompany ? 'Modifier' : 'Créer'}
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

export default Companies;