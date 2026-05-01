import sequelize from '../src/config/database.js';
import { User, Category, Product, ProductVariant } from '../src/models/index.js';
import bcrypt from 'bcryptjs';

async function seed() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    // Sync schema
    console.log('⏳ Syncing schema...');
    await sequelize.sync({ alter: true });
    console.log('✅ Schema synced.');

    // Create Admin User
    const adminEmail = 'admin@yaababy.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (!existingAdmin) {
      console.log('⏳ Creating admin user...');
      await User.create({
        email: adminEmail,
        password: 'AdminPassword123!',
        fullName: 'System Administrator',
        role: 'super_admin',
        isEmailVerified: true,
        isActive: true
      });
      console.log('✅ Admin user created (admin@yaababy.com / AdminPassword123!)');
    } else {
      console.log('ℹ️ Admin user already exists.');
    }

    // Create some categories
    const categories = ['Diapers', 'Baby Food', 'Toys', 'Clothing'];
    for (const catName of categories) {
      const [cat, created] = await Category.findOrCreate({
        where: { name: catName },
        defaults: { slug: catName.toLowerCase().replace(' ', '-') }
      });
      if (created) console.log(`✅ Category created: ${catName}`);
    }

    console.log('✨ Seeding completed successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sequelize.close();
  }
}

seed();
