// Role-based access mapping for HR Connect Dashboard

// Name mapping for all user IDs
const USER_NAMES: { [key: string]: string } = {
  'H1766': 'Vishu Kumar',
  'H2396': 'Atul Inderyas',
  'H535': 'Amar Debnath',
  'H955': 'Himanshu Chaudhary',
  'H546': 'Ajay Hatimuria',
  'H3362': 'Karthick G',
  'H833': 'Nandish M',
  'H1355': 'Suresh A',
  'H2155': 'Jagruti Narendra Bhanushali',
  'H2601': 'Kiran Kumar KN',
  'H3270': 'Gorijala Umakanth',
  'H1575': 'Vruchika Prathamesh Nanavare',
  'H2908': 'Shailesh Ramhari Sahu',
  'H2273': 'Sanjay Madhukar Jadhav',
  'H3386': 'Abhishek Vilas Satardekar',
  'H2758': 'Rutuja Shirish Gaikwad',
  'H2262': 'Anil Rawat',
  'H3578': 'Abhishek Singh',
  'H2165': 'Monica Kithodya',
  'H2761': 'Subin K',
  'H1972': 'Swati Raju Shetti',
  'H3603': 'Manasi Jagdish Sawant',
  'H3247': 'Thatikonda Sunil Kumar',
  'H2081': 'Swapna Sarit Padhi',
  'H541': 'Amritanshu Prasad'
};

// Helper function to get user name
const getUserName = (userId: string): string => {
  return USER_NAMES[userId] || `User ${userId}`;
};

export interface UserRole {
  userId: string;
  name: string;
  role: 'admin' | 'area_manager' | 'hrbp' | 'regional_hr' | 'hr_head' | 'lms_head';
  allowedStores: string[]; // Store IDs they can access
  allowedAMs: string[]; // Area Manager IDs they can see
  allowedHRs: string[]; // HR Personnel IDs they can see
  region?: string; // If restricted to specific region
}

// Load mapping data dynamically
const loadMappingData = async (): Promise<any[]> => {
  try {
    const response = await fetch('/hr_mapping.json');
    return await response.json();
  } catch (error) {
    console.warn('Could not load HR mapping data, using fallback');
    return [];
  }
};

