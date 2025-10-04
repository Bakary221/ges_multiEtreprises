export const payrollChartData = {
  labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun'],
  datasets: [
    {
      label: 'Masse salariale (€)',
      data: [45000, 52000, 48000, 61000, 55000, 67000],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
    },
  ],
};

export const employeeDistributionData = {
  labels: ['Tech', 'RH', 'Finance', 'Marketing', 'Opérations'],
  datasets: [
    {
      data: [35, 15, 20, 10, 20],
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

export const attendanceData = {
  labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
  datasets: [
    {
      label: 'Présences',
      data: [95, 92, 98, 96, 94, 85],
      backgroundColor: 'rgba(16, 185, 129, 0.8)',
    },
    {
      label: 'Absences',
      data: [5, 8, 2, 4, 6, 15],
      backgroundColor: 'rgba(239, 68, 68, 0.8)',
    },
  ],
};

export const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};