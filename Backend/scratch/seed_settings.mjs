import { SystemSetting } from '../src/models/index.js';
import sequelize from '../src/config/database.js';

const initialSettings = [
  {
    key: 'site_config',
    group: 'general',
    label: 'Site Configuration',
    description: 'Main website settings like name, logo, and slogan',
    value: {
      name: 'YaaBaby Enterprise',
      slogan: 'Premium Essentials for Your Little Ones',
      logo: 'https://yaababy.gh/logo.png',
      favicon: 'https://yaababy.gh/favicon.ico',
      maintenanceMode: false
    }
  },
  {
    key: 'contact_info',
    group: 'contact',
    label: 'Contact Information',
    description: 'Store contact details for customers',
    value: {
      email: 'hello@yaababy.gh',
      phone: '+233 54 273 7373',
      address: 'Spintex Road, Accra, Ghana',
      whatsapp: '+233542737373'
    }
  },
  {
    key: 'social_links',
    group: 'social',
    label: 'Social Media Links',
    description: 'Social media profile URLs',
    value: {
      instagram: 'https://instagram.com/yaababy.gh',
      facebook: 'https://facebook.com/yaababy.gh',
      twitter: 'https://twitter.com/yaababygh',
      tiktok: 'https://tiktok.com/@yaababy.gh'
    }
  },
  {
    key: 'business_hours',
    group: 'general',
    label: 'Business Hours',
    description: 'Store opening and closing times',
    value: {
      mon_fri: '8:00 AM - 6:00 PM',
      sat: '9:00 AM - 4:00 PM',
      sun: 'Closed'
    }
  }
];

async function seedSettings() {
  try {
    console.log('🌱 Syncing database...');
    await sequelize.sync();

    console.log('🌱 Seeding system settings...');
    
    // Using bulkCreate with updateOnDuplicate if possible, or just loop
    for (const setting of initialSettings) {
      await SystemSetting.upsert(setting);
    }

    console.log('✅ System settings seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding system settings:', error);
    process.exit(1);
  }
}

seedSettings();
