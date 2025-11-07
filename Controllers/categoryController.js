const Category = require('../Models/categoryModel');
const { Op } = require('sequelize');

// Helper function to generate slug
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Create category with hierarchy support
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, level, parentId, description, sortOrder } = req.body;

    // Validate required fields
    if (!name || !level) {
      return res.status(400).json({ 
        error: 'Name and level are required' 
      });
    }

    // Validate level and parentId combination
    if (level === 1 && parentId) {
      return res.status(400).json({ 
        error: 'Level 1 categories cannot have a parent' 
      });
    }

    if (level > 1 && !parentId) {
      return res.status(400).json({ 
        error: `Level ${level} categories must have a parent` 
      });
    }

    // Check if parent exists for level 2 and 3
    if (parentId) {
      const parent = await Category.findByPk(parentId);
      if (!parent) {
        return res.status(404).json({ error: 'Parent category not found' });
      }
      if (parent.level !== level - 1) {
        return res.status(400).json({ 
          error: `Parent category must be level ${level - 1}` 
        });
      }
    }

    // Generate slug if not provided
    const categorySlug = slug || generateSlug(name);

    const category = await Category.create({
      name,
      slug: categorySlug,
      level: parseInt(level),
      parentId: parentId || null,
      description,
      sortOrder: sortOrder || 0
    });

    res.status(201).json(category);
    
  } catch (err) {
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Category slug must be unique' });
    }
    res.status(400).json({ error: err.message });
  }
};

// Get all categories WITHOUT hierarchy includes
exports.getCategories = async (req, res) => {
  try {
    const { level, parentId } = req.query;
    
    let where = {};
    if (level) where.level = parseInt(level);
    if (parentId) where.parentId = parentId;

    const categories = await Category.findAll({
      where,
      order: [
        ['level', 'ASC'],
        ['sortOrder', 'ASC'],
        ['name', 'ASC']
      ]
    });

    res.status(200).json(categories);
    
  } catch (err) {
    console.error('Error in getCategories:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get category by ID WITHOUT hierarchy includes
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.status(200).json(category);
  } catch (err) {
    console.error('Error in getCategoryById:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get category hierarchy (tree structure) - build manually
exports.getCategoryTree = async (req, res) => {
  try {
    // Get all categories and build tree manually
    const allCategories = await Category.findAll({
      order: [
        ['level', 'ASC'],
        ['sortOrder', 'ASC'],
        ['name', 'ASC']
      ]
    });

    // Build tree structure manually without associations
    const buildTree = (parentId = null) => {
      return allCategories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
          ...cat.toJSON(),
          children: buildTree(cat.id)
        }));
    };

    const categoryTree = buildTree();
    
    res.status(200).json(categoryTree);
  } catch (err) {
    console.error('Error in getCategoryTree:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update category WITHOUT image handling
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Prevent changing level if category has children
    if (req.body.level && parseInt(req.body.level) !== category.level) {
      const children = await Category.count({ where: { parentId: category.id } });
      if (children > 0) {
        return res.status(400).json({ 
          error: 'Cannot change level of category that has children' 
        });
      }
    }

    // Generate new slug if name is being updated
    if (req.body.name && req.body.name !== category.name && !req.body.slug) {
      req.body.slug = generateSlug(req.body.name);
    }

    await category.update(req.body);
    
    res.status(200).json(category);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete category - simplified without image cleanup
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has children
    const children = await Category.count({ where: { parentId: category.id } });
    if (children > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete category that has subcategories' 
      });
    }

    await category.destroy();
    
    res.status(200).json({
      message: 'Category deleted successfully'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Bulk create categories (for initial setup)
exports.bulkCreateCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    
    if (!categories || !Array.isArray(categories)) {
      return res.status(400).json({ 
        error: 'Categories array is required' 
      });
    }

    const createdCategories = await Category.bulkCreate(categories, {
      validate: true,
      returning: true
    });

    res.status(201).json(createdCategories);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get categories by level (convenience endpoint)
exports.getCategoriesByLevel = async (req, res) => {
  try {
    const { level } = req.params;
    
    const categories = await Category.findAll({
      where: { level: parseInt(level) },
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC']
      ]
    });

    res.status(200).json(categories);
  } catch (err) {
    console.error('Error in getCategoriesByLevel:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get subcategories by parent ID
exports.getSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;
    
    const subcategories = await Category.findAll({
      where: { parentId },
      order: [
        ['sortOrder', 'ASC'],
        ['name', 'ASC']
      ]
    });

    res.status(200).json(subcategories);
  } catch (err) {
    console.error('Error in getSubcategories:', err);
    res.status(500).json({ error: err.message });
  }
};