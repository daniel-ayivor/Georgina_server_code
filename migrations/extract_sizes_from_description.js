const sequelize = require('../Database/database');

function extractSizes(description) {
  const match = description.match(/Sizes:\s*([A-Za-z0-9, ]+)/i);
  if (!match) return [];
  return match[1].split(',').map(s => s.trim()).filter(Boolean);
}

async function migrate() {
  try {
    const [products] = await sequelize.query('SELECT id, description FROM products');

    for (const product of products) {
      const sizes = extractSizes(product.description || '');
      
      if (sizes.length === 0) continue; // skip products with no sizes

      await sequelize.query(
        'UPDATE products SET size = :size WHERE id = :id',
        {
          replacements: {
            size: JSON.stringify(sizes), // store as JSON array
            id: product.id
          }
        }
      );

      console.log(`Updated product ${product.id} with sizes:`, sizes);
    }

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

migrate();
