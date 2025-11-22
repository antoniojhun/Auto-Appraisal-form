import { VehicleDetails } from "../types";

// Simulated database for Australian Registration Lookups
// In a production environment, this would connect to a provider like NEVDIS via a commercial API.
export const lookupRegistration = async (state: string, rego: string): Promise<Partial<VehicleDetails> | null> => {
  
  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 1000));

  const normalizedRego = rego.replace(/\s/g, '').toUpperCase();
  const normalizedState = state.toUpperCase();

  // TEST CASE VALIDATION
  // Based on user provided reference data:
  // Rego: DMH427 (VIC) -> 2025 SUBARU WAGON GREEN
  if (normalizedRego === 'DMH427' && normalizedState === 'VIC') {
    return {
      make: 'SUBARU',
      model: 'OUTBACK', // "Wagon" is body type, usually implies Outback for this VIN prefix (JF2), mapped for better accuracy
      year: '2025',
      trim: 'WAGON', // User preference to see Body Type info here if Trim isn't explicit
      colour: 'GREEN',
      regNo: 'DMH427',
      chassisNo: 'JF2BT9KL3SG078266',
      engineNo: 'ZA63989',
      // Using Compliance/RAV entry date as the vehicle date
      date: '2025-06-01', 
    };
  }

  // Return null for unmatched records in this demo
  return null;
};