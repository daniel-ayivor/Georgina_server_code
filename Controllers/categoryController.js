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



// Enhanced Delete Category with multiple options
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { deleteSubcategories, moveToParent } = req.query;

    console.log(`🗑️ Delete request for category ${id}`, { deleteSubcategories, moveToParent });

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Check if category has children
    const children = await Category.findAll({ where: { parentId: id } });
    const hasChildren = children.length > 0;

    if (hasChildren) {
      // Option 1: Delete all subcategories (cascading delete)
      if (deleteSubcategories === 'true') {
        console.log(`🚀 Deleting category ${id} with ${children.length} subcategories`);
        
        // First delete all children recursively
        await deleteCategoryWithChildren(id);
        
        return res.status(200).json({
          message: 'Category and all its subcategories deleted successfully',
          deletedCategory: {
            id: category.id,
            name: category.name,
            level: category.level
          },
          deletedSubcategories: children.length,
          totalDeleted: children.length + 1
        });
      }

      // Option 2: Move subcategories to parent category (only for level 2+)
      else if (moveToParent === 'true' && category.parentId) {
        const parentCategory = await Category.findByPk(category.parentId);
        if (!parentCategory) {
          return res.status(400).json({ error: 'Parent category not found' });
        }

        console.log(`🔄 Moving ${children.length} subcategories to parent ${category.parentId}`);
        
        await Category.update(
          { parentId: category.parentId },
          { where: { parentId: id } }
        );
        
        await category.destroy();
        
        return res.status(200).json({
          message: 'Category deleted and subcategories moved to parent category',
          movedSubcategories: children.length,
          newParent: {
            id: parentCategory.id,
            name: parentCategory.name
          }
        });
      }

      // Option 3: Move subcategories to root (only for level 2 categories)
      else if (moveToParent === 'root' && category.level === 2) {
        console.log(`🔄 Moving ${children.length} subcategories to root level`);
        
        await Category.update(
          { 
            parentId: null,
            level: 1 
          },
          { where: { parentId: id } }
        );
        
        await category.destroy();
        
        return res.status(200).json({
          message: 'Category deleted and subcategories moved to root level',
          movedSubcategories: children.length,
          promotedToLevel: 1
        });
      }

      // Default: Prevent deletion and show options
      else {
        return res.status(400).json({ 
          error: 'Category has subcategories',
          message: `"${category.name}" contains ${children.length} subcategor${children.length === 1 ? 'y' : 'ies'}. Choose how to handle them:`,
          category: {
            id: category.id,
            name: category.name,
            level: category.level,
            subcategoriesCount: children.length
          },
          options: {
            deleteSubcategories: `Add ?deleteSubcategories=true to delete all ${children.length} subcategories`,
            ...(category.parentId && {
              moveToParent: `Add ?moveToParent=true to move subcategories to parent category`
            }),
            ...(category.level === 2 && {
              moveToRoot: `Add ?moveToParent=root to move subcategories to root level`
            })
          }
        });
      }
    }

    // No children - simple delete
    console.log(`✅ Deleting category ${id} (no subcategories)`);
    await category.destroy();
    
    res.status(200).json({
      message: 'Category deleted successfully',
      deletedCategory: {
        id: category.id,
        name: category.name,
        level: category.level
      }
    });
  } catch (err) {
    console.error('❌ Error in deleteCategory:', err);
    res.status(500).json({ error: err.message });
  }
};

// Helper function to recursively delete category with all children
const deleteCategoryWithChildren = async (categoryId) => {
  try {
    const children = await Category.findAll({ where: { parentId: categoryId } });
    
    console.log(`🗂️ Recursively deleting ${children.length} children of ${categoryId}`);
    
    // Recursively delete all children
    for (const child of children) {
      await deleteCategoryWithChildren(child.id);
    }
    
    // Delete the current category
    await Category.destroy({ where: { id: categoryId } });
    
    console.log(`✅ Successfully deleted category ${categoryId}`);
  } catch (error) {
    console.error(`❌ Error deleting category ${categoryId}:`, error);
    throw error;
  }
};

