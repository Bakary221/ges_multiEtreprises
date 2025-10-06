const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
// Utiliser les tokens du frontend qui fonctionnent
let ADMIN_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MiwiZW1haWwiOiJhZG1pbkB0ZWNoY29ycC5zbiIsInJvbGUiOiJBRE1JTiIsImNvbXBhbnlJZCI6MiwiaWF0IjoxNzU5Njg2NDIwLCJleHAiOjE3NTk2OTM2MjB9.ic1BEE2gRbPIsUYXy3otZKrSFAW49ChgsNVGSaAaf2I';
let CAISSIER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiZW1haWwiOiJjYWlzc2llckB0ZWNoY29ycC5zbiIsInJvbGUiOiJDQUlTU0lFUiIsImNvbXBhbnlJZCI6MiwiaWF0IjoxNzU5Njg2NDIwLCJleHAiOjE3NTk2OTM2MjB9.example_token';

// Note: Utilisation des tokens existants du frontend

// Fonction pour faire des requêtes HTTP
const makeRequest = async (method, url, data = null, token = ADMIN_TOKEN) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(BASE_URL + url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const responseData = body ? JSON.parse(body) : {};
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log(`✅ ${method.toUpperCase()} ${url} - Status: ${res.statusCode}`);
            resolve(responseData);
          } else {
            console.log(`❌ ${method.toUpperCase()} ${url} - Status: ${res.statusCode} - ${responseData.message || 'Unknown error'}`);
            resolve(null);
          }
        } catch (error) {
          console.log(`❌ ${method.toUpperCase()} ${url} - Parse error: ${error.message}`);
          resolve(null);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${method.toUpperCase()} ${url} - Request error: ${error.message}`);
      resolve(null);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

async function testPaymentSystem() {
  console.log('🚀 DÉBUT DES TESTS DU SYSTÈME DE PAIEMENT\n');
  console.log('🔐 Utilisation des tokens existants du frontend\n');

  // 1. Test création payrun (Admin)
  console.log('📋 1. Test création payrun (Admin)');
  const payrunData = await makeRequest('POST', '/admin/payruns', { month: '2025-11' });
  if (payrunData) {
    console.log('   Payrun créé:', payrunData.data);
  }

  // 2. Test récupération des payruns (Admin)
  console.log('\n📋 2. Test récupération des payruns (Admin)');
  const payruns = await makeRequest('GET', '/admin/payruns');
  if (payruns) {
    console.log(`   ${payruns.data.payruns?.length || 0} payruns trouvés`);
  }

  // 3. Test récupération des payslips (Admin)
  console.log('\n📋 3. Test récupération des payslips (Admin)');
  const payslips = await makeRequest('GET', '/admin/payslips');
  if (payslips) {
    console.log(`   ${payslips.data.payslips?.length || 0} payslips trouvés`);
  }

  // 4. Test récupération des payslips (Caissier)
  console.log('\n📋 4. Test récupération des payslips (Caissier)');
  const caissierPayslips = await makeRequest('GET', '/caissier/payslips', null, CAISSIER_TOKEN);
  if (caissierPayslips) {
    console.log(`   ${caissierPayslips.data.payslips?.length || 0} payslips pour caissier`);
  }

  // 5. Test récupération des employés (Caissier)
  console.log('\n📋 5. Test récupération des employés (Caissier)');
  const employees = await makeRequest('GET', '/caissier/employees', null, CAISSIER_TOKEN);
  if (employees) {
    console.log(`   ${employees.data?.length || 0} employés trouvés`);
  }

  // 6. Test récupération des paiements (Caissier)
  console.log('\n📋 6. Test récupération des paiements (Caissier)');
  const payments = await makeRequest('GET', '/caissier/payments', null, CAISSIER_TOKEN);
  if (payments) {
    console.log(`   ${payments.data.payments?.length || 0} paiements trouvés`);
  }

  // 7. Test récupération des prêts (Caissier)
  console.log('\n📋 7. Test récupération des prêts (Caissier)');
  const loans = await makeRequest('GET', '/caissier/loans', null, CAISSIER_TOKEN);
  if (loans) {
    console.log(`   ${loans.data.loans?.length || 0} prêts trouvés`);
  }

  // 8. Test création d'un prêt (Caissier)
  console.log('\n📋 8. Test création d\'un prêt (Caissier)');
  if (employees?.data?.length > 0) {
    const loanData = {
      employeeId: employees.data[0].id,
      amount: 50000,
      interestRate: 5,
      termMonths: 12,
      purpose: 'Test prêt'
    };
    const newLoan = await makeRequest('POST', '/caissier/loans', loanData, CAISSIER_TOKEN);
    if (newLoan) {
      console.log('   Prêt créé:', newLoan.data);
    }
  }

  // 9. Test statistiques de paiement (Caissier)
  console.log('\n📋 9. Test statistiques de paiement (Caissier)');
  const stats = await makeRequest('GET', '/caissier/payments/stats', null, CAISSIER_TOKEN);
  if (stats) {
    console.log('   Stats:', stats.data);
  }

  // 10. Test génération PDF payslip (Admin)
  console.log('\n📋 10. Test génération PDF payslip (Admin)');
  if (payslips?.data?.payslips?.length > 0) {
    const pdfResult = await makeRequest('GET', `/admin/payslips/${payslips.data.payslips[0].id}/pdf`);
    if (pdfResult) {
      console.log('   PDF généré:', pdfResult.data);
    }
  }

  console.log('\n🎉 TESTS TERMINÉS !');
}

// Exécuter les tests
testPaymentSystem().catch(console.error);