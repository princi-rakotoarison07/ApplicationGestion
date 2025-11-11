const http = require('http');

// Test des endpoints entretiens
const testEndpoints = [
  '/api/entretiens',
  '/api/entretiens/candidats/tous', 
  '/api/entretiens/statuts/tous'
];

const testEndpoint = (path) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', (error) => {
      reject({ path, error: error.message });
    });

    req.end();
  });
};

async function runTests() {
  console.log('🔍 Test des endpoints entretiens...\n');
  
  for (const endpoint of testEndpoints) {
    try {
      const result = await testEndpoint(endpoint);
      console.log(`✅ ${endpoint}`);
      console.log(`   Status: ${result.status}`);
      console.log(`   Response: ${result.body.substring(0, 100)}...`);
      console.log('');
    } catch (error) {
      console.log(`❌ ${endpoint}`);
      console.log(`   Error: ${error.error}`);
      console.log('');
    }
  }
}

runTests();
