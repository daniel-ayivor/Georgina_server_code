const Category = require('./Models/categoryModel');
const SubCategory = require('./Models/subCategoryModel');
const sequelize = require('./Database/database');

const specialCategories = [
  {
    id: 'trending-001',
    name: 'Trending Products',
    description: 'Discover our most popular and trending products that customers love',
    slug: 'trending',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    subcategories: [
      {
        id: 'trending-clothes-001',
        name: 'Trending Clothes',
        slug: 'trending-clothes',
        parentId: 'trending-001'
      },
      {
        id: 'trending-food-001',
        name: 'Trending Food',
        slug: 'trending-food',
        parentId: 'trending-001'
      },
      {
        id: 'trending-services-001',
        name: 'Trending Services',
        slug: 'trending-services',
        parentId: 'trending-001'
      }
    ]
  },
  {
    id: 'new-arrival-001',
    name: 'New Arrivals',
    description: 'Check out our latest products and fresh additions to our collection',
    slug: 'new-arrivals',
    image: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
    subcategories: [
      {
        id: 'new-clothes-001',
        name: 'New Clothes',
        slug: 'new-clothes',
        parentId: 'new-arrival-001'
      },
      {
        id: 'new-food-001',
        name: 'New Food Items',
        slug: 'new-food',
        parentId: 'new-arrival-001'
      },
      {
        id: 'new-services-001',
        name: 'New Services',
        slug: 'new-services',
        parentId: 'new-arrival-001'
      }
    ]
  }
];

async function addSpecialCategories() {
  try {
    console.log('🔄 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connected successfully!');

    for (const categoryData of specialCategories) {
      const { subcategories, ...categoryInfo } = categoryData;

      // Check if category already exists
      let category = await Category.findOne({ where: { slug: categoryInfo.slug } });
      
      if (category) {
        console.log(`ℹ️  Category ${category.name} already exists. Skipping...`);
      } else {
        // Create main category
        category = await Category.create(categoryInfo);
        console.log(`✅ Created category: ${category.name}`);
      }

      // Create subcategories
      if (subcategories) {
        for (const subcategoryData of subcategories) {
          let subcategory = await SubCategory.findOne({ 
            where: { slug: subcategoryData.slug, parentId: category.id } 
          });
          
          if (subcategory) {
            console.log(`ℹ️  Subcategory ${subcategory.name} already exists under ${category.name}. Skipping...`);
          } else {
            subcategory = await SubCategory.create({
              ...subcategoryData,
              parentId: category.id
            });
            console.log(`✅ Created subcategory: ${subcategory.name}`);
          }
        }
      }
    }

    console.log('🎉 Special categories added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding special categories:', error);
    process.exit(1);
  }
}

addSpecialCategories();
