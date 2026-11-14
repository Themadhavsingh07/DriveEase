import React from 'react';
import { Car } from '../../types';
import {
  Settings2,
  Fuel,
  Users,
  Gauge,
  Zap,
  Briefcase,
  DoorOpen,
  Calendar,
  Car as CarIcon,
  Shield,
  Activity,
} from 'lucide-react';

interface VehicleSpecificationsProps {
  car: Car;
}

export const VehicleSpecifications: React.FC<VehicleSpecificationsProps> = ({
  car,
}) => {
  const specs = [
    {
      label: 'Brand & Model',
      value: `${car.brand} ${car.model}`,
      icon: CarIcon,
      color: 'text-[#2563EB]',
    },
    {
      label: 'Model Year',
      value: car.year.toString(),
      icon: Calendar,
      color: 'text-indigo-600',
    },
    {
      label: 'Transmission',
      value: car.transmission,
      icon: Settings2,
      color: 'text-[#2563EB]',
    },
    {
      label: 'Fuel Type',
      value: car.fuelType,
      icon: Fuel,
      color: 'text-emerald-600',
    },
    {
      label: 'Seating Capacity',
      value: `${car.seatingCapacity} Passengers`,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Fuel Economy / Range',
      value: car.mileage,
      icon: Gauge,
      color: 'text-amber-600',
    },
    {
      label: 'Engine / Powertrain',
      value: car.engineCapacity || 'High Efficiency Engine',
      icon: Zap,
      color: 'text-purple-600',
    },
    {
      label: 'Peak Output',
      value: car.horsepower ? `${car.horsepower} HP` : 'Refined Output',
      icon: Activity,
      color: 'text-rose-600',
    },
    {
      label: 'Body Style',
      value: car.bodyType || car.category,
      icon: Shield,
      color: 'text-slate-600',
    },
    {
      label: 'Number of Doors',
      value: `${car.doors || 5} Doors`,
      icon: DoorOpen,
      color: 'text-teal-600',
    },
    {
      label: 'Luggage Storage',
      value: `${car.luggageCapacity || 3} Standard Cases`,
      icon: Briefcase,
      color: 'text-orange-600',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-sm space-y-5">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-[#101B2D]">
            Technical Specifications
          </h3>
          <p className="text-xs text-[#64748B]">
            Engineered powertrain parameters and verified onboard dimensions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {specs.map((spec, idx) => {
          const Icon = spec.icon;
          return (
            <div
              key={idx}
              className="p-3.5 sm:p-4 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-white shadow-xs border border-slate-200/60 flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${spec.color}`} />
                </div>
                <span className="text-[11px] font-semibold text-[#64748B] block truncate">
                  {spec.label}
                </span>
              </div>
              <span className="text-xs sm:text-sm font-extrabold text-[#101B2D] truncate">
                {spec.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
