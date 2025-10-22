const SubCategory = require('../Models/subCategoryModel');

exports.createSubCategory = async (req, res) => {
  try {
    const subcategory = await SubCategory.create(req.body);
    res.status(201).json(subcategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getSubCategories = async (req, res) => {
  try {
    const subcategories = await SubCategory.findAll();
    res.status(200).json(subcategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubCategoriesByParent = async (req, res) => {
  try {
    const { parentId } = req.params;
    const subcategories = await SubCategory.findAll({
      where: { parentId }
    });
    res.status(200).json(subcategories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSubCategoryById = async (req, res) => {
  try {
    const subcategory = await SubCategory.findByPk(req.params.id);
    if (!subcategory) return res.status(404).json({ error: 'SubCategory not found' });
    res.status(200).json(subcategory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSubCategory = async (req, res) => {
  try {
    const subcategory = await SubCategory.findByPk(req.params.id);
    if (!subcategory) return res.status(404).json({ error: 'SubCategory not found' });
    await subcategory.update(req.body);
    res.status(200).json(subcategory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const subcategory = await SubCategory.findByPk(req.params.id);
    if (!subcategory) return res.status(404).json({ error: 'SubCategory not found' });
    await subcategory.destroy();
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 