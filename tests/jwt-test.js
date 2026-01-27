/**
 * JWT Authentication Test
 * 
 * This test file verifies the JWT token implementation for the WayFind app.
 * It tests login, token verification, and refresh functionality.
 */

const BASE_URL = 'http://localhost:3000';

async function testAuthentication() {
    console.log('🔐 Testing JWT Authentication System');
    console.log('=====================================');

    try {
        // Test 1: Login with valid credentials
        console.log('\n1. Testing login with valid credentials...');
        
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'testuser',
                password: 'testpass123'
            }),
        });

        let loginData;
        if (loginResponse.ok) {
            loginData = await loginResponse.json();
            console.log('✅ Login successful');
            console.log('   Access Token:', loginData.accessToken ? '✅ Present' : '❌ Missing');
            console.log('   Refresh Token:', loginData.refreshToken ? '✅ Present' : '❌ Missing');
            console.log('   Token Type:', loginData.tokenType);
            console.log('   Expires In:', loginData.expiresIn);
        } else {
            console.log('❌ Login failed:', loginResponse.status);
            const errorData = await loginResponse.json();
            console.log('   Error:', errorData.error);
            
            // If login fails, try creating a user first
            console.log('\n   Attempting to create user...');
            const signupResponse = await fetch(`${BASE_URL}/adventurers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'testuser',
                    password: 'testpass123',
                    profilepicture: null,
                }),
            });

            if (signupResponse.ok) {
                const signupData = await signupResponse.json();
                console.log('✅ User created successfully');
                console.log('   Access Token:', signupData.accessToken ? '✅ Present' : '❌ Missing');
                console.log('   Refresh Token:', signupData.refreshToken ? '✅ Present' : '❌ Missing');
                loginData = signupData;
            } else {
                console.log('❌ Failed to create user:', signupResponse.status);
                return;
            }
        }

        if (!loginData || !loginData.accessToken) {
            console.log('❌ No valid tokens received, aborting tests');
            return;
        }

        // Test 2: Verify token
        console.log('\n2. Testing token verification...');
        
        const verifyResponse = await fetch(`${BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.accessToken}`,
            },
        });

        if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            console.log('✅ Token verification successful');
            console.log('   Valid:', verifyData.valid);
            console.log('   User ID:', verifyData.user?.id);
            console.log('   Username:', verifyData.user?.username);
        } else {
            console.log('❌ Token verification failed:', verifyResponse.status);
            const errorData = await verifyResponse.json();
            console.log('   Error:', errorData.error);
        }

        // Test 3: Refresh token
        console.log('\n3. Testing token refresh...');
        
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                refreshToken: loginData.refreshToken
            }),
        });

        if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            console.log('✅ Token refresh successful');
            console.log('   New Access Token:', refreshData.accessToken ? '✅ Present' : '❌ Missing');
            console.log('   New Refresh Token:', refreshData.refreshToken ? '✅ Present' : '❌ Missing');
            console.log('   Token Type:', refreshData.tokenType);
            console.log('   Expires In:', refreshData.expiresIn);
            
            // Test 4: Use refreshed token
            console.log('\n4. Testing refreshed token...');
            
            const refreshedVerifyResponse = await fetch(`${BASE_URL}/auth/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${refreshData.accessToken}`,
                },
            });

            if (refreshedVerifyResponse.ok) {
                const refreshedVerifyData = await refreshedVerifyResponse.json();
                console.log('✅ Refreshed token verification successful');
                console.log('   Valid:', refreshedVerifyData.valid);
                console.log('   User ID:', refreshedVerifyData.user?.id);
                console.log('   Username:', refreshedVerifyData.user?.username);
            } else {
                console.log('❌ Refreshed token verification failed:', refreshedVerifyResponse.status);
            }
        } else {
            console.log('❌ Token refresh failed:', refreshResponse.status);
            const errorData = await refreshResponse.json();
            console.log('   Error:', errorData.error);
        }

        console.log('\n🎉 JWT Authentication Test Complete!');
        
    } catch (error) {
        console.error('❌ Test failed with error:', error);
    }
}

// Run the test
testAuthentication();