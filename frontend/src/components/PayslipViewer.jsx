import React, { useState, useRef } from 'react';
import { Download, FileText, Building2, User, Calendar, DollarSign, Eye } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';

const PayslipViewer = ({ payslip, onClose }) => {
  const { company } = useAuth();
  const printRef = useRef();

  const handleDownload = () => {
    // Créer un élément temporaire pour l'impression
    const printContent = printRef.current;
    const originalDisplay = printContent.style.display;
    printContent.style.display = 'block';

    // Utiliser l'API de navigateur pour imprimer/télécharger
    window.print();

    // Restaurer l'affichage original
    printContent.style.display = originalDisplay;
  };

  const formatCurrency = (amount, currency = 'XOF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-2" />
            Bulletin de Paie
          </h3>
          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              style={{ backgroundColor: company?.primaryColor || '#2563EB' }}
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </button>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Fermer
            </button>
          </div>
        </div>

        {/* Contenu du bulletin de paie (visible à l'écran) */}
        <div className="bg-gray-50 p-8 rounded-lg border">
          {/* En-tête avec logo de l'entreprise */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b-2" style={{ borderColor: company?.primaryColor || '#2563EB' }}>
            <div className="flex items-center">
              {company?.logo ? (
                <img
                  src={company.logo}
                  alt={company?.name}
                  className="h-12 w-12 object-contain mr-4"
                />
              ) : (
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center mr-4"
                  style={{ backgroundColor: company?.primaryColor || '#2563EB' }}
                >
                  <Building2 className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company?.name || 'Entreprise'}</h1>
                <p className="text-sm text-gray-600">Bulletin de Paie</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Mois: {payslip?.payrun?.month || 'N/A'}</p>
              <p className="text-sm text-gray-600">Date: {formatDate(payslip?.createdAt)}</p>
            </div>
          </div>

          {/* Informations de l'employé */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Informations Employé
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Nom:</span> {payslip?.employee?.name || 'N/A'}</p>
                <p><span className="font-medium">Poste:</span> {payslip?.employee?.position || 'N/A'}</p>
                <p><span className="font-medium">Département:</span> {payslip?.employee?.department?.name || 'N/A'}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Période de Paie
              </h3>
              <div className="space-y-2">
                <p><span className="font-medium">Mois:</span> {payslip?.payrun?.month || 'N/A'}</p>
                <p><span className="font-medium">Année:</span> {payslip?.payrun?.month?.split('-')[0] || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Détails de la paie */}
          <div className="bg-white p-6 rounded-lg border mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2" />
              Détails de la Paie
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Revenus</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salaire de base:</span>
                    <span className="font-medium">{formatCurrency(payslip?.employee?.salary || 0, company?.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Primes:</span>
                    <span className="font-medium">{formatCurrency(0, company?.currency)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Déductions</h4>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Impôts (20%):</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency((payslip?.employee?.salary || 0) * 0.2, company?.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Assurances:</span>
                    <span className="font-medium text-red-600">
                      -{formatCurrency(0, company?.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="bg-gray-100 p-6 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-900">Salaire Net à Payer:</span>
              <span
                className="text-2xl font-bold"
                style={{ color: company?.primaryColor || '#2563EB' }}
              >
                {formatCurrency(payslip?.netSalary || 0, company?.currency)}
              </span>
            </div>
          </div>

          {/* Pied de page */}
          <div className="mt-8 pt-6 border-t text-center text-sm text-gray-600">
            <p>Ce bulletin de paie est généré automatiquement par le système PayrollSys.</p>
            <p>Pour toute question, contactez votre service RH.</p>
          </div>
        </div>

        {/* Version imprimable (cachée) */}
        <div ref={printRef} className="hidden print:block">
          {/* Contenu identique pour l'impression */}
          <div className="p-8">
            <div className="flex items-center justify-between mb-8 pb-6 border-b-2" style={{ borderColor: company?.primaryColor || '#2563EB' }}>
              <div className="flex items-center">
                {company?.logo ? (
                  <img
                    src={company.logo}
                    alt={company?.name}
                    className="h-12 w-12 object-contain mr-4"
                  />
                ) : (
                  <div
                    className="h-12 w-12 rounded-lg flex items-center justify-center mr-4"
                    style={{ backgroundColor: company?.primaryColor || '#2563EB' }}
                  >
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{company?.name || 'Entreprise'}</h1>
                  <p className="text-sm text-gray-600">Bulletin de Paie</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Mois: {payslip?.payrun?.month || 'N/A'}</p>
                <p className="text-sm text-gray-600">Date: {formatDate(payslip?.createdAt)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Employé</h3>
                <p><span className="font-medium">Nom:</span> {payslip?.employee?.name || 'N/A'}</p>
                <p><span className="font-medium">Poste:</span> {payslip?.employee?.position || 'N/A'}</p>
                <p><span className="font-medium">Département:</span> {payslip?.employee?.department?.name || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Période de Paie</h3>
                <p><span className="font-medium">Mois:</span> {payslip?.payrun?.month || 'N/A'}</p>
                <p><span className="font-medium">Année:</span> {payslip?.payrun?.month?.split('-')[0] || 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails de la Paie</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Revenus</h4>
                  <div className="flex justify-between">
                    <span>Salaire de base:</span>
                    <span className="font-medium">{formatCurrency(payslip?.employee?.salary || 0, company?.currency)}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Déductions</h4>
                  <div className="flex justify-between">
                    <span>Impôts (20%):</span>
                    <span className="font-medium">
                      -{formatCurrency((payslip?.employee?.salary || 0) * 0.2, company?.currency)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-gray-900">Salaire Net à Payer:</span>
                <span className="text-2xl font-bold" style={{ color: company?.primaryColor || '#2563EB' }}>
                  {formatCurrency(payslip?.netSalary || 0, company?.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayslipViewer;