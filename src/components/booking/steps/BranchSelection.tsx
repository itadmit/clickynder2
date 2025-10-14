'use client';

import { Branch } from '@prisma/client';
import { MapPin, Clock } from 'lucide-react';

interface BranchSelectionProps {
  branches: Branch[];
  selectedBranchId?: string;
  onSelect: (branchId: string) => void;
}

export function BranchSelection({ branches, selectedBranchId, onSelect }: BranchSelectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">בחר סניף</h2>
      <p className="text-gray-600 mb-6">איפה תרצה לקבל את השירות?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => onSelect(branch.id)}
            className={`
              p-6 rounded-lg border-2 text-right transition-all
              hover:border-primary-500 hover:shadow-md
              ${
                selectedBranchId === branch.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200'
              }
            `}
          >
            <h3 className="text-lg font-bold mb-2">{branch.name}</h3>
            
            {branch.address && (
              <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{branch.address}</span>
              </div>
            )}

            {branch.phone && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock className="w-4 h-4" />
                <span>טלפון: {branch.phone}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

