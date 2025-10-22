const { v4: uuidv4 } = require('uuid');
const Category = require('./Models/categoryModel');
const SubCategory = require('./Models/subCategoryModel');
const sequelize = require('./Database/database');

const categoriesData = [
  {
    id: uuidv4(),
    name: 'Clothes',
    description: 'This would be the main, top-level category for all apparel.',
    slug: 'clothes',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    subcategories: [
      {
        id: uuidv4(),
        name: 'Men',
        slug: 'men',
        subcategories: [
          { id: uuidv4(), name: 'African wear', slug: 'men-african-wear' },
          { id: uuidv4(), name: 'Trousers', slug: 'men-trousers' }
        ]
      },
      {
        id: uuidv4(),
        name: 'Women',
        slug: 'women',
        subcategories: [
          { id: uuidv4(), name: 'African print', slug: 'women-african-print' },
          { id: uuidv4(), name: 'African wear', slug: 'women-african-wear' },
          { id: uuidv4(), name: 'Ankara', slug: 'women-ankara' },
          { id: uuidv4(), name: 'Bonnet', slug: 'women-bonnet' }
        ]
      },
      {
        id: uuidv4(),
        name: 'Kids',
        slug: 'kids',
        subcategories: [
          { id: uuidv4(), name: 'African wear', slug: 'kids-african-wear' }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Foodstuffs',
    description: 'This broad category is for all edible products. You can further break this down by type.',
    slug: 'foodstuffs',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    subcategories: [
      {
        id: uuidv4(),
        name: 'Pantry',
        slug: 'pantry',
        subcategories: [
          { id: uuidv4(), name: 'Vegetable oils', slug: 'vegetable-oils' },
          { id: uuidv4(), name: 'Zomi', slug: 'zomi' },
          { id: uuidv4(), name: 'Gari', slug: 'gari' },
          { id: uuidv4(), name: 'Spaghetti', slug: 'spaghetti' },
          { id: uuidv4(), name: 'Tomatoes paste', slug: 'tomatoes-paste' }
        ]
      },
      {
        id: uuidv4(),
        name: 'Prepared Mixes',
        slug: 'prepared-mixes',
        subcategories: [
          { id: uuidv4(), name: 'Fufu', slug: 'fufu' },
          { id: uuidv4(), name: 'Banku', slug: 'banku' },
          { id: uuidv4(), name: 'Tom brown', slug: 'tom-brown' },
          { id: uuidv4(), name: 'Konkonte', slug: 'konkonte' }
        ]
      },
      {
        id: uuidv4(),
        name: 'Soup Base',
        slug: 'soup-base',
        subcategories: [
          { id: uuidv4(), name: 'Palm nut soup', slug: 'palm-nut-soup' }
        ]
      }
    ]
  },
  {
    id: uuidv4(),
    name: 'Services',
    description: 'This top-level category is for any non-tangible offerings.',
    slug: 'services',
    image: 'https://images.unsplash.com/photo-1721322800607-8c38375eef04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    subcategories: [
      {
        id: uuidv4(),
        name: 'Cleaning Services',
        slug: 'cleaning-services',
        subcategories: [
          { id: uuidv4(), name: 'Office cleaning', slug: 'office-cleaning' },
          { id: uuidv4(), name: 'Kitchen cleaning', slug: 'kitchen-cleaning' },
          { id: uuidv4(), name: 'Bathroom cleaning', slug: 'bathroom-cleaning' },
          { id: uuidv4(), name: 'Dusting', slug: 'dusting' },
          { id: uuidv4(), name: 'Mopping', slug: 'mopping' },
          { id: uuidv4(), name: 'Vacuuming', slug: 'vacuuming' }
        ]
      }
    ]
  }
];

async function seedCategories() {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Check if categories already exist
    const existingCategories = await Category.findAll();
    if (existingCategories.length > 0) {
      console.log('Categories already exist. Skipping seed...');
      process.exit(0);
    }

    // Create categories and their subcategories
    for (const categoryData of categoriesData) {
      const { subcategories, ...categoryInfo } = categoryData;
      
      // Create main category
      const category = await Category.create(categoryInfo);
      console.log(`Created category: ${category.name}`);

      // Create subcategories
      for (const subcategoryData of subcategories) {
        const { subcategories: nestedSubcategories, ...subcategoryInfo } = subcategoryData;
        
        // Create subcategory
        const subcategory = await SubCategory.create({
          ...subcategoryInfo,
          parentId: category.id
        });
        console.log(`Created subcategory: ${subcategory.name}`);

        // Create nested subcategories if they exist
        if (nestedSubcategories) {
          for (const nestedSubcategoryData of nestedSubcategories) {
            const nestedSubcategory = await SubCategory.create({
              ...nestedSubcategoryData,
              parentId: subcategory.id
            });
            console.log(`Created nested subcategory: ${nestedSubcategory.name}`);
          }
        }
      }
    }

    console.log('Categories and subcategories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