// Create role mappings from the JSON data
const createRoleMappings = (hrMappingData: any[]): UserRole[] => {
  const mappings: UserRole[] = [];
  
  // Admin users - can see everything
  mappings.push({
    userId: 'admin001',
    name: 'System Admin',
    role: 'admin',
    allowedStores: [],
    allowedAMs: [],
    allowedHRs: []
  });

  // Super Admin users with proper names
  mappings.push({
    userId: 'H541',
    name: 'Amritanshu Prasad',
    role: 'admin',
    allowedStores: [],
    allowedAMs: [],
    allowedHRs: []
  });

  mappings.push({
    userId: 'H2081',
    name: 'Swapna Sarit Padhi',
    role: 'admin',
    allowedStores: [],
    allowedAMs: [],
    allowedHRs: []
  });

  mappings.push({
    userId: 'H3237',
    name: getUserName('H3237'),
    role: 'admin',
    allowedStores: [],
    allowedAMs: [],
    allowedHRs: []
  });

  if (!hrMappingData || hrMappingData.length === 0) {
    // Fallback roles for testing
    mappings.push({
      userId: 'H1766',
      name: getUserName('H1766'),
      role: 'area_manager',
      allowedStores: ['S027', 'S037', 'S049', 'S055'],
      allowedAMs: ['H1766'],
      allowedHRs: ['H3578'],
      region: 'North'
    });
    
    mappings.push({
      userId: 'H3578',
      name: getUserName('H3578'),
      role: 'hrbp',
      allowedStores: ['S027', 'S037', 'S049', 'S055', 'S039', 'S042'],
      allowedAMs: ['H1766', 'H2396'],
      allowedHRs: ['H3578'],
      region: 'North'
    });
    
    return mappings;
  }

  // Create sets to avoid duplicates
  const areaManagers = new Set<string>();
  const hrbps = new Set<string>();
  const regionalHrs = new Set<string>();
  const hrHeads = new Set<string>();
  const lmsHeads = new Set<string>();

  // Group data by roles
  const amStores: { [key: string]: string[] } = {};
  const amRegions: { [key: string]: string } = {};
  const hrbpStores: { [key: string]: string[] } = {};
  const hrbpAMs: { [key: string]: string[] } = {};
  const hrbpRegions: { [key: string]: string } = {};
  const regionalHrStores: { [key: string]: string[] } = {};
  const regionalHrAMs: { [key: string]: string[] } = {};
  const regionalHrHRBPs: { [key: string]: string[] } = {};
  const regionalHrRegions: { [key: string]: string } = {};

  hrMappingData.forEach((item: any) => {
    const { storeId, areaManagerId, hrbpId, regionalHrId, hrHeadId, lmsHeadId, region } = item;

    // Collect unique IDs
    if (areaManagerId) areaManagers.add(areaManagerId);
    if (hrbpId) hrbps.add(hrbpId);
    if (regionalHrId) regionalHrs.add(regionalHrId);
    if (hrHeadId) hrHeads.add(hrHeadId);
    if (lmsHeadId) lmsHeads.add(lmsHeadId);

    // Area Manager mappings
    if (areaManagerId) {
      if (!amStores[areaManagerId]) amStores[areaManagerId] = [];
      amStores[areaManagerId].push(storeId);
      amRegions[areaManagerId] = region;
    }

    // HRBP mappings
    if (hrbpId) {
      if (!hrbpStores[hrbpId]) hrbpStores[hrbpId] = [];
      if (!hrbpAMs[hrbpId]) hrbpAMs[hrbpId] = [];
      hrbpStores[hrbpId].push(storeId);
      if (areaManagerId && !hrbpAMs[hrbpId].includes(areaManagerId)) {
        hrbpAMs[hrbpId].push(areaManagerId);
      }
      hrbpRegions[hrbpId] = region;
    }

    // Regional HR mappings
    if (regionalHrId) {
      if (!regionalHrStores[regionalHrId]) regionalHrStores[regionalHrId] = [];
      if (!regionalHrAMs[regionalHrId]) regionalHrAMs[regionalHrId] = [];
      if (!regionalHrHRBPs[regionalHrId]) regionalHrHRBPs[regionalHrId] = [];
      
      regionalHrStores[regionalHrId].push(storeId);
      if (areaManagerId && !regionalHrAMs[regionalHrId].includes(areaManagerId)) {
        regionalHrAMs[regionalHrId].push(areaManagerId);
      }
      if (hrbpId && !regionalHrHRBPs[regionalHrId].includes(hrbpId)) {
        regionalHrHRBPs[regionalHrId].push(hrbpId);
      }
      regionalHrRegions[regionalHrId] = region;
    }
  });

  // Create Area Manager roles
  areaManagers.forEach(amId => {
    mappings.push({
      userId: amId,
      name: getUserName(amId),
      role: 'area_manager',
      allowedStores: amStores[amId] || [],
      allowedAMs: [amId], // Can only see themselves
      allowedHRs: [], // Will be filled based on HRBP relationships
      region: amRegions[amId]
    });
  });

  // Create HRBP roles
  hrbps.forEach(hrbpId => {
    mappings.push({
      userId: hrbpId,
      name: getUserName(hrbpId),
      role: 'hrbp',
      allowedStores: hrbpStores[hrbpId] || [],
      allowedAMs: hrbpAMs[hrbpId] || [],
      allowedHRs: [hrbpId],
      region: hrbpRegions[hrbpId]
    });
  });

  // Create Regional HR roles
  regionalHrs.forEach(regionalHrId => {
    const allHRs = [regionalHrId, ...(regionalHrHRBPs[regionalHrId] || [])];
    mappings.push({
      userId: regionalHrId,
      name: getUserName(regionalHrId),
      role: 'regional_hr',
      allowedStores: regionalHrStores[regionalHrId] || [],
      allowedAMs: regionalHrAMs[regionalHrId] || [],
      allowedHRs: allHRs,
      region: regionalHrRegions[regionalHrId]
    });
  });

  // Create HR Head roles
  hrHeads.forEach(hrHeadId => {
    mappings.push({
      userId: hrHeadId,
      name: getUserName(hrHeadId),
      role: 'hr_head',
      allowedStores: [], // Can see all stores
      allowedAMs: [], // Can see all AMs
      allowedHRs: [] // Can see all HR personnel
    });
  });

  // Create LMS Head roles
  lmsHeads.forEach(lmsHeadId => {
    mappings.push({
      userId: lmsHeadId,
      name: getUserName(lmsHeadId),
      role: 'lms_head',
      allowedStores: [], // Can see all stores
      allowedAMs: [], // Can see all AMs
      allowedHRs: [] // Can see all HR personnel
    });
  });

  return mappings;
};

