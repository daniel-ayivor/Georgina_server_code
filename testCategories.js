const Category = require('./Models/categoryModel');
const SubCategory = require('./Models/subCategoryModel');
const sequelize = require('./Database/database');

async function testCategories() {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    const categories = await Category.findAll({
      include: [{
        model: SubCategory,
        as: 'subcategories'
      }]
    });

    console.log('Categories found:', categories.length);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (${cat.subcategories ? cat.subcategories.length : 0} subcategories)`);
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories.forEach(sub => {
          console.log(`  - ${sub.name}`);
        });
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testCategories();
