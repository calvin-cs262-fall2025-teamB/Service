/**
 * Comprehensive Input Validation Test Suite
 * 
 * This script tests all validation schemas implemented in the WayFind API
 * to ensure proper input sanitization and validation.
 * 
 * Run: node input-validation-test.js
 */

const baseURL = 'http://localhost:3000';

async function testValidation() {
    console.log('🧪 Starting Input Validation Tests\n');

    // Test 1: Authentication validation
    console.log('📝 Testing Authentication Validation...');
    
    // Invalid username (too short)
    console.log('\n1.1 Testing invalid username (too short):');
    await testEndpoint('POST', '/adventurers', {
        username: 'ab',
        email: 'test@example.com',
        password: 'ValidPass123!'
    }, 'Should reject username less than 3 characters');

    // Invalid username (special characters)
    console.log('\n1.2 Testing invalid username (special characters):');
    await testEndpoint('POST', '/adventurers', {
        username: 'test@user',
        email: 'test@example.com',
        password: 'ValidPass123!'
    }, 'Should reject username with special characters');

    // Invalid email
    console.log('\n1.3 Testing invalid email:');
    await testEndpoint('POST', '/adventurers', {
        username: 'testuser',
        email: 'invalid-email',
        password: 'ValidPass123!'
    }, 'Should reject invalid email format');

    // Weak password
    console.log('\n1.4 Testing weak password:');
    await testEndpoint('POST', '/adventurers', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'weak'
    }, 'Should reject weak password');

    // Valid registration
    console.log('\n1.5 Testing valid registration:');
    await testEndpoint('POST', '/adventurers', {
        username: 'validuser123',
        email: 'valid@example.com',
        password: 'ValidPass123!',
        firstName: 'John',
        lastName: 'Doe'
    }, 'Should accept valid registration');

    // Test 2: Login validation
    console.log('\n📝 Testing Login Validation...');
    
    // Empty username
    console.log('\n2.1 Testing empty username:');
    await testEndpoint('POST', '/auth/login', {
        username: '',
        password: 'password123'
    }, 'Should reject empty username');

    // Empty password
    console.log('\n2.2 Testing empty password:');
    await testEndpoint('POST', '/auth/login', {
        username: 'testuser',
        password: ''
    }, 'Should reject empty password');

    // Test 3: Adventure validation
    console.log('\n📝 Testing Adventure Validation...');
    
    // Invalid difficulty
    console.log('\n3.1 Testing invalid difficulty:');
    await testEndpoint('POST', '/adventures', {
        name: 'Test Adventure',
        difficulty: 'Invalid',
        description: 'A test adventure'
    }, 'Should reject invalid difficulty level');

    // Name too long
    console.log('\n3.2 Testing adventure name too long:');
    await testEndpoint('POST', '/adventures', {
        name: 'A'.repeat(201), // 201 characters
        difficulty: 'Easy',
        description: 'A test adventure'
    }, 'Should reject adventure name over 200 characters');

    // Invalid estimated duration
    console.log('\n3.3 Testing invalid estimated duration:');
    await testEndpoint('POST', '/adventures', {
        name: 'Test Adventure',
        difficulty: 'Easy',
        estimatedDuration: 2000 // Over 1440 minutes (24 hours)
    }, 'Should reject duration over 1440 minutes');

    // Valid adventure
    console.log('\n3.4 Testing valid adventure:');
    await testEndpoint('POST', '/adventures', {
        name: 'Valid Test Adventure',
        difficulty: 'Medium',
        description: 'A properly formatted test adventure',
        estimatedDuration: 120,
        tags: ['outdoor', 'hiking']
    }, 'Should accept valid adventure');

    // Test 4: Region validation
    console.log('\n📝 Testing Region Validation...');
    
    // Invalid latitude
    console.log('\n4.1 Testing invalid latitude:');
    await testEndpoint('POST', '/regions', {
        adventureId: 1,
        name: 'Test Region',
        latitude: 91, // Invalid latitude > 90
        longitude: 0
    }, 'Should reject latitude over 90 degrees');

    // Invalid longitude
    console.log('\n4.2 Testing invalid longitude:');
    await testEndpoint('POST', '/regions', {
        adventureId: 1,
        name: 'Test Region',
        latitude: 45,
        longitude: 181 // Invalid longitude > 180
    }, 'Should reject longitude over 180 degrees');

    // Invalid adventure ID
    console.log('\n4.3 Testing invalid adventure ID:');
    await testEndpoint('POST', '/regions', {
        adventureId: -1, // Negative ID
        name: 'Test Region',
        latitude: 45,
        longitude: 0
    }, 'Should reject negative adventure ID');

    // Valid region
    console.log('\n4.4 Testing valid region:');
    await testEndpoint('POST', '/regions', {
        adventureId: 1,
        name: 'Valid Test Region',
        description: 'A properly formatted test region',
        latitude: 42.3601,
        longitude: -71.0589,
        radius: 100,
        difficulty: 'Easy',
        points: 50
    }, 'Should accept valid region');

    // Test 5: Parameter validation
    console.log('\n📝 Testing Parameter Validation...');
    
    // Invalid ID parameter
    console.log('\n5.1 Testing invalid ID parameter:');
    await testEndpoint('GET', '/adventurer/abc', null, 'Should reject non-numeric ID');

    // Negative ID parameter
    console.log('\n5.2 Testing negative ID parameter:');
    await testEndpoint('GET', '/adventurer/-1', null, 'Should reject negative ID');

    // Test 6: SQL Injection attempts
    console.log('\n📝 Testing SQL Injection Protection...');
    
    // SQL injection in username
    console.log('\n6.1 Testing SQL injection in username:');
    await testEndpoint('POST', '/auth/login', {
        username: "admin'; DROP TABLE adventurers; --",
        password: 'password'
    }, 'Should sanitize SQL injection attempt');

    // SQL injection in adventure name
    console.log('\n6.2 Testing SQL injection in adventure name:');
    await testEndpoint('POST', '/adventures', {
        name: "Test'; DELETE FROM adventures; --",
        difficulty: 'Easy'
    }, 'Should sanitize SQL injection attempt in adventure name');

    // Test 7: XSS attempts
    console.log('\n📝 Testing XSS Protection...');
    
    // Script tag in description
    console.log('\n7.1 Testing script tag in description:');
    await testEndpoint('POST', '/adventures', {
        name: 'Test Adventure',
        description: '<script>alert("XSS")</script>',
        difficulty: 'Easy'
    }, 'Should sanitize script tags');

    // HTML in region name
    console.log('\n7.2 Testing HTML in region name:');
    await testEndpoint('POST', '/regions', {
        adventureId: 1,
        name: '<img src=x onerror=alert("XSS")>',
        latitude: 45,
        longitude: 0
    }, 'Should sanitize HTML injection');

    console.log('\n✅ Input Validation Tests Complete!');
}

