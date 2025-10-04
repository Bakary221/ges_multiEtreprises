import React from 'react';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  bgColor = 'bg-white',
  textColor = 'text-blue-600',
  valueColor = 'text-blue-900',
  iconBgColor = 'bg-blue-100',
  iconColor = 'text-blue-600',
  borderColor = 'border-blue-200',
  variant = 'default'
}) => {
  if (variant === 'colored') {
    return (
      <div className={`group relative overflow-hidden ${bgColor} p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}>
        <div className="absolute inset-0  bg-opacity-20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className={`${textColor} text-sm font-medium mb-1`}>{title}</p>
            <p className="text-3xl font-bold text-white">{value}</p>
            <div className="mt-2 flex items-center">
              <div className={`w-2 h-2 ${iconBgColor.replace('bg-', 'bg-').replace('-100', '-200')} rounded-full mr-2`}></div>
              <span className={`${textColor} text-xs`}>{subtitle}</span>
            </div>
          </div>
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgColor} p-8 rounded-2xl shadow-lg border ${borderColor} hover:shadow-xl hover:bg-blue-100 hover:border-blue-300 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${textColor} text-sm font-medium mb-1`}>{title}</p>
          <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
          <div className="mt-2 flex items-center">
            <div className={`w-2 h-2 ${iconBgColor.replace('-100', '-500')} rounded-full mr-2`}></div>
            <span className={`${textColor} text-xs`}>{subtitle}</span>
          </div>
        </div>
        <div className={`p-3 ${iconBgColor} rounded-xl`}>
          <Icon className={`h-8 w-8 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;