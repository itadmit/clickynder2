'use client';

import { useState } from 'react';
import { Staff, Branch, Service, ServiceStaff } from '@prisma/client';
import { Edit, Trash2, Eye, EyeOff, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type StaffWithRelations = Staff & {
  branch: Branch | null;
  serviceStaff: (ServiceStaff & { service: Service })[];
};

interface StaffListProps {
  staff: StaffWithRelations[];
  branches: Branch[];
  businessId: string;
}

export function StaffList({ staff, branches }: StaffListProps) {
  const router = useRouter();
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const filteredStaff = staff.filter((member) => {
    if (selectedBranch === 'all') return true;
    if (selectedBranch === 'unassigned') return !member.branchId;
    return member.branchId === selectedBranch;
  });

  const handleToggleActive = async (staffId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update staff');
      }

      toast.success(currentActive ? 'העובד הושבת' : 'העובד הופעל');
      router.refresh();
    } catch (error) {
      toast.error('אירעה שגיאה');
    }
  };

  const handleDelete = async (staffId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק עובד זה?')) {
      return;
    }

    setIsDeleting(staffId);
    try {
      const response = await fetch(`/api/staff/${staffId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete staff');
      }

      toast.success('העובד נמחק בהצלחה');
      router.refresh();
    } catch (error) {
      toast.error('אירעה שגיאה במחיקת העובד');
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div>
      {/* Branch Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setSelectedBranch('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedBranch === 'all'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          הכל ({staff.length})
        </button>
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => setSelectedBranch(branch.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedBranch === branch.id
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {branch.name}
          </button>
        ))}
        <button
          onClick={() => setSelectedBranch('unassigned')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            selectedBranch === 'unassigned'
              ? 'bg-primary-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          לא משויך לסניף
        </button>
      </div>

      {/* Staff Grid */}
      {filteredStaff.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 mb-4">אין עובדים להצגה</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStaff.map((member) => (
            <div
              key={member.id}
              className={`card ${!member.active && 'opacity-60'}`}
            >
              {/* Staff Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{member.name}</h3>
                  {member.roleLabel && (
                    <p className="text-sm text-gray-600">{member.roleLabel}</p>
                  )}
                </div>
                {member.calendarColor && (
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: member.calendarColor }}
                    title="צבע ביומן"
                  />
                )}
              </div>

              {/* Contact Info */}
              <div className="space-y-2 mb-4">
                {member.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.branch && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{member.branch.name}</span>
                  </div>
                )}
              </div>

              {/* Services */}
              {member.serviceStaff.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">שירותים:</p>
                  <div className="flex flex-wrap gap-1">
                    {member.serviceStaff.map(({ service }) => (
                      <span
                        key={service.id}
                        className="inline-block px-2 py-1 text-xs bg-primary-50 text-primary-700 rounded"
                      >
                        {service.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar Provider */}
              {member.calendarProvider !== 'none' && (
                <div className="mb-4">
                  <span className="inline-block px-2 py-1 text-xs bg-green-50 text-green-700 rounded">
                    מחובר ל-{member.calendarProvider}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => router.push(`/dashboard/staff/${member.id}/edit`)}
                  className="btn btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
                >
                  <Edit className="w-4 h-4" />
                  <span>עריכה</span>
                </button>
                <button
                  onClick={() => handleToggleActive(member.id, member.active)}
                  className="btn btn-secondary px-3"
                  title={member.active ? 'השבת' : 'הפעל'}
                >
                  {member.active ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  disabled={isDeleting === member.id}
                  className="btn btn-danger px-3"
                  title="מחק"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