// Delete only subcategories of a specific category
exports.deleteSubcategories = async (req, res) => {
  try {
    const { parentId } = req.params;

    console.log(`🗑️ Bulk delete subcategories request for parent ${parentId}`);

    const parentCategory = await Category.findByPk(parentId);
    if (!parentCategory) {
      return res.status(404).json({ error: 'Parent category not found' });
    }

    const subcategories = await Category.findAll({ where: { parentId } });
    
    if (subcategories.length === 0) {
      return res.status(404).json({ error: 'No subcategories found for this category' });
    }

    console.log(`🚀 Deleting ${subcategories.length} subcategories under "${parentCategory.name}"`);

    // Delete all subcategories recursively
    let totalDeleted = 0;
    for (const subcategory of subcategories) {
      await deleteCategoryWithChildren(subcategory.id);
      totalDeleted++;
    }

    res.status(200).json({
      message: `All subcategories deleted successfully`,
      deletedCount: totalDeleted,
      parentCategory: {
        id: parentCategory.id,
        name: parentCategory.name,
        level: parentCategory.level
      }
    });
  } catch (err) {
    console.error('❌ Error in deleteSubcategories:', err);
    res.status(500).json({ error: err.message });
  }
};

// Delete a specific subcategory
exports.deleteSubcategory = async (req, res) => {
  try {
    const { parentId, subcategoryId } = req.params;

    console.log(`🗑️ Delete subcategory request: ${subcategoryId} from parent ${parentId}`);

    // Verify the subcategory belongs to the specified parent
    const subcategory = await Category.findOne({
      where: { 
        id: subcategoryId,
        parentId: parentId 
      }
    });

    if (!subcategory) {
      return res.status(404).json({ 
        error: 'Subcategory not found or does not belong to the specified parent' 
      });
    }

    const parentCategory = await Category.findByPk(parentId);
    
    // Check if subcategory has children
    const children = await Category.findAll({ where: { parentId: subcategoryId } });
    const hasChildren = children.length > 0;

    if (hasChildren) {
      return res.status(400).json({
        error: 'Subcategory has child items',
        message: `"${subcategory.name}" contains ${children.length} child item${children.length === 1 ? '' : 's'}.`,
        options: {
          deleteWithChildren: `Use the main delete endpoint with ?deleteSubcategories=true to delete with children`
        },
        subcategory: {
          id: subcategory.id,
          name: subcategory.name,
          level: subcategory.level,
          childrenCount: children.length
        }
      });
    }

    await subcategory.destroy();
    
    res.status(200).json({
      message: 'Subcategory deleted successfully',
      deletedSubcategory: {
        id: subcategory.id,
        name: subcategory.name,
        level: subcategory.level
      },
      parentCategory: {
        id: parentCategory.id,
        name: parentCategory.name
      }
    });
  } catch (err) {
    console.error('❌ Error in deleteSubcategory:', err);
    res.status(500).json({ error: err.message });
  }
};

// Safe delete with archive option (optional)
exports.safeDeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent } = req.query;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const children = await Category.findAll({ where: { parentId: id } });
    const hasChildren = children.length > 0;

    // Permanent deletion
    if (permanent === 'true') {
      if (hasChildren) {
        return res.status(400).json({ 
          error: 'Category has subcategories',
          message: 'Cannot permanently delete category with subcategories',
          subcategoriesCount: children.length
        });
      }

      await category.destroy();

      return res.status(200).json({
        message: 'Category permanently deleted',
        permanentlyDeleted: true
      });
    } 
    // Soft delete (archive) - if you have archive fields
    else {
      // If you have archive fields in your model
      await category.update({ 
        isActive: false,
        archivedAt: new Date()
      });

      return res.status(200).json({
        message: 'Category archived successfully',
        archived: true,
        category: {
          id: category.id,
          name: category.name,
          isActive: false,
          archivedAt: new Date()
        }
      });
    }
  } catch (err) {
    console.error('❌ Error in safeDeleteCategory:', err);
    res.status(500).json({ error: err.message });
  }
};