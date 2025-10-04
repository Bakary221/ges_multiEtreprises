import React from 'react';
import { Line } from 'react-chartjs-2';
import { chartOptions } from '../constants/dashboardConstants';
import { TrendingUp } from 'lucide-react';

const PayrollChart = ({ data }) => {
  const payrollChartData = {
    labels: data?.map(item => item.month) || ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
    datasets: [
      {
        label: 'Masse salariale (€)',
        data: data?.map(item => item.amount) || [45000, 52000, 48000, 61000, 55000, 67000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="group bg-white bg-opacity-80 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl mr-4">
          <TrendingUp className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Évolution de la Paie</h3>
      </div>
      <div className="h-64">
        <Line data={payrollChartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default PayrollChart;