/**
 * Advanced Security Validation Test Suite
 * 
 * Tests advanced security features including:
 * - Request size limiting
 * - Malicious pattern detection  
 * - Deep sanitization
 * - Prototype pollution protection
 * 
 * Run: node advanced-security-test.js
 */

const baseURL = 'http://localhost:3000';

async function testAdvancedSecurity() {
    console.log('🛡️  Starting Advanced Security Tests\n');

    // Test 1: Request Size Limiting
    console.log('📏 Testing Request Size Limiting...');
    
    console.log('\n1.1 Testing oversized request:');
    const largePayload = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'ValidPass123!',
        description: 'A'.repeat(11 * 1024 * 1024) // 11MB payload
    };
    
    await testEndpoint('POST', '/adventurers', largePayload, 
        'Should reject requests over 10MB');

    // Test 2: Malicious User-Agent Detection
    console.log('\n🕷️  Testing Malicious User-Agent Detection...');
    
    const maliciousUserAgents = [
        'sqlmap/1.0',
        'Nmap Scripting Engine',
        'Mozilla/5.0 Nikto/2.1.6',
        'Burp Suite Professional',
        '<script>alert(XSS)</script>',
        'javascript:void(0)'
    ];

    for (const [index, userAgent] of maliciousUserAgents.entries()) {
        console.log(`\\n2.${index + 1} Testing malicious user-agent: ${userAgent.substring(0, 30)}...`);
        await testEndpointWithHeaders('POST', '/adventurers', {
            username: 'testuser',
            email: 'test@example.com', 
            password: 'ValidPass123!'
        }, {
            'User-Agent': userAgent
        }, 'Should block malicious user-agent');
    }

    // Test 3: Deep Sanitization
    console.log('\n🧼 Testing Deep Input Sanitization...');
    
    console.log('\n3.1 Testing null byte injection:');
    await testEndpoint('POST', '/adventurers', {
        username: 'test\\x00user',
        email: 'test@example.com',
        password: 'ValidPass123!'
    }, 'Should remove null bytes');

    console.log('\n3.2 Testing control character injection:');
    await testEndpoint('POST', '/adventures', {
        name: 'Test\\x01\\x02Adventure',
        difficulty: 'Easy',
        description: 'Control\\x1f\\x7f characters'
    }, 'Should remove control characters');

    console.log('\n3.3 Testing extremely long string:');
    await testEndpoint('POST', '/adventures', {
        name: 'Test Adventure',
        description: 'A'.repeat(50000), // 50KB string
        difficulty: 'Easy'
    }, 'Should truncate excessively long strings');

    // Test 4: Prototype Pollution Protection
    console.log('\n⚠️  Testing Prototype Pollution Protection...');
    
    console.log('\n4.1 Testing __proto__ injection:');
    await testEndpoint('POST', '/adventurers', {
        username: 'testuser',
        email: 'test@example.com',
        password: 'ValidPass123!',
        '__proto__': {
            'isAdmin': true
        }
    }, 'Should block __proto__ properties');

    console.log('\n4.2 Testing constructor injection:');
    await testEndpoint('POST', '/adventures', {
        name: 'Test Adventure',
        difficulty: 'Easy',
        'constructor': {
            'prototype': {
                'polluted': true
            }
        }
    }, 'Should block constructor properties');

    console.log('\n4.3 Testing prototype injection:');
    await testEndpoint('POST', '/regions', {
        adventureId: 1,
        name: 'Test Region',
        latitude: 45,
        longitude: 0,
        'prototype': {
            'malicious': true
        }
    }, 'Should block prototype properties');

    // Test 5: Nested Object Sanitization
    console.log('\n🔍 Testing Nested Object Sanitization...');
    
    console.log('\n5.1 Testing nested XSS in complex object:');
    await testEndpoint('POST', '/adventures', {
        name: 'Test Adventure',
        difficulty: 'Easy',
        metadata: {
            description: '<script>alert("nested XSS")</script>',
            tags: ['<img src=x onerror=alert(1)>', 'normal-tag'],
            location: {
                name: '<svg onload=alert(2)>',
                coordinates: {
                    lat: 45,
                    lng: '<script>evil()</script>'
                }
            }
        }
    }, 'Should sanitize all nested objects');

    console.log('\n5.2 Testing array sanitization:');
    await testEndpoint('POST', '/adventures', {
        name: 'Test Adventure',
        difficulty: 'Easy',
        tags: [
            'normal-tag',
            '<script>alert("array XSS")</script>',
            'javascript:void(0)',
            null,
            undefined,
            {
                'malicious': '<img src=x onerror=alert(3)>'
            }
        ]
    }, 'Should sanitize array elements recursively');

    // Test 6: SQL Injection with Advanced Techniques  
    console.log('\n💉 Testing Advanced SQL Injection Protection...');
    
    const sqlPayloads = [
        "'; UNION SELECT * FROM users--",
        "' OR 1=1; DROP TABLE adventurers; --",
        "admin'/**/UNION/**/SELECT/**/null,null,null--",
        "' AND (SELECT COUNT(*) FROM information_schema.tables)>0--",
        "'; WAITFOR DELAY '00:00:05'--",
        "' || (SELECT password FROM users WHERE id=1) ||'"
    ];

    for (const [index, payload] of sqlPayloads.entries()) {
        console.log(`\\n6.${index + 1} Testing SQL injection: ${payload.substring(0, 30)}...`);
        await testEndpoint('POST', '/auth/login', {
            username: payload,
            password: 'test'
        }, 'Should sanitize SQL injection attempt');
    }

    // Test 7: NoSQL Injection Protection
    console.log('\n🗃️  Testing NoSQL Injection Protection...');
    
    console.log('\n7.1 Testing object injection:');
    await testEndpoint('POST', '/auth/login', {
        username: {'$gt': ''},
        password: {'$gt': ''}
    }, 'Should reject object-based injections');

    console.log('\n7.2 Testing regex injection:');
    await testEndpoint('POST', '/adventurers', {
        username: {'$regex': '.*'},
        email: 'test@example.com',
        password: 'ValidPass123!'
    }, 'Should reject regex-based injections');

    // Test 8: Header Injection Protection
    console.log('\n📋 Testing Header Injection Protection...');
    
    console.log('\n8.1 Testing CRLF injection in custom headers:');
    await testEndpointWithHeaders('GET', '/adventures', null, {
        'X-Custom-Header': 'test\\r\\nInjected-Header: malicious'
    }, 'Should sanitize CRLF in headers');

    console.log('\n8.2 Testing host header injection:');
    await testEndpointWithHeaders('GET', '/adventures', null, {
        'Host': 'evil.com\\r\\nX-Injected: true'
    }, 'Should protect against host header injection');

    console.log('\n✅ Advanced Security Tests Complete!');
}

