// Test script to verify super admin access
import { getUserRole, canAccessStore, canAccessAM, canAccessHR } from './roleMapping.js';

console.log('=== SUPER ADMIN ACCESS TEST ===');

const testUsers = ['H541', 'H2081', 'H3237'];
const testStores = ['S001', 'S153', 'S195', 'S999'];
const testAMs = ['H1766', 'H2396', 'H999'];
const testHRs = ['H3578', 'H2165', 'H999'];

testUsers.forEach(userId => {
    console.log(`\n--- Testing User: ${userId} ---`);
    const role = getUserRole(userId);
    
    if (!role) {
        console.log(`❌ No role found for ${userId}`);
        return;
    }
    
    console.log(`✅ Role found: ${role.name} (${role.role})`);
    console.log(`Region restriction: ${role.region || 'NONE (can see all)'}`)
    
    // Test store access
    const storeTests = testStores.map(storeId => ({
        storeId,
        canAccess: canAccessStore(role, storeId)
    }));
    console.log('Store Access:', storeTests);
    
    // Test AM access
    const amTests = testAMs.map(amId => ({
        amId,
        canAccess: canAccessAM(role, amId)
    }));
    console.log('AM Access:', amTests);
    
    // Test HR access
    const hrTests = testHRs.map(hrId => ({
        hrId,
        canAccess: canAccessHR(role, hrId)
    }));
    console.log('HR Access:', hrTests);
});

console.log('\n=== Expected Result: All super admins should have TRUE for all access tests ===');