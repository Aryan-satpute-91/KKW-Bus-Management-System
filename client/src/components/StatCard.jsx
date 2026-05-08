const StatCard = ({ title, value, icon, color = 'blue', subtitle, trend }) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-secondary',
      border: 'border-blue-100',
      trend: 'text-blue-600',
    },
    navy: {
      bg: 'bg-indigo-50',
      icon: 'text-primary',
      border: 'border-indigo-100',
      trend: 'text-indigo-600',
    },
    green: {
      bg: 'bg-emerald-50',
      icon: 'text-emerald-600',
      border: 'border-emerald-100',
      trend: 'text-emerald-600',
    },
    orange: {
      bg: 'bg-orange-50',
      icon: 'text-orange-600',
      border: 'border-orange-100',
      trend: 'text-orange-600',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      border: 'border-red-100',
      trend: 'text-red-600',
    },
  };

  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`stat-card border ${c.border} animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800 leading-tight">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${c.trend}`}>
              <span className="material-symbols-outlined text-sm">
                {trend > 0 ? 'trending_up' : 'trending_down'}
              </span>
              <span>{trend > 0 ? '+' : ''}{trend}% this month</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
          <span className={`material-symbols-outlined ${c.icon} text-2xl`}>{icon}</span>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
