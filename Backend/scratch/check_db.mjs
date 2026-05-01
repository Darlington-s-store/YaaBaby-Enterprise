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

async function checkDb() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
    
    const [results] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    
    console.log('Raw results:', results);
    
    if (results && Array.isArray(results)) {
       console.log('📊 Tables in database:', results.map(r => r.table_name || r.TABLE_NAME));
    } else {
       console.log('No tables found or results is not an array.');
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    await sequelize.close();
  }
}

checkDb();
