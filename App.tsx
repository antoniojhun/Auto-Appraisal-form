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
} from 'lucide-react';

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
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const result = await analyzeVehicleImage(base64);
      
      if (result) {
        setForm(prev => ({
          ...prev,
          vehicle: {
            ...prev.vehicle,
            ...result
          }
        }));
      }
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
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
    } finally {
      setIsDecoding(false);
    }
  };

  // --- Render Helpers ---

  const renderInput = (label: string, value: string, onChange: (val: string) => void, type = "text", placeholder = "") => (
    <div className="flex flex-col mb-3">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-2 bg-white border border-gray-300 rounded text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow w-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 pb-20 font-sans text-black">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="text-blue-400" size={28} />
            <h1 className="text-xl font-bold tracking-tight">AutoAppraise AI</h1>
          </div>
          <div className="flex items-center gap-2">
            <button 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
              onClick={() => alert("Appraisal Saved (Mock)")}
            >
              <Save size={16} />
              <span className="hidden sm:inline">Save Appraisal</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        
        {/* Top Grid: Customer & Vehicle */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <Section title="Customer Details" headerAction={<User size={18} className="text-gray-400"/>}>
            <div className="space-y-1">
              {renderInput("Name", form.customer.name, (v) => handleCustomerChange("name", v))}
              {renderInput("Address", form.customer.address, (v) => handleCustomerChange("address", v))}
              <div className="grid grid-cols-2 gap-4">
                {renderInput("Tel", form.customer.tel, (v) => handleCustomerChange("tel", v), "tel")}
                {renderInput("Email", form.customer.email, (v) => handleCustomerChange("email", v), "email")}
              </div>
            </div>
          </Section>

          <Section 
            title="Vehicle Details" 
            headerAction={
              <button 
                onClick={triggerFileInput}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 transition-colors border border-indigo-200"
              >
                {isAnalyzing ? <Loader2 className="animate-spin" size={14} /> : <Camera size={14} />}
                {isAnalyzing ? "Analyzing..." : "Scan Vehicle"}
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
                {renderInput("Registration No", form.vehicle.regNo, (v) => handleVehicleChange("regNo", v), "text", "e.g. DMH427")}

                <div className="flex flex-col">
                   <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">VIN / Chassis No</label>
                   <div className="flex gap-2">
                      <input 
                         className="flex-grow px-3 py-2 bg-white border border-gray-300 rounded text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                         value={form.vehicle.chassisNo}
                         onChange={(e) => handleVehicleChange("chassisNo", e.target.value)}
                         placeholder="Enter VIN..."
                      />
                      <button 
                         onClick={handleVinDecode}
                         disabled={isDecoding || !form.vehicle.chassisNo}
                         className="bg-gray-200 text-gray-800 px-4 py-2 rounded text-sm font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                      >
                         {isDecoding ? <Loader2 className="animate-spin" size={16}/> : <Wrench size={16}/>}
                         <span className="hidden sm:inline">Decode</span>
                      </button>
                   </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {renderInput("Make", form.vehicle.make, (v) => handleVehicleChange("make", v))}
              {renderInput("Model", form.vehicle.model, (v) => handleVehicleChange("model", v))}
              
              {/* New Fields */}
              {renderInput("Year", form.vehicle.year, (v) => handleVehicleChange("year", v))}
              {renderInput("Trim/Body", form.vehicle.trim, (v) => handleVehicleChange("trim", v))}
              
              {renderInput("Colour", form.vehicle.colour, (v) => handleVehicleChange("colour", v))}
              
              {renderInput("Engine No", form.vehicle.engineNo, (v) => handleVehicleChange("engineNo", v))}
              {renderInput("Mileage", form.vehicle.mileage, (v) => handleVehicleChange("mileage", v), "number")}
              {renderInput("Date (Comp/Reg)", form.vehicle.date, (v) => handleVehicleChange("date", v), "date")}
            </div>
          </Section>
        </div>

        {/* Bodywork Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Section title="Bodywork Appraisal" className="h-full" headerAction={<Car size={18} className="text-gray-400"/>}>
              <DamageMap 
                markers={form.damageMarkers} 
                onAddMarker={handleAddMarker} 
                onRemoveMarker={handleRemoveMarker} 
              />
            </Section>
          </div>
          <div className="lg:col-span-1">
             <Section title="General Appearance" className="h-full">
                <div className="flex flex-col h-full">
                  <div className="space-y-3 mb-6">
                    {['Excellent', 'Good', 'Average', 'Poor'].map((rating) => (
                      <label key={rating} className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200">
                        <input
                          type="radio"
                          name="general-rating"
                          checked={form.generalAppearance.rating === rating}
                          onChange={() => setForm(prev => ({...prev, generalAppearance: {...prev.generalAppearance, rating: rating as any}}))}
                          className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-black font-medium">{rating}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex-grow">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">General Comments</label>
                    <textarea
                      className="w-full h-32 p-3 bg-white border border-gray-300 rounded text-sm text-black placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Enter overall impressions..."
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
          <Section title="Interior Check" headerAction={<FileText size={18} className="text-gray-400"/>}>
            <ChecklistGroup 
              title="interior" 
              items={form.interior} 
              onChange={handleInteriorChange} 
            />
          </Section>
          
          <Section title="Mechanical" headerAction={<Wrench size={18} className="text-gray-400"/>}>
            <div className="mb-6 pb-4 border-b border-gray-100">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Transmission</label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.mechanicalExtras.gearbox === Transmission.AUTO}
                    onChange={() => setForm(prev => ({...prev, mechanicalExtras: {...prev.mechanicalExtras, gearbox: Transmission.AUTO}}))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-black">Auto</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.mechanicalExtras.gearbox === Transmission.MANUAL}
                    onChange={() => setForm(prev => ({...prev, mechanicalExtras: {...prev.mechanicalExtras, gearbox: Transmission.MANUAL}}))}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-black">Manual</span>
                </label>
              </div>
            </div>

            <ChecklistGroup 
              title="mechanical" 
              items={form.mechanical} 
              onChange={handleMechanicalChange} 
            />
            
            <div className="mt-4 space-y-3 pt-4 border-t border-gray-100">
               {renderInput("Other Mechanical", form.mechanicalExtras.other, (v) => setForm(prev => ({...prev, mechanicalExtras: {...prev.mechanicalExtras, other: v}})))}
               {renderInput("Road Test Notes", form.mechanicalExtras.roadTest, (v) => setForm(prev => ({...prev, mechanicalExtras: {...prev.mechanicalExtras, roadTest: v}})))}
               
               <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">Service Record</label>
                <div className="flex gap-4">
                  {['Complete', 'Part', 'None'].map((rec) => (
                     <label key={rec} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="serviceRecord"
                        checked={form.mechanicalExtras.serviceRecord === rec}
                        onChange={() => setForm(prev => ({...prev, mechanicalExtras: {...prev.mechanicalExtras, serviceRecord: rec as any}}))}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-black">{rec}</span>
                   </label>
                  ))}
                </div>
               </div>
            </div>
          </Section>
        </div>

        {/* Costing & Signoff */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Required Repairs / Replacements" headerAction={<Banknote size={18} className="text-gray-400"/>}>
            <div className="space-y-3">
              <div className="grid grid-cols-12 gap-4 text-xs font-semibold text-gray-600 uppercase mb-1 px-1">
                <div className="col-span-8">Item Description</div>
                <div className="col-span-4 text-right">Cost ($)</div>
              </div>
              
              {form.repairs.map((repair, index) => (
                <div key={repair.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-8">
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Description..."
                      value={repair.description}
                      onChange={(e) => handleRepairChange(index, 'description', e.target.value)}
                    />
                  </div>
                  <div className="col-span-4">
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-sm text-black placeholder-gray-400 text-right focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="0.00"
                      value={repair.cost || ''}
                      onChange={(e) => handleRepairChange(index, 'cost', parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              ))}

              <button 
                onClick={addNewRepairRow}
                className="text-xs text-blue-600 font-medium hover:underline mt-2 flex items-center gap-1"
              >
                + Add Row
              </button>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-700">Total Estimated Cost</span>
                <span className="text-xl font-bold text-black">${calculateTotalRepairs().toFixed(2)}</span>
              </div>
            </div>
          </Section>

          <Section title="Appraisal Sign-off" headerAction={<CheckCircle2 size={18} className="text-gray-400"/>}>
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  {renderInput("Date of Appraisal", form.signOff.date, (v) => setForm(prev => ({...prev, signOff: {...prev.signOff, date: v}})), "date")}
                  {renderInput("Signed By", form.signOff.signed, (v) => setForm(prev => ({...prev, signOff: {...prev.signOff, signed: v}})))}
               </div>

               <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-2">Transaction Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.values(TradeType).map((type) => (
                      <label key={type} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer transition-colors">
                        <input 
                          type="radio" 
                          name="tradeType"
                          checked={form.signOff.type === type}
                          onChange={() => setForm(prev => ({...prev, signOff: {...prev.signOff, type}}))}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-black">{type}</span>
                      </label>
                    ))}
                  </div>
               </div>

               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <label className="text-sm font-bold text-blue-800 uppercase tracking-wide block mb-1">Final Allowance Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-lg font-semibold">$</span>
                    <input 
                      type="number" 
                      className="w-full pl-8 pr-4 py-3 bg-white border border-blue-200 rounded-md text-xl font-bold text-black focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      value={form.signOff.allowancePrice || ''}
                      onChange={(e) => setForm(prev => ({...prev, signOff: {...prev.signOff, allowancePrice: parseFloat(e.target.value)}}))}
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