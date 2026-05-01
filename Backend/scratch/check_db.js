const sequelize = require('./src/config/database');

async function checkDb() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    const [results, metadata] = await sequelize.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('Tables in database:', results.map(r => r.table_name));
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

checkDb();
