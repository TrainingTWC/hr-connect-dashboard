// Updated stores from HR mapping data

// Fallback stores for when mapping data is not available
const FALLBACK_STORES = [
  { name: 'Defence Colony', id: 'S027', region: 'North' },
  { name: 'Khan Market', id: 'S037', region: 'North' },
  { name: 'Connaught Place', id: 'S049', region: 'North' },
  { name: 'Kalkaji', id: 'S055', region: 'North' },
  { name: 'Sector 07', id: 'S039', region: 'North' },
  { name: 'Sector 35', id: 'S042', region: 'North' },
  { name: 'Panchkula', id: 'S062', region: 'North' },
  { name: 'Jubilee Walk Mohali', id: 'S122', region: 'North' },
  { name: 'Deer Park', id: 'S024', region: 'North' },
  { name: 'GK 1', id: 'S035', region: 'North' },
  { name: 'Kailash Colony', id: 'S072', region: 'North' },
  { name: 'Saket', id: 'S028', region: 'North' },
  { name: 'Vatika Business Park', id: 'S038', region: 'North' },
  { name: 'Golf Course', id: 'S073', region: 'North' },
  { name: 'Hauz Khas', id: 'S113', region: 'North' },
  { name: 'Janakpuri', id: 'S120', region: 'North' },
  { name: 'Green Park', id: 'S142', region: 'North' },
  { name: 'Paschim Vihar', id: 'S141', region: 'North' }
];

// Create stores array from the mapping data
const createStoresFromMapping = async () => {
  try {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const response = await fetch(`${base}hr_mapping.json`);
    const hrMappingData = await response.json();
    
    const storeMap = new Map();
    
    hrMappingData.forEach((item: any) => {
      if (!storeMap.has(item.storeId)) {
        storeMap.set(item.storeId, {
          name: item.locationName,
          id: item.storeId,
          region: item.region
        });
      }
    });
    
    return Array.from(storeMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));
  } catch (error) {
    console.warn('Could not load mapping data, using fallback stores');
    return FALLBACK_STORES;
  }
};

// Initialize with fallback stores
let MAPPED_STORES = FALLBACK_STORES;

// Load mapping data and update stores
createStoresFromMapping().then(stores => {
  MAPPED_STORES = stores;
  console.log(`Loaded ${stores.length} stores from mapping data`);
}).catch(() => {
  console.warn('Using fallback stores');
});

export { MAPPED_STORES };