import React from 'react';
import { cn } from '../utils/cn';

interface ImpactCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: 'primary' | 'secondary' | 'accent';
  trend?: {
    value: number;
    label: string;
  };
}

export default function ImpactCard({ title, value, subtitle, icon, color, trend }: ImpactCardProps) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 border-primary-200',
    secondary: 'bg-secondary-50 text-secondary-600 border-secondary-200',
    accent: 'bg-accent-50 text-accent-600 border-accent-200'
  };

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className={cn(
            'inline-flex p-3 rounded-lg border-2 mb-4',
            colorClasses[color]
          )}>
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
            <p className="text-sm text-gray-500">{subtitle}</p>
          </div>
        </div>
        {trend && (
          <div className="text-right">
            <div className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              trend.value > 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            )}>
              {trend.value > 0 ? '↗' : '↘'} {Math.abs(trend.value)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">{trend.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}