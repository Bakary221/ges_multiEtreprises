import React from 'react';
import { Bar } from 'react-chartjs-2';
import { chartOptions } from '../constants/dashboardConstants';
import { Activity } from 'lucide-react';

const AttendanceChart = ({ data }) => {
  const attendanceData = {
    labels: data?.map(item => item.day) || ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    datasets: [
      {
        label: 'Présences',
        data: data?.map(item => item.present) || [95, 92, 98, 96, 94, 85],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
      },
      {
        label: 'Absences',
        data: data?.map(item => item.absent) || [5, 8, 2, 4, 6, 15],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
      },
    ],
  };

  return (
    <div className="group bg-white bg-opacity-80 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white border-opacity-20 lg:col-span-2">
      <div className="flex items-center mb-6">
        <div className="p-3 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl mr-4">
          <Activity className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-gray-900">Présences de la Semaine</h3>
      </div>
      <div className="h-64">
        <Bar data={attendanceData} options={chartOptions} />
      </div>
    </div>
  );
};

export default AttendanceChart;