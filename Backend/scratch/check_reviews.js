import User from '../src/models/User.js';
import Review from '../src/models/Review.js';
import sequelize from '../src/config/database.js';

async function check() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    
    const count = await Review.count();
    console.log(`Total reviews: ${count}`);
    
    const reviews = await Review.findAll({
      limit: 5,
      include: [{ model: User, as: 'user', attributes: ['fullName'] }]
    });
    
    reviews.forEach(r => {
      console.log(`- [${r.status}] ${r.user?.fullName || 'Anon'}: ${r.quote || r.body}`);
    });
    
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
}

check();
