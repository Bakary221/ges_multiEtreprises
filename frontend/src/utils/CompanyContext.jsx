import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { companyService } from '../services/companyService';

const CompanyContext = createContext();

export const useCompany = () => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};

export const CompanyProvider = ({ children }) => {
  const { user, userRole } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && userRole === 'ADMIN' && user.companyId) {
      loadCompanyData(user.companyId);
    } else {
      setLoading(false);
    }
  }, [user, userRole]);

  const loadCompanyData = async (companyId) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/company', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Erreur lors de la récupération de l\'entreprise');
      const companyData = data.data;

      if (companyData) {
        setCompany(companyData);
      } else {
        setError('Entreprise non trouvée');
      }
    } catch (err) {
      setError('Erreur lors du chargement des données de l\'entreprise');
    } finally {
      setLoading(false);
    }
  };

  const updateCompany = async (companyId, data) => {
    try {
      const response = await companyService.updateCompany(companyId, data);
      const updatedCompany = response.data?.data;

      if (updatedCompany) {
        setCompany(updatedCompany);
      }

      return updatedCompany;
    } catch (err) {
      throw err;
    }
  };

  const value = {
    company,
    loading,
    error,
    updateCompany,
    reloadCompany: () => user?.companyId && loadCompanyData(user.companyId)
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};