// Initialize with super admin users immediately
let ROLE_MAPPINGS: UserRole[] = [
  {
    userId: 'admin001',
    name: 'System Admin',
    role: 'admin',
    allowedStores: [],
    allowedAMs: [],
    allowedHRs: []
  },
  {
    userId: 'H541',
    name: 'H541 - Super Admin',
    role: 'admin',
    allowedStores: [],
    allowedAMs: [],
    allowedHRs: []
  },
  {
    userId: 'H2081',
    name: 'H2081 - Super Admin',
    role: 'admin',
    allowedStores: [],
    allowedAMs: [],
    allowedHRs: []
  },
  {
    userId: 'H3237',
    name: 'H3237 - Super Admin',
    role: 'admin',
    allowedStores: [],
    allowedAMs: [],
    allowedHRs: []
  }
];

// Load mapping data and update roles, but keep super admins
loadMappingData().then(data => {
  const allMappings = createRoleMappings(data);
  ROLE_MAPPINGS = allMappings;
  console.log(`Loaded ${ROLE_MAPPINGS.length} role mappings including super admins`);
}).catch(error => {
  console.warn('Using fallback role mappings with super admins only');
  // Keep the initial super admin mappings if loading fails
});

export const getUserRole = (userId: string): UserRole | null => {
  console.log(`Looking for user: ${userId}, Available roles:`, ROLE_MAPPINGS.map(r => r.userId));
  const role = ROLE_MAPPINGS.find(role => role.userId === userId) || null;
  console.log(`Found role for ${userId}:`, role);
  return role;
};

export const canAccessStore = (userRole: UserRole, storeId: string): boolean => {
  // Admin users can access everything
  if (userRole.role === 'admin') return true;
  // If allowedStores is empty, user can access all stores (hr_head, lms_head)
  if (userRole.allowedStores.length === 0) return true;
  return userRole.allowedStores.includes(storeId);
};

export const canAccessAM = (userRole: UserRole, amId: string): boolean => {
  // Admin users can access everything
  if (userRole.role === 'admin') return true;
  // If allowedAMs is empty, user can access all AMs (hr_head, lms_head)
  if (userRole.allowedAMs.length === 0) return true;
  return userRole.allowedAMs.includes(amId);
};

export const canAccessHR = (userRole: UserRole, hrId: string): boolean => {
  // Admin users can access everything
  if (userRole.role === 'admin') return true;
  // If allowedHRs is empty, user can access all HR personnel (hr_head, lms_head)
  if (userRole.allowedHRs.length === 0) return true;
  return userRole.allowedHRs.includes(hrId);
};

// Export getUserName function for use in other components
export { getUserName };