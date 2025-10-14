'use client';

import { useState } from 'react';
import { Branch } from '@prisma/client';
import { Edit, Trash2, Eye, EyeOff, MapPin, Phone, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type BranchWithCount = Branch & {
  _count: {
    staff: number;
  };
};

interface BranchesListProps {
  branches: BranchWithCount[];
  businessId: string;
}

export function BranchesList({ branches }: BranchesListProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleToggleActive = async (branchId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!response.ok) {
        throw new Error('Failed to update branch');
      }

      toast.success(currentActive ? 'הסניף הושבת' : 'הסניף הופעל');
      router.refresh();
    } catch (error) {
      toast.error('אירעה שגיאה');
    }
  };

  const handleDelete = async (branchId: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק סניף זה?')) {
      return;
    }

    setIsDeleting(branchId);
    try {
      const response = await fetch(`/api/branches/${branchId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete branch');
      }

      toast.success('הסניף נמחק בהצלחה');
      router.refresh();
    } catch (error) {
      toast.error('אירעה שגיאה במחיקת הסניף');
    } finally {
      setIsDeleting(null);
    }
  };

  if (branches.length === 0) {
    return (
      <div className="card text-center py-12">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">אין סניפים עדיין</p>
        <p className="text-sm text-gray-400 mb-6">
          הוסף סניפים כדי לנהל מיקומים שונים של העסק שלך
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {branches.map((branch) => (
        <div
          key={branch.id}
          className={`card ${!branch.active && 'opacity-60'}`}
        >
          {/* Branch Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" />
                {branch.name}
              </h3>
            </div>
            <div className="flex gap-2">
              {branch.isDefault && (
                <span className="inline-block px-2 py-1 text-xs bg-green-50 text-green-700 rounded font-medium">
                  ברירת מחדל
                </span>
              )}
              {branch.hasCustomHours && (
                <span className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                  שעות מותאמות
                </span>
              )}
            </div>
          </div>

          {/* Branch Details */}
          <div className="space-y-3 mb-4">
            {branch.address && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="break-words">{branch.address}</span>
              </div>
            )}
            
            {branch.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span dir="ltr">{branch.phone}</span>
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4" />
              <span>{branch._count.staff} עובדים</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-4">
            {branch.active ? (
              <span className="badge badge-success">פעיל</span>
            ) : (
              <span className="badge badge-danger">לא פעיל</span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push(`/dashboard/branches/${branch.id}/edit`)}
              className="btn btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"
            >
              <Edit className="w-4 h-4" />
              <span>עריכה</span>
            </button>
            <button
              onClick={() => handleToggleActive(branch.id, branch.active)}
              className="btn btn-secondary px-3"
              title={branch.active ? 'השבת' : 'הפעל'}
            >
              {branch.active ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => handleDelete(branch.id)}
              disabled={isDeleting === branch.id}
              className="btn btn-danger px-3"
              title="מחק"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

