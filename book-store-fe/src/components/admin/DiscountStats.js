import React from "react";
import { Icon } from "@iconify/react";
import { formatPrice } from "../../utils/formatPrice";

const DiscountStats = ({ statistics }) => {
  if (!statistics) return null;

  const stats = [
    {
      title: "Total Codes",
      value: statistics.total || 0,
      icon: "mdi:ticket-percent",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Codes",
      value: statistics.active || 0,
      icon: "mdi:check-circle",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Expired Codes",
      value: statistics.expired || 0,
      icon: "mdi:clock-alert",
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Total Uses",
      value: statistics.totalUses || 0,
      icon: "mdi:trending-up",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Average Value",
      value: statistics.avgValue
        ? formatPrice(statistics.avgValue)
        : formatPrice(0),
      icon: "mdi:chart-line",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${stat.bgColor} rounded-lg p-3`}>
              <Icon icon={stat.icon} width="24" className={stat.color} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DiscountStats;
