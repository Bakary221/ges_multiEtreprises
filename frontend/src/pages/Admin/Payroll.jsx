import React, { useState, useEffect } from 'react';
import { payrollService } from '../../services/payrollService';
import { Plus, Download, FileText, Calendar, Users, DollarSign } from 'lucide-react';

const Payroll = () => {
  const [payruns, setPayruns] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Pagination states
  const [payrunPagination, setPayrunPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 3
  });
  const [payslipPagination, setPayslipPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    limit: 15
  });

  // Group payslips by payrun
  const [groupedPayslips, setGroupedPayslips] = useState({});
  const getNextAvailableMonth = () => {
    const now = new Date();
    // Start from current month and find the next one that doesn't have a payrun
    let checkDate = new Date(now.getFullYear(), now.getMonth(), 1);

    // Check up to 12 months ahead
    for (let i = 0; i < 12; i++) {
      const monthStr = checkDate.toISOString().slice(0, 7);
      const existingPayrun = payruns.find(p => p.month === monthStr);
      if (!existingPayrun) {
        return monthStr;
      }
      checkDate.setMonth(checkDate.getMonth() + 1);
    }

    // Fallback to next month if all are taken (add 13 months to be safe)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 13, 1);
    return nextMonth.toISOString().slice(0, 7);
  };

  const [formData, setFormData] = useState({
    month: getNextAvailableMonth(), // YYYY-MM format
  });
  const [activeTab, setActiveTab] = useState('payruns');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    console.log('🔄 PAYROLL: Payruns state updated:', payruns);
  }, [payruns]);

  useEffect(() => {
    console.log('🔄 PAYROLL: Payslips state updated:', payslips);
  }, [payslips]);

  const loadPayruns = async (page = 1) => {
    try {
      console.log('🔄 PAYROLL: Loading payruns for page:', page);
      const response = await payrollService.getAllPayruns({ page, limit: 3 });
      console.log('🔄 PAYROLL: Payrun response:', response);
      const payrunsData = response.data?.payruns || [];
      console.log('🔄 PAYROLL: Setting payruns:', payrunsData);
      setPayruns(payrunsData);
      setPayrunPagination({
        currentPage: response.data?.currentPage || 1,
        totalPages: response.data?.totalPages || 1,
        total: response.data?.total || 0,
        limit: response.data?.limit || 10
      });
      console.log('✅ PAYROLL: Payruns loaded successfully');
    } catch (error) {
      console.error('❌ PAYROLL: Error loading payruns:', error);
      setPayruns([]);
    }
  };

  const loadPayslips = async () => {
    try {
      console.log('🔄 PAYROLL: Loading all payslips for grouping');
      // Load all payslips without pagination to show all payruns
      const response = await payrollService.getAllPayslips({ page: 1, limit: 1000 }); // High limit to get all
      console.log('🔄 PAYROLL: Payslip response:', response);
      const payslipsData = response.data?.payslips || [];
      console.log('🔄 PAYROLL: Setting payslips:', payslipsData);

      // Group payslips by payrun
      const grouped = payslipsData.reduce((acc, payslip) => {
        const payrunId = payslip.payrun?.id || 'unknown';
        const payrunMonth = payslip.payrun?.month || 'N/A';

        if (!acc[payrunId]) {
          acc[payrunId] = {
            payrun: payslip.payrun,
            payslips: [],
            totalAmount: 0,
            paidCount: 0,
            totalCount: 0
          };
        }

        acc[payrunId].payslips.push(payslip);
        acc[payrunId].totalAmount += payslip.netSalary || 0;
        acc[payrunId].totalCount += 1;
        if (payslip.payments && payslip.payments.length > 0) {
          acc[payrunId].paidCount += 1;
        }

        return acc;
      }, {});

      setPayslips(payslipsData);
      setGroupedPayslips(grouped);

      // Since we're loading all payslips, set pagination to show all
      setPayslipPagination({
        currentPage: 1,
        totalPages: 1,
        total: payslipsData.length,
        limit: payslipsData.length
      });
      console.log('✅ PAYROLL: All payslips loaded and grouped successfully');
    } catch (error) {
      console.error('❌ PAYROLL: Error loading payslips:', error);
      setPayslips([]);
      setGroupedPayslips({});
    }
  };

  const loadData = async () => {
    try {
      console.log('🔄 PAYROLL: Loading initial data...');
      await Promise.all([
        loadPayruns(1),
        loadPayslips()
      ]);
      console.log('✅ PAYROLL: Initial data loaded successfully');
    } catch (error) {
      console.error('❌ PAYROLL: Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayrun = async (e) => {
    e.preventDefault();
    try {
      console.log('🔄 PAYROLL: Creating payrun with data:', formData);
      await payrollService.createPayrun(formData);
      console.log('✅ PAYROLL: Payrun created successfully');
      setShowCreateModal(false);
      resetForm();
      console.log('🔄 PAYROLL: Refreshing current tab data...');
      // Refresh current tab data
      if (activeTab === 'payruns') {
        loadPayruns(payrunPagination.currentPage);
      } else {
        loadPayslips();
      }
    } catch (error) {
      console.error('❌ PAYROLL: Error creating payrun:', error);
    }
  };

  const handleDownloadPayslip = async (id) => {
    try {
      const blob = await payrollService.downloadPayslipPDF(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payslip-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading payslip:', error);
    }
  };

  const handleStatusChange = async (payrunId, newStatus) => {
    try {
      await payrollService.updatePayrunStatus(payrunId, { status: newStatus });
      // Refresh the payruns list
      loadPayruns(payrunPagination.currentPage);
    } catch (error) {
      console.error('Error updating payrun status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const resetForm = () => {
    setFormData({
      month: getNextAvailableMonth(),
    });
  };

  const formatMonth = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion de la Paie</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau Payrun
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('payruns')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payruns'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Payruns
          </button>
          <button
            onClick={() => setActiveTab('payslips')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payslips'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bulletins de Paie
          </button>
        </nav>
      </div>

      {/* Payruns Tab */}
      {activeTab === 'payruns' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Payruns</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Période
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre de Bulletins
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de Création
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Array.isArray(payruns) && payruns.length > 0 ? (
                  payruns.map((payrun) => (
                    <tr key={payrun.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatMonth(payrun.month)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payrun.totalAmount?.toLocaleString()} FCFA
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payrun._count?.payslips || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payrun.status === 'DRAFT' ? 'bg-gray-100 text-gray-800' :
                          payrun.status === 'CALCULATED' ? 'bg-blue-100 text-blue-800' :
                          payrun.status === 'VALIDATED' ? 'bg-yellow-100 text-yellow-800' :
                          payrun.status === 'PAID' ? 'bg-green-100 text-green-800' :
                          payrun.status === 'CLOSED' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {payrun.status === 'DRAFT' ? 'Brouillon' :
                           payrun.status === 'CALCULATED' ? 'Calculé' :
                           payrun.status === 'VALIDATED' ? 'Validé' :
                           payrun.status === 'PAID' ? 'Payé' :
                           payrun.status === 'CLOSED' ? 'Clôturé' :
                           payrun.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payrun.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {payrun.status === 'DRAFT' && (
                          <button
                            onClick={() => handleStatusChange(payrun.id, 'CALCULATED')}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            Calculer
                          </button>
                        )}
                        <button
                          onClick={() => setActiveTab('payslips')}
                          className="text-indigo-600 hover:text-indigo-900 text-xs"
                        >
                          Voir les bulletins
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-gray-500">
                      <div className="flex flex-col items-center">
                        <FileText className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-1">Aucun payrun trouvé</p>
                        <p>Créez votre premier payrun pour commencer à gérer les bulletins de paie.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination for Payruns */}
          {payrunPagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Affichage de {(payrunPagination.currentPage - 1) * payrunPagination.limit + 1} à {Math.min(payrunPagination.currentPage * payrunPagination.limit, payrunPagination.total)} sur {payrunPagination.total} résultats
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => loadPayruns(payrunPagination.currentPage - 1)}
                  disabled={payrunPagination.currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>
                <span className="text-sm text-gray-700">
                  Page {payrunPagination.currentPage} sur {payrunPagination.totalPages}
                </span>
                <button
                  onClick={() => loadPayruns(payrunPagination.currentPage + 1)}
                  disabled={payrunPagination.currentPage === payrunPagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Payslips Tab */}
      {activeTab === 'payslips' && (
        <div className="space-y-6">

          {Object.keys(groupedPayslips).length > 0 ? (
            Object.entries(groupedPayslips).map(([payrunId, group]) => (
              <div key={payrunId} className="bg-white rounded-lg shadow-sm border border-gray-200">
                {/* Payrun Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        Payrun {formatMonth(group.payrun?.month || 'N/A')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {group.totalCount} bulletins • {group.paidCount} payés • {group.totalCount - group.paidCount} en attente
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {group.totalAmount.toLocaleString()} FCFA
                      </p>
                      <p className="text-sm text-gray-600">Total période</p>
                    </div>
                  </div>
                </div>

                {/* Payslips Table */}
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
                          Statut
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {group.payslips.map((payslip) => (
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleDownloadPayslip(payslip.id)}
                              className="text-indigo-600 hover:text-indigo-900 mr-4"
                            >
                              <Download className="h-5 w-5 mr-1 inline" />
                              PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-12 text-center text-sm text-gray-500">
                <div className="flex flex-col items-center">
                  <FileText className="h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-1">Aucun bulletin de paie trouvé</p>
                  <p>Les bulletins de paie apparaîtront ici une fois les payruns créés.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Payrun Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Nouveau Payrun
              </h3>

              <form onSubmit={handleCreatePayrun}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mois de paie
                    </label>
                    <input
                      type="month"
                      value={formData.month}
                      onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
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
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
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

export default Payroll;