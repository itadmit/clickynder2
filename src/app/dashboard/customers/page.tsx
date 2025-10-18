'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { toast } from 'react-hot-toast';
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  Eye,
} from 'lucide-react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  createdAt: string;
  _count?: {
    appointments: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async (search?: string) => {
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/customers?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch customers');
      }

      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      toast.error('שגיאה בטעינת הלקוחות');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(searchTerm);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  return (
    <div>
      <DashboardHeader
        title="לקוחות"
        subtitle="נהל את רשימת הלקוחות שלך"
      />

      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        {/* Search Bar */}
        <div className="card mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="חפש לפי שם, טלפון או אימייל..."
                className="form-input pr-10"
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'חפש'
              )}
            </button>
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  fetchCustomers();
                }}
                className="btn btn-secondary"
                disabled={isLoading}
              >
                נקה
              </button>
            )}
          </form>
        </div>

        {/* Customers List */}
        <div className="card">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="h-12 w-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                  </div>
                  <div className="h-8 w-20 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm ? 'לא נמצאו לקוחות' : 'עדיין אין לקוחות'}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? 'נסה לחפש עם מילות חיפוש אחרות'
                  : 'לקוחות יופיעו כאן לאחר שיקבעו תור'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600">
                  {customers.length} לקוחות נמצאו
                </p>
              </div>

              {/* Mobile View - Cards */}
              <div className="block md:hidden space-y-3">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => (window.location.href = `/dashboard/customers/${customer.id}`)}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-primary-300 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <Phone className="w-3.5 h-3.5" />
                          <a
                            href={`tel:${customer.phone}`}
                            className="hover:text-primary-600"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {customer.phone}
                          </a>
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-3.5 h-3.5" />
                            <a
                              href={`mailto:${customer.email}`}
                              className="hover:text-primary-600 truncate"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {customer.email}
                            </a>
                          </div>
                        )}
                      </div>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800 flex-shrink-0">
                        {customer._count?.appointments || 0} תורים
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>הצטרף {formatDate(customer.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-primary-600">
                        <Eye className="w-3.5 h-3.5" />
                        <span>צפה</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        לקוח
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        טלפון
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        אימייל
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        תורים
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        תאריך הצטרפות
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        פעולות
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customers.map((customer) => (
                      <tr
                        key={customer.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {customer.firstName} {customer.lastName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4" />
                            <a
                              href={`tel:${customer.phone}`}
                              className="hover:text-primary-600"
                            >
                              {customer.phone}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {customer.email ? (
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <a
                                href={`mailto:${customer.email}`}
                                className="hover:text-primary-600"
                              >
                                {customer.email}
                              </a>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                            {customer._count?.appointments || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(customer.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() =>
                              (window.location.href = `/dashboard/customers/${customer.id}`)
                            }
                            className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            title="צפייה בפרטי הלקוח והיסטוריית תורים"
                          >
                            <Eye className="w-4 h-4 pointer-events-none" />
                            <span>צפה</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

