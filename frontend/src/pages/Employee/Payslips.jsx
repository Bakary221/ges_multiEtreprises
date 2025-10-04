import React, { useState, useEffect } from 'react';
import { payrollService } from '../../services/payrollService';
import { Download, FileText } from 'lucide-react';

const Payslips = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayslips();
  }, []);

  const loadPayslips = async () => {
    try {
      const data = await payrollService.getCurrentEmployeePayslips();
      setPayslips(data);
    } catch (error) {
      console.error('Error loading payslips:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id) => {
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
        <h1 className="text-2xl font-bold text-gray-900">Mes Bulletins de Paie</h1>
      </div>

      {/* Payslips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {payslips.map((payslip) => (
          <div key={payslip.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-indigo-600" />
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Bulletin #{payslip.id}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {payslip.payrun?.month}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Salaire net:</span>
                <span className="font-semibold text-gray-900">€{payslip.netSalary}</span>
              </div>
              <div className="text-xs text-gray-500">
                Généré le {new Date(payslip.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>

            <button
              onClick={() => handleDownloadPDF(payslip.id)}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Télécharger PDF
            </button>
          </div>
        ))}
      </div>

      {payslips.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun bulletin disponible</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vos bulletins de paie apparaîtront ici une fois générés.
          </p>
        </div>
      )}
    </div>
  );
};

export default Payslips;