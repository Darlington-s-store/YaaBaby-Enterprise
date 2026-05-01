import admin, { bucket } from './src/config/firebase.js';

async function testFirebase() {
  try {
    console.log('Project ID:', admin.instanceId().app.options.credential.projectId || process.env.FIREBASE_PROJECT_ID);
    
    console.log('Attempting to list all buckets in the project...');
    const [buckets] = await admin.storage().bucket().storage.getBuckets();
    
    if (buckets.length === 0) {
      console.log('❌ No buckets found in this project. Please enable Firebase Storage in the console.');
    } else {
      console.log('✅ Found buckets:');
      buckets.forEach(b => console.log(' -', b.name));
      console.log('\n💡 Update your .env FIREBASE_STORAGE_BUCKET with one of these.');
    }
  } catch (error) {
    console.error('❌ Firebase Error:', error);
  }
}

testFirebase();
