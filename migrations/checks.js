const sequelize = require('../Database/database');

async function checkSizes() {
  try {
    const products = await sequelize.query(
      `SELECT id, size FROM products`,
      { type: sequelize.QueryTypes.SELECT }
    );

    console.log(products);
  } catch (error) {
    console.error(error);
  } finally {
    await sequelize.close();
  }
}

checkSizes();