async function testEndpoint(method, endpoint, body, expectation) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${baseURL}${endpoint}`, options);
        const result = await response.text();
        
        let responseData;
        try {
            responseData = JSON.parse(result);
        } catch (e) {
            responseData = { message: result };
        }

        const statusCode = response.status;
        
        console.log(`   Status: ${statusCode}`);
        
        if (statusCode === 400) {
            console.log(`   ✅ Validation working: ${responseData.error}`);
            if (responseData.details) {
                responseData.details.forEach(detail => {
                    console.log(`      - Field: ${detail.field}, Error: ${detail.message}`);
                });
            }
        } else if (statusCode === 429) {
            console.log(`   ⚠️  Rate limited: ${responseData.error}`);
        } else if (statusCode === 201 || statusCode === 200) {
            console.log(`   ✅ Request accepted (validation passed)`);
        } else if (statusCode === 401) {
            console.log(`   ⚠️  Authentication required: ${responseData.error}`);
        } else {
            console.log(`   ⚠️  Unexpected response: ${responseData.message || responseData.error}`);
        }
        
        console.log(`   Expected: ${expectation}`);

    } catch (error) {
        console.log(`   ❌ Error testing endpoint: ${error.message}`);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('   💡 Make sure the server is running on port 3000');
        }
    }
}

// Additional validation test for edge cases
async function testEdgeCases() {
    console.log('\n🔍 Testing Edge Cases...');
    
    // Very long string attacks
    console.log('\n8.1 Testing very long string attack:');
    const longString = 'A'.repeat(10000);
    await testEndpoint('POST', '/adventurers', {
        username: longString,
        email: 'test@example.com',
        password: 'ValidPass123!'
    }, 'Should reject extremely long username');

    // Unicode injection attempts
    console.log('\n8.2 Testing unicode injection:');
    await testEndpoint('POST', '/adventures', {
        name: 'Test\u0000Adventure',
        difficulty: 'Easy'
    }, 'Should handle null bytes properly');

    // Integer overflow attempts
    console.log('\n8.3 Testing integer overflow:');
    await testEndpoint('POST', '/regions', {
        adventureId: 999999999999999999,
        name: 'Test Region',
        latitude: 45,
        longitude: 0
    }, 'Should handle large integers properly');

    console.log('\n✅ Edge Case Tests Complete!');
}

// Run all tests
async function runAllTests() {
    try {
        await testValidation();
        await testEdgeCases();
    } catch (error) {
        console.error('❌ Test suite failed:', error.message);
    }
}

runAllTests();