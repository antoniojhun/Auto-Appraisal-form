import React, { useState, useRef } from 'react';
import { 
  AppraisalState, 
  INITIAL_STATE, 
  DamageMarker, 
  Condition, 
  TradeType, 
  Transmission 
} from './types';
import Section from './components/Section';
import DamageMap from './components/DamageMap';
import ChecklistGroup from './components/ChecklistGroup';
import { analyzeVehicleImage, decodeVin } from './services/geminiService';
import { 
  Camera, 
  Save, 
  Car, 
  FileText, 
  CheckCircle2, 
  User,
  Wrench,
  Banknote,
  Loader2,
  ScanLine,
  ShieldCheck
} from 'lucide-react';

// --- Utilities ---

const resizeAndCompressImage = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const maxDim = 1024; // Downscale to max 1024px for performance
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxDim) {
          height *= maxDim / width;
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width *= maxDim / height;
          height = maxDim;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Compress to 70% quality JPEG
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      resolve(dataUrl);
    };
    img.onerror = (error) => reject(error);
  });
};

function App() {
  const [form, setForm] = useState<AppraisalState>(INITIAL_STATE);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleCustomerChange = (field: keyof typeof form.customer, value: string) => {
    setForm(prev => ({ ...prev, customer: { ...prev.customer, [field]: value } }));
  };

  const handleVehicleChange = (field: keyof typeof form.vehicle, value: string) => {
    setForm(prev => ({ ...prev, vehicle: { ...prev.vehicle, [field]: value } }));
  };

  const handleAddMarker = (marker: DamageMarker) => {
    setForm(prev => ({ ...prev, damageMarkers: [...prev.damageMarkers, marker] }));
  };

  const handleRemoveMarker = (id: string) => {
    setForm(prev => ({ ...prev, damageMarkers: prev.damageMarkers.filter(m => m.id !== id) }));
  };

  const handleInteriorChange = (key: string, value: Condition) => {
    setForm(prev => ({ ...prev, interior: { ...prev.interior, [key]: value } }));
  };

  const handleMechanicalChange = (key: string, value: Condition) => {
    setForm(prev => ({ ...prev, mechanical: { ...prev.mechanical, [key]: value } }));
  };

  const handleRepairChange = (index: number, field: 'description' | 'cost', value: string | number) => {
    const newRepairs = [...form.repairs];
    newRepairs[index] = { ...newRepairs[index], [field]: value };
    setForm(prev => ({ ...prev, repairs: newRepairs }));
  };

  const addNewRepairRow = () => {
    setForm(prev => ({
      ...prev,
      repairs: [...prev.repairs, { id: Date.now().toString(), description: '', cost: 0 }]
    }));
  };

  const calculateTotalRepairs = () => {
    return form.repairs.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
  };

  // --- AI & API Integration ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    try {
      const optimizedBase64 = await resizeAndCompressImage(file);
      const result = await analyzeVehicleImage(optimizedBase64);
      
      if (result) {
        setForm(prev => ({
          ...prev,
          vehicle: {
            ...prev.vehicle,
            ...result
          }
        }));
      }
    } catch (error) {
      console.error("Image processing failed", error);
      alert("Unable to process image. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleVinDecode = async () => {
    if (!form.vehicle.chassisNo) return;
    setIsDecoding(true);
    try {
      const result = await decodeVin(form.vehicle.chassisNo);
      if (result) {
         setForm(prev => ({
            ...prev,
            vehicle: {
              ...prev.vehicle,
              ...result
            }
          }));
      }
    } catch (e) {
      console.error(e);
      alert("VIN Decoding failed. Please check the connection and try again.");
    } finally {
      setIsDecoding(false);
    }
  };

  // --- Render Helpers ---

  const renderInput = (label: string, value: string, onChange: (val: string) => void, type = "text", placeholder = "") => (
    <div className="flex flex-col mb-3">
      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-shadow w-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <ShieldCheck className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">AutoGrade Pro</h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">AI Valuation System</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md text-sm font-semibold transition-all shadow-md hover:shadow-lg active:transform active:scale-95"
              onClick={() => alert("Report Finalized and Exported.")}
            >
              <Save size={16} />
              <span className="hidden sm:inline">Finalize Valuation</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* Top Grid: Customer & Vehicle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <Section title="Client Profile" headerAction={<User size={18} className="text-slate-400"/>}>
            <div className="space-y-2">
              {renderInput("Full Name", form.customer.name, (v) => handleCustomerChange("name", v), "text", "e.g. John Smith")}
              {renderInput("Billing Address", form.customer.address, (v) => handleCustomerChange("address", v), "text", "Street, Suburb, Postcode")}
              <div className="grid grid-cols-2 gap-4">
                {renderInput("Contact Number", form.customer.tel, (v) => handleCustomerChange("tel", v), "tel", "0400 000 000")}
                {renderInput("Email Address", form.customer.email, (v) => handleCustomerChange("email", v), "email", "client@email.com")}
              </div>
            </div>
          </Section>

          <Section 
            title="Vehicle Identity" 
            headerAction={
              <button 
                onClick={triggerFileInput}
                disabled={isAnalyzing}
                className="flex items-center gap-2 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-md hover:bg-indigo-100 transition-colors border border-indigo-200 uppercase tracking-wide"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <ScanLine size={14} />}
                {isAnalyzing ? "Processing..." : "AI Visual Scan"}
              </button>
            }
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*" 
            />
            
            {/* Rego and VIN Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {renderInput("Registration No", form.vehicle.regNo, (v) => handleVehicleChange("regNo", v), "text", "e.g. ABC-123")}

                <div className="flex flex-col">
                   <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1 block">VIN / Chassis No</label>
                   <div className="flex gap-2">
                      <input 
                         className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent uppercase font-mono"
                         value={form.vehicle.chassisNo}
                         onChange={(e) => handleVehicleChange("chassisNo", e.target.value)}
                         placeholder="17-Digit VIN"
                      />
                      <button 
                         onClick={handleVinDecode}
                         disabled={isDecoding || !form.vehicle.chassisNo}
                         className="bg-slate-800 text-white px-4 py-2 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
                      >
                         {isDecoding ? <Loader2 className="animate-spin" size={14}/> : <Wrench size={14}/>}
                         <span>Decode</span>
                      </button>
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderInput("Make", form.vehicle.make, (v) => handleVehicleChange("make", v), "text", "e.g. Toyota")}
              {renderInput("Model", form.vehicle.model, (v) => handleVehicleChange("model", v), "text", "e.g. Camry")}
              
              {/* New Fields */}
              {renderInput("Model Year", form.vehicle.year, (v) => handleVehicleChange("year", v), "text", "YYYY")}
              {renderInput("Trim / Variant", form.vehicle.trim, (v) => handleVehicleChange("trim", v), "text", "e.g. SX Hybrid")}
              
              {renderInput("Exterior Colour", form.vehicle.colour, (v) => handleVehicleChange("colour", v))}
              
              {renderInput("Engine No", form.vehicle.engineNo, (v) => handleVehicleChange("engineNo", v))}
              {renderInput("Odometer", form.vehicle.mileage, (v) => handleVehicleChange("mileage", v), "number", "km")}
              {renderInput("Compliance Date", form.vehicle.date, (v) => handleVehicleChange("date", v), "date")}
            </div>
          </Section>
        </div>

        {/* Bodywork Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Section title="Exterior Condition Map" className="h-full" headerAction={<Car size={18} className="text-slate-400"/>}>
              <DamageMap 
                markers={form.damageMarkers} 
                onAddMarker={handleAddMarker} 
                onRemoveMarker={handleRemoveMarker} 
              />
            </Section>
          </div>
          <div className="lg:col-span-1">
             <Section title="Overall Impression" className="h-full">
                <div className="flex flex-col h-full">
                  <div className="space-y-2 mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                    {['Excellent', 'Good', 'Average', 'Poor'].map((rating) => (
                      <label key={rating} className="flex items-center space-x-3 p-2 rounded hover:bg-white hover:shadow-sm cursor-pointer transition-all">
                        <input
                          type="radio"
                          name="general-rating"
                          checked={form.generalAppearance.rating === rating}
                          onChange={() => setForm(prev => ({...prev, generalAppearance: {...prev.generalAppearance, rating: rating as any}}))}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className={`text-sm font-semibold ${form.generalAppearance.rating === rating ? 'text-blue-700' : 'text-slate-700'}`}>{rating}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex-grow">
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Appraiser Notes</label>
                    <textarea
                      className="w-full h-40 p-3 bg-white border border-gray-300 rounded-md text-sm text-black placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter detailed summary of vehicle condition..."
                      value={form.generalAppearance.comments}
                      onChange={(e) => setForm(prev => ({...prev, generalAppearance: {...prev.generalAppearance, comments: e.target.value}}))}
                    />
                  </div>
                </div>
             </Section>
          </div>
        </div>

        {/* Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Section title="Interior Audit" headerAction={<FileText size={18} className="text-slate-400"/>}>
            <ChecklistGroup 
              title="interior" 
              items={form.interior} 
              onChange={handleInteriorChange} 
            />
          </Section>
          
          <Section title="Mechanical & Powertrain" headerAction={<Wrench size={18} className="text-slate-400"/>}>
            <div className="mb-6 pb-4 border-b border-gray-100">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Transmission Type</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={form.mechanicalExtras.gearbox === Transmission.AUTO}
                    onChange={() => setForm(prev => ({...prev, mechanicalExtras: {...prev.mechanicalExtras, gearbox: Transmission.AUTO}}))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Automatic</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={form.mechanicalExtras.gearbox === Transmission.MANUAL}
                    onChange={() => setForm(prev => ({...prev, mechanicalExtras: {...prev.mechanicalExtras, gearbox: Transmission.MANUAL}}))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">Manual</span>
                </label>
              </div>
            </div>

            <ChecklistGroup 
              title="mechanical" 
              items={form.mechanical} 
              onChange={handleMechanicalChange} 
            />
            
            <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
               {renderInput("Observations / Issues", form.mechanicalExtras.other, (v) => setForm(prev => ({...prev, mechanicalExtras: {...prev.mechanicalExtras, other: v}})), "text", "e.g. Oil leak detected")}
               {renderInput("Road Test Performance", form.mechanicalExtras.roadTest, (v) => setForm(prev => ({...prev, mechanicalExtras: {...prev.mechanicalExtras, roadTest: v}})), "text", "e.g. Slight vibration at 80km/h")}
               
               <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Service History</label>
                <div className="flex gap-4">
                  {['Complete', 'Part', 'None'].map((rec) => (
                     <label key={rec} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="serviceRecord"
                        checked={form.mechanicalExtras.serviceRecord === rec}
                        onChange={() => setForm(prev => ({...prev, mechanicalExtras: {...prev.mechanicalExtras, serviceRecord: rec as any}}))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-700">{rec}</span>
                   </label>
                  ))}
                </div>
               </div>
            </div>
          </Section>
        </div>

        {/* Costing & Signoff */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Reconditioning Requirements" headerAction={<Banknote size={18} className="text-slate-400"/>}>
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase mb-1 px-1">
                <div className="col-span-8">Work Description</div>
                <div className="col-span-4 text-right">Est. Cost ($)</div>
              </div>
              
              {form.repairs.map((repair, index) => (
                <div key={repair.id} className="grid grid-cols-12 gap-4 items-center group">
                  <div className="col-span-8">
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-md text-sm text-black placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="e.g. Front Bumper Respray"
                      value={repair.description}
                      onChange={(e) => handleRepairChange(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-slate-50 border border-gray-200 rounded-md text-sm text-black placeholder-gray-400 text-right focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-mono"
                      placeholder="0.00"
                      value={repair.cost || ''}
                      onChange={(e) => handleRepairChange(index, 'cost', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={addNewRepairRow}
                className="text-xs text-blue-600 font-bold uppercase tracking-wide hover:text-blue-800 mt-2 flex items-center gap-1"
              >
                + Add Item
              </button>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                <span className="font-bold text-gray-800 uppercase text-sm">Total Reconditioning</span>
                <span className="text-xl font-bold text-red-600 font-mono">${calculateTotalRepairs().toFixed(2)}</span>
              </div>
            </div>
          </Section>

          <Section title="Valuation Sign-off" headerAction={<CheckCircle2 size={18} className="text-slate-400"/>}>
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  {renderInput("Assessment Date", form.signOff.date, (v) => setForm(prev => ({...prev, signOff: {...prev.signOff, date: v}})), "date")}
                  {renderInput("Authorized By", form.signOff.signed, (v) => setForm(prev => ({...prev, signOff: {...prev.signOff, signed: v}})), "text", "Manager Initials")}
               </div>

               <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">Classification</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(TradeType).map((type) => (
                      <label key={type} className="flex items-center gap-2 p-2.5 border border-slate-200 rounded-md hover:bg-slate-50 hover:border-blue-300 cursor-pointer transition-all">
                        <input 
                          type="radio" 
                          name="tradeType"
                          checked={form.signOff.type === type}
                          onChange={() => setForm(prev => ({...prev, signOff: {...prev.signOff, type}}))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-slate-800">{type}</span>
                      </label>
                    ))}
                  </div>
               </div>

               <div className="bg-green-50 p-5 rounded-lg border border-green-100 shadow-sm">
                  <label className="text-xs font-bold text-green-800 uppercase tracking-widest block mb-2">Net Trade-In Allowance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600 text-xl font-bold">$</span>
                    <input 
                      type="number" 
                      className="w-full pl-8 pr-4 py-3 bg-white border border-green-200 rounded-md text-2xl font-bold text-green-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-mono"
                      value={form.signOff.allowancePrice || ''}
                      onChange={(e) => setForm(prev => ({...prev, signOff: {...prev.signOff, allowancePrice: parseFloat(e.target.value)}}))}
                      placeholder="0.00"
                    />
                  </div>
               </div>
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}

export default App;