async function testEndpoint(method, endpoint, body, expectation) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Security-Test-Suite/1.0'
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
            console.log(`   ✅ Validation working: ${responseData.error || responseData.message}`);
        } else if (statusCode === 413) {
            console.log(`   ✅ Size limit working: ${responseData.error}`);
        } else if (statusCode === 429) {
            console.log(`   ⚠️  Rate limited: ${responseData.error}`);
        } else if (statusCode === 201 || statusCode === 200) {
            console.log(`   ⚠️  Request accepted - check if sanitization occurred`);
        } else {
            console.log(`   ℹ️  Response: ${responseData.message || responseData.error || 'Unknown'}`);
        }
        
        console.log(`   Expected: ${expectation}`);

    } catch (error) {
        console.log(`   ❌ Error testing endpoint: ${error.message}`);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('   💡 Make sure the server is running on port 3000');
        }
    }
}

async function testEndpointWithHeaders(method, endpoint, body, customHeaders, expectation) {
    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...customHeaders
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
            console.log(`   ✅ Security protection active: ${responseData.error || responseData.message}`);
        } else if (statusCode === 413) {
            console.log(`   ✅ Request blocked: ${responseData.error}`);
        } else {
            console.log(`   ℹ️  Response: ${responseData.message || responseData.error || 'Allowed'}`);
        }
        
        console.log(`   Expected: ${expectation}`);

    } catch (error) {
        console.log(`   ❌ Error testing endpoint: ${error.message}`);
    }
}

// Run advanced security tests
testAdvancedSecurity().catch(console.error);