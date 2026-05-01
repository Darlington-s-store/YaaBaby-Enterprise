import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

async function checkCategories() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection established.');
    
    const [categories] = await sequelize.query(
      'SELECT id, name, "parentId", brands FROM "Categories" WHERE brands IS NOT NULL AND brands != \'[]\'::jsonb'
    );
    
    console.log('📂 Categories with brands:', JSON.stringify(categories, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkCategories();
