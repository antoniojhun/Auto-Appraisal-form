import React, { useRef, useState } from 'react';
import { DamageMarker, DamageType } from '../types';
import { MousePointer2, Circle, X, Triangle, AlertCircle } from 'lucide-react';

interface DamageMapProps {
  markers: DamageMarker[];
  onAddMarker: (marker: DamageMarker) => void;
  onRemoveMarker: (id: string) => void;
}

const DamageMap: React.FC<DamageMapProps> = ({ markers, onAddMarker, onRemoveMarker }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedTool, setSelectedTool] = useState<DamageType>(DamageType.SCRATCH);

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates to 0-100 range for responsiveness
    const normX = (x / rect.width) * 300; // Viewbox width
    const normY = (y / rect.height) * 200; // Viewbox height

    const newMarker: DamageMarker = {
      id: Date.now().toString(),
      x: normX,
      y: normY,
      type: selectedTool,
    };

    onAddMarker(newMarker);
  };

  const renderMarkerIcon = (type: DamageType) => {
    switch (type) {
      case DamageType.SCRATCH: return <path d="M-3,-3 L3,3 M-3,3 L3,-3" stroke="red" strokeWidth="2" />; // Zigzag/Cross
      case DamageType.STONE_CHIP: return <path d="M-2,-2 L2,2 M-2,2 L2,-2" stroke="blue" strokeWidth="2" />; // X
      case DamageType.DENT: return <path d="M0,-4 L-3,2 L3,2 Z" fill="none" stroke="orange" strokeWidth="2" />; // Triangle
      case DamageType.RUST: return <circle cx="0" cy="0" r="3" fill="none" stroke="brown" strokeWidth="2" />; // Circle
    }
  };

  const getToolIcon = (type: DamageType) => {
      switch (type) {
        case DamageType.SCRATCH: return <div className="w-4 h-0.5 bg-red-500 transform rotate-45" />; // Simplified visual
        case DamageType.STONE_CHIP: return <X size={16} className="text-blue-500" />;
        case DamageType.DENT: return <Triangle size={16} className="text-orange-500" />;
        case DamageType.RUST: return <Circle size={16} className="text-amber-700" />;
      }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Tool Selector */}
      <div className="flex flex-row md:flex-col gap-3 justify-center p-2 bg-gray-50 rounded-lg border border-gray-200 h-fit">
        {Object.values(DamageType).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedTool(type)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              selectedTool === type
                ? 'bg-white shadow-md ring-1 ring-gray-200 text-gray-900'
                : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
            }`}
          >
            <span className="flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
               {getToolIcon(type)}
            </span>
            <span className="hidden md:inline">{type}</span>
          </button>
        ))}
      </div>

      {/* SVG Map */}
      <div className="relative flex-grow bg-white border border-gray-100 rounded-xl p-4 shadow-inner">
        <svg
          ref={svgRef}
          viewBox="0 0 300 200"
          className="w-full h-auto cursor-crosshair select-none touch-none"
          onClick={handleSvgClick}
        >
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.15" />
            </filter>
          </defs>
          
          {/* Car Body Outline - Simplified Top Down View */}
          <g filter="url(#shadow)" stroke="#374151" strokeWidth="2" fill="#F9FAFB">
            {/* Main Body */}
            <path d="M 40,50 C 20,50 15,70 15,100 C 15,130 20,150 40,150 L 260,150 C 280,150 285,130 285,100 C 285,70 280,50 260,50 Z" />
            
            {/* Windshield */}
            <path d="M 70,60 L 70,140 L 100,135 L 100,65 Z" fill="#E5E7EB" />
            
            {/* Rear Window */}
            <path d="M 220,60 L 220,140 L 200,135 L 200,65 Z" fill="#E5E7EB" />
            
            {/* Roof/Side Windows lines */}
            <path d="M 100,65 L 200,65" fill="none" />
            <path d="M 100,135 L 200,135" fill="none" />
            
            {/* Hood Detail */}
            <path d="M 40,60 L 40,140" strokeWidth="1" strokeOpacity="0.5" />
            
            {/* Trunk Detail */}
            <path d="M 260,60 L 260,140" strokeWidth="1" strokeOpacity="0.5" />

            {/* Wheels */}
            <rect x="50" y="35" width="30" height="15" rx="4" fill="#1F2937" />
            <rect x="50" y="150" width="30" height="15" rx="4" fill="#1F2937" />
            <rect x="220" y="35" width="30" height="15" rx="4" fill="#1F2937" />
            <rect x="220" y="150" width="30" height="15" rx="4" fill="#1F2937" />
          </g>

          {/* Markers */}
          {markers.map((marker) => (
            <g
              key={marker.id}
              transform={`translate(${marker.x}, ${marker.y})`}
              onClick={(e) => {
                e.stopPropagation();
                onRemoveMarker(marker.id);
              }}
              className="cursor-pointer hover:opacity-70"
            >
              <circle r="8" fill="white" opacity="0.01" /> {/* Hit area */}
              {renderMarkerIcon(marker.type)}
            </g>
          ))}
        </svg>
        <p className="text-xs text-center text-gray-400 mt-2">Tap diagram to add defect marker. Tap marker to remove.</p>
      </div>
    </div>
  );
};

export default DamageMap;