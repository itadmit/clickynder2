'use client';

import { useState } from 'react';
import { Service, ServiceCategory, Staff, ServiceStaff } from '@prisma/client';
import { Edit, Trash2, Eye, EyeOff, Plus, Scissors, FolderOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';
import { CategoryModal } from './CategoryModal';

type ServiceWithRelations = Service & {
  category: ServiceCategory | null;
  serviceStaff: (ServiceStaff & { staff: Staff })[];
};

interface ServicesListProps {
  services: ServiceWithRelations[];
  categories: ServiceCategory[];
  businessId: string;
  currency?: string;
}

export function ServicesList({ services, categories: initialCategories, businessId, currency = 'ILS' }: ServicesListProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState<ServiceCategory[]>(initialCategories);

  const filteredServices = services.filter((service) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'uncategorized') return !service.categoryId;
    return service.categoryId === selectedCategory;
  });

  const handleToggleActive = async (serviceId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update service');
      }

      toast.success(currentActive ? 'השירות הושבת' : 'השירות הופעל');
      router.refresh();
    } catch (error) {
      toast.error('אירעה שגיאה');
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק שירות זה?')) {
      return;
    }

    setIsDeleting(serviceId);
    try {
      const response = await fetch(`/api/services/${serviceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      toast.success('השירות נמחק בהצלחה');
      router.refresh();
    } catch (error) {
      toast.error('אירעה שגיאה במחיקת השירות');
    } finally {
      setIsDeleting(null);
    }
  };

  const refreshCategories = async () => {
    try {
      const response = await fetch(`/api/service-categories?businessId=${businessId}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error refreshing categories:', error);
    }
  };

  const handleCategoryUpdated = () => {
    refreshCategories();
    router.refresh();
  };

  return (
    <div>
      {/* Category Filter */}
      <div className="mb-6 flex gap-2 flex-wrap items-center bg-white md:bg-transparent p-4 md:p-0 -mx-4 md:mx-0 rounded-lg md:rounded-none">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          הכל ({services.length})
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === category.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {category.name}
          </button>
        ))}
        <button
          onClick={() => setSelectedCategory('uncategorized')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedCategory === 'uncategorized'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          ללא קטגוריה
        </button>
        
        {/* Manage Categories Button */}
        <div className="mr-auto">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium border border-gray-300"
          >
            <FolderOpen className="w-4 h-4 inline-block ml-2" />
            <span>נהל קטגוריות</span>
          </button>
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="card text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {services.length === 0 ? 'אין עדיין שירותים' : 'אין שירותים בקטגוריה זו'}
            </h3>
            <p className="text-gray-600 mb-6">
              {services.length === 0 
                ? 'הוסף את השירות הראשון שלך כדי להתחיל לקבל תורים'
                : 'נסה לבחור קטגוריה אחרת או הוסף שירות חדש'
              }
            </p>
            {services.length === 0 && (
              <Link
                href="/dashboard/services/new"
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span>הוסף שירות ראשון</span>
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Mobile View */}
          <div className="block md:hidden space-y-3">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${!service.active && 'opacity-60'}`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {service.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: service.color }}
                        />
                      )}
                      <h3 className="font-bold">{service.name}</h3>
                    </div>
                    {service.category && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {service.category.name}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Link
                      href={`/dashboard/services/${service.id}/edit`}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-600" />
                    </Link>
                    <button
                      onClick={() => handleToggleActive(service.id, service.active)}
                      className="p-2 hover:bg-gray-100 rounded transition-colors"
                    >
                      {service.active ? (
                        <Eye className="w-4 h-4 text-green-600" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600">
                  <span>{service.durationMin} דק'</span>
                  {service.priceCents !== null && (
                    <span className="font-medium text-gray-900">
                      {formatPrice(service.priceCents, currency)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Desktop View */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className={`card ${!service.active && 'opacity-60'}`}
              >
                {/* Service Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{service.name}</h3>
                    {service.category && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {service.category.name}
                      </span>
                    )}
                  </div>
                  {service.color && (
                    <div
                      className="w-8 h-8 rounded-full"
                      style={{ backgroundColor: service.color }}
                    />
                  )}
                </div>

                {/* Service Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">משך:</span>
                    <span className="font-medium">{service.durationMin} דקות</span>
                  </div>
                  {service.priceCents !== null && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">מחיר:</span>
                      <span className="font-medium">{formatPrice(service.priceCents, currency)}</span>
                    </div>
                  )}
                  {service.bufferAfterMin > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">מרווח לאחר:</span>
                      <span className="font-medium">{service.bufferAfterMin} דקות</span>
                    </div>
                  )}
                </div>

                {/* Assigned Staff */}
                {service.serviceStaff.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2">עובדים משויכים:</p>
                    <div className="flex flex-wrap gap-1">
                      {service.serviceStaff.map(({ staff }) => (
                        <span
                          key={staff.id}
                          className="inline-block px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded"
                        >
                          {staff.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {service.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {service.description}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => router.push(`/dashboard/services/${service.id}/edit`)}
                    className="btn btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    <span>עריכה</span>
                  </button>
                  <button
                    onClick={() => handleToggleActive(service.id, service.active)}
                    className="btn btn-secondary px-3"
                    title={service.active ? 'השבת' : 'הפעל'}
                  >
                    {service.active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    disabled={isDeleting === service.id}
                    className="btn btn-danger px-3"
                    title="מחק"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Category Management Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        businessId={businessId}
        categories={categories}
        onCategoryCreated={handleCategoryUpdated}
      />
    </div>
  );
}

