import React from 'react';
import { Condition } from '../types';

interface ChecklistGroupProps {
  title: string;
  items: Record<string, Condition>;
  onChange: (key: string, value: Condition) => void;
}

const ChecklistGroup: React.FC<ChecklistGroupProps> = ({ title, items, onChange }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-2 mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b pb-1">
        <div className="col-span-6 md:col-span-5 pl-2">Item</div>
        <div className="col-span-2 text-center">Good</div>
        <div className="col-span-2 text-center">Ave</div>
        <div className="col-span-2 text-center">Poor</div>
      </div>
      <div className="space-y-1">
        {Object.entries(items).map(([key, value]) => (
          <div key={key} className="grid grid-cols-12 gap-2 items-center hover:bg-gray-50 rounded py-1 transition-colors">
            <div className="col-span-6 md:col-span-5 pl-2 text-sm text-gray-700 font-medium truncate" title={key}>
              {key}
            </div>
            
            {[Condition.GOOD, Condition.AVERAGE, Condition.POOR].map((cond) => (
              <div key={cond} className="col-span-2 flex justify-center">
                <label className="cursor-pointer flex items-center justify-center w-full h-full">
                  <input
                    type="radio"
                    name={`${title}-${key}`}
                    checked={value === cond}
                    onChange={() => onChange(key, cond)}
                    className={`w-4 h-4 md:w-5 md:h-5 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${
                        cond === Condition.POOR ? 'text-red-600 focus:ring-red-500' : ''
                    }`}
                  />
                </label>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChecklistGroup;