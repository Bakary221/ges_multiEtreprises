import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../utils/AuthContext';
import { companyService } from '../../services/companyService';
import {
  Building2,
  User,
  Mail,
  Lock,
  Upload,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  ArrowLeft
} from 'lucide-react';

const CreateCompany = () => {
  const { user, isAuthenticated, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);
  const id = urlParams.get('id');

  const [isEditing, setIsEditing] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

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

  // Load company data if editing
  useEffect(() => {
    if (id && id !== 'create') {
      setIsEditing(true);
      loadCompanyData(id);
    }
  }, [id]);

  const loadCompanyData = async (companyId) => {
    try {
      setLoadingData(true);
      const response = await companyService.getCompanyById(companyId);
      const company = response.data?.data;

      if (!company) {
        setErrors({ general: 'Entreprise non trouvée. Elle a peut-être été supprimée.' });
        setTimeout(() => {
          navigate('/superadmin/companies');
        }, 3000);
        return;
      }

      setFormData({
        name: company.name || '',
        currency: company.currency || 'XOF',
        logo: company.logo || '',
        primaryColor: company.primaryColor || '#2563EB',
        secondaryColor: company.secondaryColor || '#1E40AF',
        adminName: '',
        adminEmail: '',
        adminPassword: '',
        adminPosition: ''
      });

      if (company.logo) {
        setLogoPreview(company.logo);
      }
    } catch (error) {
      console.error('Error loading company:', error);
      if (error.response?.status === 404) {
        setErrors({ general: 'Entreprise non trouvée. Elle a peut-être été supprimée.' });
        setTimeout(() => {
          navigate('/superadmin/companies');
        }, 3000);
      } else {
        setErrors({ general: 'Erreur lors du chargement de l\'entreprise' });
      }
    } finally {
      setLoadingData(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de l\'entreprise est requis';
    }

    if (!formData.currency) {
      newErrors.currency = 'La devise est requise';
    }

    if (!isEditing) {
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

    const response = await fetch('/api/files/upload', {
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
        setErrors({ logo: 'Erreur lors de l\'upload de l\'image' });
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
      if (isEditing) {
        const updateData = {
          name: formData.name,
          currency: formData.currency,
          logo: formData.logo,
          primaryColor: formData.primaryColor,
          secondaryColor: formData.secondaryColor
        };
        await companyService.updateCompany(id, updateData);
      } else {
        await companyService.createCompanyWithAdmin(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/superadmin/companies');
      }, 2000);

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

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || userRole !== 'SUPERADMIN') {
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isEditing ? 'Entreprise modifiée avec succès !' : 'Entreprise créée avec succès !'}
            </h2>
            <p className="text-gray-600 mb-6">
              Redirection vers la liste des entreprises...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-200 border-t-indigo-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/superadmin/companies')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux entreprises
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-blue-600 rounded-xl mr-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEditing ? 'Modifier l\'Entreprise' : 'Créer une Nouvelle Entreprise'}
                </h1>
                <p className="text-gray-600 mt-1">
                  {isEditing
                    ? 'Modifiez les informations de l\'entreprise'
                    : 'Configurez l\'entreprise et créez son administrateur'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <span className="text-red-700 font-medium">{errors.general}</span>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-1 ${isEditing ? '' : 'lg:grid-cols-2'} gap-8`}>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <Building2 className="h-6 w-6 text-indigo-600 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Informations de l'Entreprise</h2>
              </div>

              <div className="space-y-6">
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
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 border-2 border-dashed rounded-xl flex items-center justify-center overflow-hidden relative">
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
                        <Upload className="h-8 w-8 text-gray-400" style={{ display: logoPreview ? 'none' : 'block' }} />
                        {uploadingLogo && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
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
                          id="logo-upload"
                        />
                        <label
                          htmlFor="logo-upload"
                          className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium cursor-pointer ${
                            uploadingLogo
                              ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                          }`}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {uploadingLogo ? 'Upload en cours...' : 'Choisir un fichier'}
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG jusqu'à 2MB</p>
                        {formData.logo && !errors.logo && (
                          <p className="text-xs text-green-600 mt-1 flex items-center">
                            <Check className="h-3 w-3 mr-1" />
                            Logo uploadé avec succès
                          </p>
                        )}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur Primaire
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{formData.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Couleur Secondaire
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{formData.secondaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!isEditing && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <div className="flex items-center mb-6">
                  <User className="h-6 w-6 text-green-600 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Administrateur de l'Entreprise</h2>
                </div>

                <div className="space-y-6">
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
                        className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                          errors.adminEmail ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="admin@entreprise.com"
                      />
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                        className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all ${
                          errors.adminPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="••••••••"
                      />
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
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
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/superadmin/companies')}
                className="mr-4 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    {isEditing ? 'Modification en cours...' : 'Création en cours...'}
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-3" />
                    {isEditing ? 'Modifier l\'Entreprise' : 'Créer l\'Entreprise'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompany;