import React, { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  headerAction?: ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children, className = '', headerAction }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 ${className}`}>
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wide">{title}</h2>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
};

export default Section;