/**
 * Test for deterministic keypair generation.
 * Run with: node test/sea/test-deterministic-pair.js
 */

const SEA = require('../../sea');

async function runTests() {
  console.log('=== Testing Deterministic Keypair Generation ===\n');
  
  let passed = 0;
  let failed = 0;
  
  // Test 1: Same inputs produce same keypair
  console.log('Test 1: Same username+password => same keypair');
  try {
    const pair1 = await SEA.deterministicPair('alice', 'password123');
    const pair2 = await SEA.deterministicPair('alice', 'password123');
    
    if (pair1.pub === pair2.pub && pair1.priv === pair2.priv) {
      console.log('  ✓ PASS: Keypairs match');
      passed++;
    } else {
      console.log('  ✗ FAIL: Keypairs do not match');
      console.log('    pair1.pub:', pair1.pub);
      console.log('    pair2.pub:', pair2.pub);
      failed++;
    }
  } catch(e) {
    console.log('  ✗ FAIL: Error:', e.message);
    failed++;
  }
  
  // Test 2: Different passwords produce different keypairs
  console.log('\nTest 2: Different password => different keypair');
  try {
    const pairA = await SEA.deterministicPair('alice', 'password123');
    const pairB = await SEA.deterministicPair('alice', 'differentpass');
    
    if (pairA.pub !== pairB.pub) {
      console.log('  ✓ PASS: Different passwords produce different keypairs');
      passed++;
    } else {
      console.log('  ✗ FAIL: Keypairs should be different');
      failed++;
    }
  } catch(e) {
    console.log('  ✗ FAIL: Error:', e.message);
    failed++;
  }
  
  // Test 3: Different usernames produce different keypairs
  console.log('\nTest 3: Different username => different keypair');
  try {
    const pairA = await SEA.deterministicPair('alice', 'password123');
    const pairB = await SEA.deterministicPair('bob', 'password123');
    
    if (pairA.pub !== pairB.pub) {
      console.log('  ✓ PASS: Different usernames produce different keypairs');
      passed++;
    } else {
      console.log('  ✗ FAIL: Keypairs should be different');
      failed++;
    }
  } catch(e) {
    console.log('  ✗ FAIL: Error:', e.message);
    failed++;
  }
  
  // Test 4: Generated keys are valid for signing
  console.log('\nTest 4: Generated keys work for sign/verify');
  try {
    const pair = await SEA.deterministicPair('testuser', 'testpass123');
    const message = 'Hello, World!';
    const signed = await SEA.sign(message, pair);
    const verified = await SEA.verify(signed, pair.pub);
    
    if (verified === message) {
      console.log('  ✓ PASS: Sign/verify works correctly');
      passed++;
    } else {
      console.log('  ✗ FAIL: Verification failed');
      console.log('    Expected:', message);
      console.log('    Got:', verified);
      failed++;
    }
  } catch(e) {
    console.log('  ✗ FAIL: Error:', e.message);
    failed++;
  }
  
  // Test 5: Generated keys work for encryption
  console.log('\nTest 5: Generated keys work for encrypt/decrypt');
  try {
    const alice = await SEA.deterministicPair('alice', 'alicepass123');
    const bob = await SEA.deterministicPair('bob', 'bobpass123');
    
    const secret = await SEA.secret(bob.epub, alice);
    const message = 'Secret message for Bob';
    const encrypted = await SEA.encrypt(message, secret);
    const decrypted = await SEA.decrypt(encrypted, secret);
    
    if (decrypted === message) {
      console.log('  ✓ PASS: Encrypt/decrypt works correctly');
      passed++;
    } else {
      console.log('  ✗ FAIL: Decryption failed');
      console.log('    Expected:', message);
      console.log('    Got:', decrypted);
      failed++;
    }
  } catch(e) {
    console.log('  ✗ FAIL: Error:', e.message);
    failed++;
  }
  
  // Test 6: Keypair has all required fields
  console.log('\nTest 6: Keypair has all required fields');
  try {
    const pair = await SEA.deterministicPair('testuser', 'testpass123');
    const hasAllFields = pair.pub && pair.priv && pair.epub && pair.epriv;
    
    if (hasAllFields) {
      console.log('  ✓ PASS: All fields present (pub, priv, epub, epriv)');
      console.log('    pub:', pair.pub.substring(0, 20) + '...');
      console.log('    epub:', pair.epub.substring(0, 20) + '...');
      passed++;
    } else {
      console.log('  ✗ FAIL: Missing fields');
      console.log('    pair:', pair);
      failed++;
    }
  } catch(e) {
    console.log('  ✗ FAIL: Error:', e.message);
    failed++;
  }
  
  // Summary
  console.log('\n=== Results ===');
  console.log(`Passed: ${passed}/${passed + failed}`);
  console.log(`Failed: ${failed}/${passed + failed}`);
  
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(console.error);
