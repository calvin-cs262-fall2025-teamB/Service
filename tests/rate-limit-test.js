/**
 * Rate Limiting Test for Authentication Endpoints
 * 
 * This test verifies that rate limiting is working correctly on authentication endpoints.
 * It will attempt to make multiple login requests to trigger rate limiting.
 */

const BASE_URL = 'http://localhost:3000';

async function testRateLimiting() {
    console.log('🛡️  Testing Rate Limiting for Authentication Endpoints');
    console.log('=====================================================');

    try {
        // Test 1: Make multiple rapid login attempts to trigger rate limiting
        console.log('\n1. Testing authentication rate limiting (5 requests in 15 minutes)...');
        
        const promises = [];
        for (let i = 0; i < 7; i++) {
            promises.push(
                fetch(`${BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'invaliduser' + i,
                        password: 'invalidpass' + i
                    }),
                })
            );
        }

        const responses = await Promise.all(promises);
        
        let successCount = 0;
        let rateLimitedCount = 0;
        let otherErrorCount = 0;

        for (let i = 0; i < responses.length; i++) {
            const response = responses[i];
            console.log(`   Request ${i + 1}: Status ${response.status}`);
            
            if (response.status === 429) {
                rateLimitedCount++;
                const data = await response.json();
                console.log(`     ⛔ Rate limited: ${data.error}`);
                console.log(`     🕐 Retry after: ${data.retryAfter}`);
                
                // Check for proper rate limiting headers
                const rateLimitRemaining = response.headers.get('RateLimit-Remaining');
                const rateLimitReset = response.headers.get('RateLimit-Reset');
                console.log(`     📊 Headers - Remaining: ${rateLimitRemaining}, Reset: ${rateLimitReset}`);
            } else if (response.status === 401) {
                successCount++;
                console.log(`     ✅ Normal authentication failure (not rate limited)`);
            } else {
                otherErrorCount++;
                console.log(`     ❓ Other response: ${response.status}`);
            }
        }

        console.log(`\n📊 Rate Limiting Test Results:`);
        console.log(`   - Successful auth attempts: ${successCount}`);
        console.log(`   - Rate limited responses: ${rateLimitedCount}`);
        console.log(`   - Other errors: ${otherErrorCount}`);
        
        if (rateLimitedCount > 0) {
            console.log(`   ✅ Rate limiting is WORKING! (${rateLimitedCount} requests blocked)`);
        } else {
            console.log(`   ❌ Rate limiting may not be working properly`);
        }

        // Test 2: Test general API rate limiting
        console.log('\n2. Testing general API rate limiting (100 requests in 15 minutes)...');
        
        const generalPromises = [];
        for (let i = 0; i < 15; i++) {
            generalPromises.push(
                fetch(`${BASE_URL}/`, {
                    method: 'GET',
                })
            );
        }

        const generalResponses = await Promise.all(generalPromises);
        let generalSuccess = 0;
        let generalRateLimited = 0;

        for (let i = 0; i < generalResponses.length; i++) {
            const response = generalResponses[i];
            if (response.status === 429) {
                generalRateLimited++;
            } else if (response.ok) {
                generalSuccess++;
            }
        }

        console.log(`   - Successful requests: ${generalSuccess}`);
        console.log(`   - Rate limited requests: ${generalRateLimited}`);

        if (generalSuccess > 10 && generalRateLimited === 0) {
            console.log(`   ✅ General rate limiting allows normal traffic`);
        } else {
            console.log(`   ⚠️  General rate limiting may be too restrictive`);
        }

        // Test 3: Test user creation rate limiting
        console.log('\n3. Testing user creation rate limiting...');
        
        const createPromises = [];
        for (let i = 0; i < 6; i++) {
            createPromises.push(
                fetch(`${BASE_URL}/adventurers`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'testuser' + Date.now() + i,
                        password: 'testpass123',
                        profilepicture: null
                    }),
                })
            );
        }

        const createResponses = await Promise.all(createPromises);
        let createSuccess = 0;
        let createRateLimited = 0;

        for (let i = 0; i < createResponses.length; i++) {
            const response = createResponses[i];
            console.log(`   Request ${i + 1}: Status ${response.status}`);
            
            if (response.status === 429) {
                createRateLimited++;
            } else if (response.ok) {
                createSuccess++;
            }
        }

        console.log(`   - Successful creations: ${createSuccess}`);
        console.log(`   - Rate limited creations: ${createRateLimited}`);

        if (createRateLimited > 0) {
            console.log(`   ✅ User creation rate limiting is working`);
        } else {
            console.log(`   ⚠️  All user creation attempts were processed (may need stricter limits)`);
        }

        console.log('\n🎉 Rate Limiting Test Complete!');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testRateLimiting();