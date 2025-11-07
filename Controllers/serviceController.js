const Service = require("../Models/cleaningServiceModel");
const { Op } = require('sequelize');

// Create Service (Admin only)
const createService = async (req, res) => {
  try {
    const { 
      name, 
      displayName, 
      description, 
      price, 
      duration, 
      features,
      icon,
      category,
      displayOrder,
      status 
    } = req.body;

    console.log('Admin creating service:', { name, displayName, price, duration, category });

    // Validate required fields
    if (!name || !displayName || !price || !duration || !category) {
      return res.status(400).json({ 
        success: false,
        message: 'Missing required fields: name, displayName, price, duration, category' 
      });
    }

    // Validate price and duration
    if (price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    if (duration < 1 || duration > 8) {
      return res.status(400).json({
        success: false,
        message: 'Duration must be between 1 and 8 hours'
      });
    }

    // Check if service name already exists
    const existingService = await Service.findOne({
      where: { name: name.trim() }
    });

    if (existingService) {
      return res.status(409).json({ 
        success: false,
        message: 'Service with this name already exists' 
      });
    }

    // Create service
    const service = await Service.create({ 
      name: name.trim(),
      displayName: displayName.trim(),
      description: description ? description.trim() : null,
      price: parseFloat(price),
      duration: parseInt(duration),
      features: Array.isArray(features) ? features : [],
      icon: icon || 'default-icon',
      category: category,
      displayOrder: displayOrder || 0,
      status: status || 'active'
    });

    console.log('✅ Service created successfully with ID:', service.id);

    res.status(201).json({ 
      success: true,
      message: 'Service created successfully', 
      data: {
        id: service.id,
        name: service.name,
        displayName: service.displayName,
        description: service.description,
        price: service.price,
        duration: service.duration,
        features: service.features,
        icon: service.icon,
        category: service.category,
        displayOrder: service.displayOrder,
        status: service.status,
        createdAt: service.createdAt
      }
    });
  } catch (err) {
    console.error('❌ Error creating service:', err);
    
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(error => ({
        field: error.path,
        message: error.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error while creating service',
      error: err.message
    });
  }
};

// Get All Services with filtering and pagination (Admin only)
const getServices = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      category,
      search 
    } = req.query;

    const where = {};
    
    if (status) where.status = status;
    if (category) where.category = category;
    
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { displayName: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: services } = await Service.findAndCountAll({
      where,
      order: [
        ['displayOrder', 'ASC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    console.log(`📋 Retrieved ${services.length} services for admin`);

    res.status(200).json({ 
      success: true,
      data: {
        services,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit)
        }
      },
      message: 'Services retrieved successfully'
    });
  } catch (err) {
    console.error('❌ Error fetching services:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching services',
      error: err.message
    });
  }
};

// Get Active Services (for customers - frontend)
const getActiveServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { status: 'active' },
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC']
      ],
      attributes: [
        'id', 
        'name', 
        'displayName', 
        'description', 
        'price', 
        'duration', 
        'features', 
        'icon', 
        'category',
        'displayOrder'
      ]
    });

    console.log(`📋 Retrieved ${services.length} active services for customers`);

    res.status(200).json({ 
      success: true,
      data: services,
      message: 'Active services retrieved successfully',
      count: services.length
    });
  } catch (err) {
    console.error('❌ Error fetching active services:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching services',
      error: err.message
    });
  }
};

// Get Service by ID
const getServiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findByPk(id);
    
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: service,
      message: 'Service retrieved successfully'
    });
  } catch (err) {
    console.error('❌ Error fetching service:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching service',
      error: err.message
    });
  }
};

// Update Service (Admin only)
const updateService = async (req, res) => {
  const { id } = req.params;
  const { 
    name,
    displayName, 
    description, 
    price, 
    duration, 
    features,
    icon,
    category,
    displayOrder,
    status 
  } = req.body;

  try {
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found' 
      });
    }

    // Check if name is being changed and if it conflicts with another service
    if (name && name !== service.name) {
      const existingService = await Service.findOne({
        where: { 
          name: name.trim(),
          id: { [Op.ne]: id }
        }
      });

      if (existingService) {
        return res.status(409).json({
          success: false,
          message: 'Service with this name already exists'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (displayName) updateData.displayName = displayName.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : null;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (features !== undefined) updateData.features = Array.isArray(features) ? features : service.features;
    if (icon !== undefined) updateData.icon = icon;
    if (category) updateData.category = category;
    if (displayOrder !== undefined) updateData.displayOrder = parseInt(displayOrder);
    if (status) updateData.status = status;

    await service.update(updateData);

    console.log(`✅ Service ${id} updated successfully`);

    res.status(200).json({ 
      success: true,
      message: 'Service updated successfully', 
      data: service
    });
  } catch (err) {
    console.error('❌ Error updating service:', err);
    
    if (err.name === 'SequelizeValidationError') {
      const errors = err.errors.map(error => ({
        field: error.path,
        message: error.message
      }));
      
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Server error while updating service',
      error: err.message
    });
  }
};

// Update Service Status (Activate/Deactivate)
const updateServiceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found' 
      });
    }

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active" or "inactive"'
      });
    }

    await service.update({ status });

    console.log(`✅ Service ${id} status updated to: ${status}`);

    res.status(200).json({ 
      success: true,
      message: `Service ${status === 'active' ? 'activated' : 'deactivated'} successfully`, 
      data: service
    });
  } catch (err) {
    console.error('❌ Error updating service status:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while updating service status',
      error: err.message
    });
  }
};

// Delete Service (Admin only - Soft delete by setting status to inactive)
const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ 
        success: false,
        message: 'Service not found' 
      });
    }

    // Instead of destroying, set status to inactive (soft delete)
    await service.update({ status: 'inactive' });
    
    console.log(`🗑️ Service ${id} soft deleted (set to inactive)`);
    
    res.status(200).json({ 
      success: true,
      message: 'Service deleted successfully' 
    });
  } catch (err) {
    console.error('❌ Error deleting service:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while deleting service',
      error: err.message
    });
  }
};

// Reorder Services (Admin only)
const reorderServices = async (req, res) => {
  try {
    const { orderUpdates } = req.body; // Array of { id, displayOrder }

    if (!Array.isArray(orderUpdates)) {
      return res.status(400).json({
        success: false,
        message: 'Order updates must be an array'
      });
    }

    const updatePromises = orderUpdates.map(update =>
      Service.update(
        { displayOrder: update.displayOrder },
        { where: { id: update.id } }
      )
    );

    await Promise.all(updatePromises);

    console.log(`🔄 Reordered ${orderUpdates.length} services`);

    res.status(200).json({
      success: true,
      message: 'Services reordered successfully'
    });
  } catch (err) {
    console.error('❌ Error reordering services:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while reordering services',
      error: err.message
    });
  }
};

// Get Service Statistics (Admin only)
const getServiceStats = async (req, res) => {
  try {
    const totalServices = await Service.count();
    const activeServices = await Service.count({ where: { status: 'active' } });
    const inactiveServices = await Service.count({ where: { status: 'inactive' } });
    
    const servicesByCategory = await Service.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category']
    });

    res.status(200).json({
      success: true,
      data: {
        totalServices,
        activeServices,
        inactiveServices,
        servicesByCategory
      },
      message: 'Service statistics retrieved successfully'
    });
  } catch (err) {
    console.error('❌ Error fetching service statistics:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching service statistics',
      error: err.message
    });
  }
};

module.exports = {
  createService,
  getServices,
  getActiveServices,
  getServiceById,
  updateService,
  updateServiceStatus,
  deleteService,
  reorderServices,
  getServiceStats
};