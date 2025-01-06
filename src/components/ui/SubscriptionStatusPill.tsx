import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock } from 'lucide-react';

type StatusConfig = {
  color: string;
  icon: React.JSX.Element;
  label: string;
};

const statusConfigs: Record<string, StatusConfig> = {
  Active: {
    color: 'bg-green-100 text-green-800',
    icon: <CheckCircle className="w-4 h-4" />,
    label: 'Active'
  },
  PastDue: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <AlertCircle className="w-4 h-4" />,
    label: 'Past Due'
  },
  Canceled: {
    color: 'bg-red-100 text-red-800',
    icon: <XCircle className="w-4 h-4" />,
    label: 'Canceled'
  },
  Unpaid: {
    color: 'bg-gray-100 text-gray-800',
    icon: <Clock className="w-4 h-4" />,
    label: 'Unpaid'
  }
};

interface SubscriptionStatusPillProps {
  status: string;
}

export function SubscriptionStatusPill({ status }: SubscriptionStatusPillProps) {
  const config = statusConfigs[status] || statusConfigs.Unpaid;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium ${config.color}`}>
      {config.icon}
      {config.label}
    </span>
  );
} 