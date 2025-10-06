import React, { useState, useEffect } from 'react';
import { payrollService } from '../../services/payrollService';
import { paymentService } from '../../services/paymentService';
import { FileText, CheckCircle, Clock, DollarSign, Users, AlertCircle } from 'lucide-react';
import { useCompanyTheme } from '../../hooks/useCompanyTheme';

const Payruns = () => {
  const theme = useCompanyTheme();
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayrun, setSelectedPayrun] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadPayruns();
  }, []);

  const loadPayruns = async () => {
    try {
      const response = await payrollService.getAllPayruns({ page: 1, limit: 50 });
      setPayruns(response.data?.payruns || []);
    } catch (error) {
      console.error('Error loading payruns:', error);
      setPayruns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (payrunId, newStatus) => {
    try {
      await payrollService.updatePayrunStatus(payrunId, { status: newStatus });
      loadPayruns(); // Refresh the list
    } catch (error) {
      console.error('Error updating payrun status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleViewDetails = async (payrun) => {
    try {
      const response = await payrollService.getAllPayslips({ payrunId: payrun.id, limit: 100 });
      setSelectedPayrun({
        ...payrun,
        payslips: response.data?.payslips || []
      });
      setShowDetails(true);
    } catch (error) {
      console.error('Error loading payrun details:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800';
      case 'CALCULATED': return 'bg-blue-100 text-blue-800';
      case 'VALIDATED': return 'bg-yellow-100 text-yellow-800';
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DRAFT': return 'Brouillon';
      case 'CALCULATED': return 'Calculé';
      case 'VALIDATED': return 'Validé';
      case 'PAID': return 'Payé';
      case 'CLOSED': return 'Clôturé';
      default: return status;
    }
  };

  const canChangeStatus = (currentStatus, newStatus) => {
    const transitions = {
      'CALCULATED': ['VALIDATED'],
      'VALIDATED': ['PAID'],
      'PAID': ['CLOSED']
    };
    return transitions[currentStatus]?.includes(newStatus) || false;
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'CALCULATED': return 'VALIDATED';
      case 'VALIDATED': return 'PAID';
      case 'PAID': return 'CLOSED';
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12" style={{ borderTopColor: theme.primary, borderRightColor: theme.secondary }}></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: `linear-gradient(135deg, ${theme.primary}10 0%, ${theme.secondary}10 100%)` }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Payruns</h1>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {payruns.map((payrun) => (
          <div key={payrun.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20 p-6 transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {new Date(payrun.month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h3>
              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(payrun.status)}`}>
                {getStatusText(payrun.status)}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {payrun._count?.payslips || 0} bulletins
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="h-4 w-4 mr-2" />
                {payrun.totalAmount?.toLocaleString()} FCFA
              </div>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleViewDetails(payrun)}
                className="flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: `${theme.secondary}20`,
                  color: theme.secondary,
                  border: `1px solid ${theme.secondary}30`
                }}
              >
                Détails
              </button>
              {getNextStatus(payrun.status) && (
                <button
                  onClick={() => handleStatusChange(payrun.id, getNextStatus(payrun.status))}
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105"
                  style={{
                    backgroundColor: `${theme.primary}20`,
                    color: theme.primary,
                    border: `1px solid ${theme.primary}30`
                  }}
                >
                  {getNextStatus(payrun.status) === 'VALIDATED' ? 'Valider' :
                   getNextStatus(payrun.status) === 'PAID' ? 'Marquer Payé' :
                   getNextStatus(payrun.status) === 'CLOSED' ? 'Clôturer' : 'Suivant'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {payruns.length === 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white border-opacity-20 p-12 text-center">
          <div className="p-4 rounded-full mx-auto mb-4 w-fit" style={{ backgroundColor: `${theme.primary}20` }}>
            <FileText className="h-12 w-12" style={{ color: theme.primary }} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun payrun trouvé</h3>
          <p className="text-gray-600">Les payruns créés par l'administrateur apparaîtront ici.</p>
        </div>
      )}

      {/* Payrun Details Modal */}
      {showDetails && selectedPayrun && (
        <div className="fixed inset-0 overflow-y-auto h-full w-full z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="relative top-4 mx-auto p-5 w-11/12 max-w-4xl shadow-2xl rounded-2xl max-h-screen overflow-y-auto" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(10px)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Détails du Payrun - {new Date(selectedPayrun.month + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              >
                ✕
              </button>
            </div>

            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="p-4 rounded-xl" style={{ backgroundColor: `${theme.primary}10`, border: `1px solid ${theme.primary}20` }}>
                  <div className="text-sm" style={{ color: theme.primary }}>Statut</div>
                  <div className="text-lg font-semibold text-gray-900">{getStatusText(selectedPayrun.status)}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: `${theme.secondary}10`, border: `1px solid ${theme.secondary}20` }}>
                  <div className="text-sm" style={{ color: theme.secondary }}>Nombre de bulletins</div>
                  <div className="text-lg font-semibold text-gray-900">{selectedPayrun.payslips?.length || 0}</div>
                </div>
                <div className="p-4 rounded-xl" style={{ backgroundColor: `${theme.primary}10`, border: `1px solid ${theme.primary}20` }}>
                  <div className="text-sm" style={{ color: theme.primary }}>Montant total</div>
                  <div className="text-lg font-semibold text-gray-900">{selectedPayrun.totalAmount?.toLocaleString()} FCFA</div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employé
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salaire Net
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut Paiement
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedPayrun.payslips?.map((payslip) => (
                    <tr key={payslip.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {payslip.employee?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payslip.netSalary?.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payslip.payments && payslip.payments.length > 0
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payslip.payments && payslip.payments.length > 0 ? 'Payé' : 'En attente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetails(false)}
                className="px-6 py-2 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105"
                style={{
                  backgroundColor: `${theme.secondary}20`,
                  color: theme.secondary,
                  border: `1px solid ${theme.secondary}30`
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default Payruns;