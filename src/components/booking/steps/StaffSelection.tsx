'use client';

import { Staff, ServiceStaff, Service } from '@prisma/client';
import { User, ArrowRight } from 'lucide-react';

type StaffWithServices = Staff & {
  serviceStaff: (ServiceStaff & {
    service: Service;
  })[];
};

interface StaffSelectionProps {
  staff: StaffWithServices[];
  selectedStaffId?: string;
  onSelect: (staffId: string) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function StaffSelection({ 
  staff, 
  selectedStaffId, 
  onSelect, 
  onBack, 
  onSkip 
}: StaffSelectionProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">בחר עובד</h2>
      <p className="text-gray-600 mb-6">עם מי תרצה לקבוע?</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {staff.map((member) => (
          <button
            key={member.id}
            onClick={() => onSelect(member.id)}
            className={`
              p-6 rounded-lg border-2 text-center transition-all
              hover:border-primary-500 hover:shadow-md
              ${
                selectedStaffId === member.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200'
              }
            `}
          >
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            
            <h3 className="font-bold mb-1">{member.name}</h3>
            
            {member.roleLabel && (
              <p className="text-sm text-gray-600">{member.roleLabel}</p>
            )}
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button
          onClick={onSkip}
          className="btn btn-secondary flex-1"
        >
          לא משנה לי מי
        </button>
        
        <button
          onClick={onBack}
          className="btn btn-secondary flex items-center gap-2"
        >
          <ArrowRight className="w-5 h-5" />
          <span>חזרה</span>
        </button>
      </div>
    </div>
  );
}

