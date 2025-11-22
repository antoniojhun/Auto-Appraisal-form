export enum DamageType {
  SCRATCH = 'Scratch',
  STONE_CHIP = 'Stone Chip',
  DENT = 'Dent',
  RUST = 'Rust',
}

export enum Condition {
  GOOD = 'Good',
  AVERAGE = 'Average',
  POOR = 'Poor',
  NONE = 'None' // For when not applicable or not checked
}

export enum Transmission {
  AUTO = 'Auto',
  MANUAL = 'Manual',
}

export enum TradeType {
  TRADE = 'Trade',
  RETAIL = 'Retail',
  BUYING_IN = 'Buying In',
  PART_EXCHANGE = 'Part Exchange'
}

export interface DamageMarker {
  id: string;
  x: number;
  y: number;
  type: DamageType;
}

export interface CustomerDetails {
  name: string;
  address: string;
  tel: string;
  email: string;
}

export interface VehicleDetails {
  make: string;
  model: string;
  year: string;
  trim: string;
  colour: string;
  regNo: string;
  chassisNo: string;
  engineNo: string;
  mileage: string;
  date: string;
}

export interface ChecklistItem {
  name: string;
  condition: Condition;
}

export interface RepairItem {
  id: string;
  description: string;
  cost: number;
}

export interface AppraisalState {
  customer: CustomerDetails;
  vehicle: VehicleDetails;
  damageMarkers: DamageMarker[];
  generalAppearance: {
    rating: 'Excellent' | 'Good' | 'Average' | 'Poor' | null;
    comments: string;
  };
  interior: Record<string, Condition>;
  mechanical: Record<string, Condition>;
  mechanicalExtras: {
    gearbox: Transmission | null;
    other: string;
    roadTest: string;
    serviceRecord: 'Complete' | 'Part' | 'None' | null;
  };
  repairs: RepairItem[];
  signOff: {
    date: string;
    signed: string; // Name or text representation of signature
    type: TradeType | null;
    allowancePrice: number;
  };
}

export const INITIAL_STATE: AppraisalState = {
  customer: { name: '', address: '', tel: '', email: '' },
  vehicle: { make: '', model: '', year: '', trim: '', colour: '', regNo: '', chassisNo: '', engineNo: '', mileage: '', date: new Date().toISOString().split('T')[0] },
  damageMarkers: [],
  generalAppearance: { rating: null, comments: '' },
  interior: {
    'Seats': Condition.NONE,
    'Seat Belts': Condition.NONE,
    'Carpets': Condition.NONE,
    'Door Trims': Condition.NONE,
    'Glovebox/Ashtray': Condition.NONE,
    'Sun Visors': Condition.NONE,
    'Sunroof': Condition.NONE,
    'Air Conditioning': Condition.NONE,
    'Electric Windows': Condition.NONE,
    'Central Locking': Condition.NONE,
    'Radio/Stereo': Condition.NONE,
    'Sat Nav': Condition.NONE,
    'Other': Condition.NONE,
  },
  mechanical: {
    'Engine': Condition.NONE,
    'Rear Axle': Condition.NONE,
    'Drive Shafts': Condition.NONE,
    'Steering': Condition.NONE,
    'Brakes': Condition.NONE,
    'Exhaust': Condition.NONE,
    'Lights': Condition.NONE,
    'Battery': Condition.NONE,
  },
  mechanicalExtras: {
    gearbox: null,
    other: '',
    roadTest: '',
    serviceRecord: null,
  },
  repairs: [
    { id: '1', description: '', cost: 0 },
    { id: '2', description: '', cost: 0 },
    { id: '3', description: '', cost: 0 },
  ],
  signOff: {
    date: new Date().toISOString().split('T')[0],
    signed: '',
    type: null,
    allowancePrice: 0,
  },
};