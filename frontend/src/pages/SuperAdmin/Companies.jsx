import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../utils/AuthContext';
import { Building2, Plus, Edit, Trash2, Users, Eye, LogIn, Search, Filter, ChevronLeft, ChevronRight, List, AlertCircle, User, Mail, Lock, Upload, Check, Eye as EyeIcon, EyeOff, Save, ArrowLeft } from 'lucide-react';

// CompanyForm Component
const CompanyForm = ({ editingCompany, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    currency: 'XOF',
    logo: '',
    primaryColor: '#2563EB',
    secondaryColor: '#1E40AF',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPosition: 'Administrateur'
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (editingCompany) {
      setFormData({
        name: editingCompany.name || '',
        currency: editingCompany.currency || 'XOF',
        logo: editingCompany.logo || '',
        primaryColor: editingCompany.primaryColor || '#2563EB',
        secondaryColor: editingCompany.secondaryColor || '#1E40AF',
        adminName: editingCompany.adminName || '',
        adminEmail: '',
        adminPassword: '',
        adminPosition: 'Administrateur'
      });
      if (editingCompany.logo) {
        setLogoPreview(editingCompany.logo);
      }
    }
  }, [editingCompany]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'entreprise est requis';
    }

    if (!formData.currency) {
      newErrors.currency = 'La devise est requise';
    }

    if (!editingCompany) {
      if (!formData.adminName.trim()) {
        newErrors.adminName = 'Le nom de l\'administrateur est requis';
      }

      if (!formData.adminEmail.trim()) {
        newErrors.adminEmail = 'L\'email de l\'administrateur est requis';
      } else if (!/\S+@\S+\.\S+/.test(formData.adminEmail)) {
        newErrors.adminEmail = 'L\'email n\'est pas valide';
      }

      if (!formData.adminPassword) {
        newErrors.adminPassword = 'Le mot de passe est requis';
      } else if (formData.adminPassword.length < 6) {
        newErrors.adminPassword = 'Le mot de passe doit contenir au moins 6 caractères';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const uploadLogo = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    // Utiliser axios avec la configuration existante
    const response = await fetch('http://localhost:3000/files/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      },
      body: formDataUpload
    });

    const result = await response.json();
    if (result.success) {
      return result.data.url;
    } else {
      throw new Error(result.message || 'Erreur lors de l\'upload');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors({ logo: 'La taille du fichier ne doit pas dépasser 2MB' });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors({ logo: 'Seules les images sont autorisées' });
        return;
      }

      setUploadingLogo(true);
      setErrors(prev => ({ ...prev, logo: '' }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);

      try {
        const logoUrl = await uploadLogo(file);
        setFormData(prev => ({ ...prev, logo: logoUrl }));
      } catch (error) {
        console.error('Upload error:', error);
        let errorMessage = 'Erreur lors de l\'upload de l\'image';
        if (error.response?.status === 413) {
          errorMessage = 'Le fichier est trop volumineux (max 2MB)';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        setErrors({ logo: errorMessage });
        setLogoPreview('');
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      if (editingCompany) {
        const updateData = {
          name: formData.name,
          currency: formData.currency,
          logo: formData.logo,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor
        };
        await companyService.updateCompany(editingCompany.id, updateData);
      } else {
        await companyService.createCompanyWithAdmin(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);

    } catch (error) {
      console.error('Error saving company:', error);

      if (error.response?.data?.message) {
        if (error.response.data.message.includes('email')) {
          setErrors({ adminEmail: error.response.data.message });
        } else {
          setErrors({ general: error.response.data.message });
        }
      } else {
        setErrors({ general: 'Une erreur inattendue s\'est produite' });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          {editingCompany ? 'Entreprise modifiée avec succès !' : 'Entreprise créée avec succès !'}
        </h3>
        <p className="text-gray-600">
          Fermeture automatique dans quelques secondes...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            <span className="text-red-700 font-medium">{errors.general}</span>
          </div>
        </div>
      )}

      <div className={`grid grid-cols-1 ${editingCompany ? 'lg:grid-cols-2' : 'lg:grid-cols-2'} gap-6`}>
        <div className="bg-gray-50 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <Building2 className="h-5 w-5 text-indigo-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Informations de l'Entreprise</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'Entreprise *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Ex: TechCorp Senegal"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Devise *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="XOF">Franc CFA (XOF)</option>
                <option value="EUR">Euro (€)</option>
                <option value="USD">Dollar US ($)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo de l'Entreprise
              </label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden relative">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <Upload className="h-6 w-6 text-gray-400" style={{ display: logoPreview ? 'none' : 'block' }} />
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                      id="logo-upload-modal"
                    />
                    <label
                      htmlFor="logo-upload-modal"
                      className={`inline-flex items-center px-3 py-2 border rounded-lg text-sm font-medium cursor-pointer ${
                        uploadingLogo
                          ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingLogo ? 'Upload...' : 'Choisir'}
                    </label>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG jusqu'à 2MB</p>
                  </div>
                </div>
                {errors.logo && (
                  <p className="text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.logo}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur Primaire
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-600">{formData.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Couleur Secondaire
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="w-10 h-8 border border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-xs text-gray-600">{formData.secondaryColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-2xl p-6">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 text-green-600 mr-3" />
            <h3 className="text-lg font-bold text-gray-900">Administrateur</h3>
          </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom Complet *
                </label>
                <input
                  type="text"
                  value={formData.adminName}
                  onChange={(e) => handleInputChange('adminName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                    errors.adminName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Jean Dupont"
                />
                {errors.adminName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.adminName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Poste
                </label>
                <input
                  type="text"
                  value={formData.adminPosition}
                  onChange={(e) => handleInputChange('adminPosition', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ex: Directeur Général"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                      errors.adminEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="admin@entreprise.com"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                {errors.adminEmail && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.adminEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de Passe *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.adminPassword}
                    onChange={(e) => handleInputChange('adminPassword', e.target.value)}
                    className={`w-full pl-4 pr-11 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                      errors.adminPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </button>
                </div>
                {errors.adminPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.adminPassword}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
              </div>
            </div>
          </div>
        </div>

      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-medium"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
              {editingCompany ? 'Modification...' : 'Création...'}
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-3" />
              {editingCompany ? 'Modifier l\'Entreprise' : 'Créer l\'Entreprise'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const Companies = () => {
  const { user, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
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

  const handleDelete = async () => {
    if (!companyToDelete) return;

    try {
      setDeleteError('');
      await companyService.deleteCompany(companyToDelete.id);
      setShowDeleteModal(false);
      setCompanyToDelete(null);
      loadCompanies();
    } catch (error) {
      console.error('Error deleting company:', error);
      const errorMessage = error.response?.data?.message || 'Une erreur inattendue s\'est produite lors de la suppression.';
      setDeleteError(errorMessage);
    }
  };

  const openDeleteModal = (company) => {
    setCompanyToDelete(company);
    setDeleteError('');
    setShowDeleteModal(true);
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

  const openCreateModal = () => {
    setEditingCompany(null);
    setShowCreateModal(true);
  };

  const openEditModal = (company) => {
    setEditingCompany(company);
    setShowCreateModal(true);
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setEditingCompany(null);
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
              onClick={openCreateModal}
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
                          <img
                            src={company.logo}
                            alt={company.name}
                            className="h-10 w-10 object-contain"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        ) : null}
                        <Building2 className="h-10 w-10 text-white" style={{ display: company.logo ? 'none' : 'block' }} />
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
                    onClick={() => openDeleteModal(company)}
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
                  onClick={openCreateModal}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && companyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Supprimer l'entreprise
              </h3>

              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer l'entreprise <span className="font-semibold text-gray-900">"{companyToDelete.name}"</span> ?
                Cette action est irréversible et supprimera toutes les données associées.
              </p>

              {deleteError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                    <span className="text-red-700 font-medium">{deleteError}</span>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setCompanyToDelete(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-medium"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-600 rounded-xl mr-4">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingCompany ? 'Modifier l\'Entreprise' : 'Créer une Nouvelle Entreprise'}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {editingCompany
                        ? 'Modifiez les informations de l\'entreprise'
                        : 'Configurez l\'entreprise et créez son administrateur'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  ✕
                </button>
              </div>

              <CompanyForm
                editingCompany={editingCompany}
                onSuccess={() => {
                  closeModal();
                  loadCompanies();
                }}
                onCancel={closeModal}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Companies;