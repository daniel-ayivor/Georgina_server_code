const { Sequelize } = require('sequelize');
const sequelize = require('../Database/database');

async function migrate() {
  try {
    const products = await sequelize.query(
      `SELECT id, size FROM products`,
      { type: sequelize.QueryTypes.SELECT }
    );

    for (const product of products) {
      if (!product.size) continue;

      let sizesArray = [];

      try {
        // Case 1: JSON string
        if (product.size.startsWith('[')) {
          sizesArray = JSON.parse(product.size);
        }
        // Case 2: comma-separated string
        else {
          sizesArray = product.size
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        }
      } catch (err) {
        console.error(`Failed to parse size for product ${product.id}`);
      }

      await sequelize.query(
        `UPDATE products SET sizes = :sizes WHERE id = :id`,
        {
          replacements: {
            sizes: JSON.stringify(sizesArray),
            id: product.id,
          },
        }
      );
    }

    console.log('✅ Sizes migrated successfully');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await sequelize.close();
  }
}

migrate();
