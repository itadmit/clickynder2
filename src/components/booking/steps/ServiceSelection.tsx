'use client';

import { Service, ServiceCategory } from '@prisma/client';
import { Clock, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

type ServiceWithCategory = Service & {
  category: ServiceCategory | null;
};

interface ServiceSelectionProps {
  services: ServiceWithCategory[];
  selectedServiceId?: string;
  onSelect: (serviceId: string) => void;
  onBack?: () => void;
  currency?: string;
}

export function ServiceSelection({ 
  services, 
  selectedServiceId, 
  onSelect, 
  onBack,
  currency = 'ILS'
}: ServiceSelectionProps) {
  // Group services by category
  const categorized: Record<string, ServiceWithCategory[]> = {};
  const uncategorized: ServiceWithCategory[] = [];

  services.forEach((service) => {
    if (service.category) {
      if (!categorized[service.category.name]) {
        categorized[service.category.name] = [];
      }
      categorized[service.category.name].push(service);
    } else {
      uncategorized.push(service);
    }
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">בחר שירות</h2>
      <p className="text-gray-600 mb-6">איזה שירות תרצה לקבל?</p>

      <div className="space-y-8">
        {/* Categorized Services */}
        {Object.entries(categorized).map(([categoryName, categoryServices]) => (
          <div key={categoryName}>
            <h3 className="text-lg font-bold text-gray-700 mb-4">{categoryName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryServices.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  selected={selectedServiceId === service.id}
                  onSelect={() => onSelect(service.id)}
                  currency={currency}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Uncategorized Services */}
        {uncategorized.length > 0 && (
          <div>
            {Object.keys(categorized).length > 0 && (
              <h3 className="text-lg font-bold text-gray-700 mb-4">שירותים נוספים</h3>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uncategorized.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  selected={selectedServiceId === service.id}
                  onSelect={() => onSelect(service.id)}
                  currency={currency}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {onBack && (
        <button
          onClick={onBack}
          className="mt-6 btn btn-secondary flex items-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          <span>חזרה</span>
        </button>
      )}
    </div>
  );
}

function ServiceCard({
  service,
  selected,
  onSelect,
  currency = 'ILS',
}: {
  service: Service;
  selected: boolean;
  onSelect: () => void;
  currency?: string;
}) {
  return (
    <button
      onClick={onSelect}
      className={`
        p-6 rounded-lg border-2 text-right transition-all
        hover:border-primary-500 hover:shadow-md
        ${selected ? 'border-primary-600 bg-primary-50' : 'border-gray-200'}
      `}
    >
      <h3 className="text-lg font-bold mb-2">{service.name}</h3>
      
      {service.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {service.description}
        </p>
      )}

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{service.durationMin} דקות</span>
        </div>
        
        {service.priceCents > 0 ? (
          <div className="flex items-center gap-1 font-medium text-primary-600">
            <span>{formatPrice(service.priceCents, currency)}</span>
          </div>
        ) : service.priceCents === 0 ? (
          <div className="flex items-center gap-1 font-medium text-green-600">
            <span>חינם</span>
          </div>
        ) : null}
      </div>
    </button>
  );
}

