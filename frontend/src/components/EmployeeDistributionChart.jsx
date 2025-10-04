import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { chartOptions } from '../constants/dashboardConstants';
import { Users } from 'lucide-react';

const EmployeeDistributionChart = ({ data }) => {
  const employeeDistributionData = {
    labels: data?.map(item => item.department) || ['Tech', 'RH', 'Finance', 'Marketing', 'Opérations'],
    datasets: [
      {
        data: data?.map(item => item.count) || [35, 15, 20, 10, 20],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      },
    ],
  };

  return (
    <div className="group bg-white bg-opacity-80 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl mr-4">
          <Users className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Répartition des Employés</h3>
      </div>
      <div className="h-64 flex items-center justify-center">
        <Doughnut data={employeeDistributionData} options={chartOptions} />
      </div>
    </div>
  );
};

export default EmployeeDistributionChart;