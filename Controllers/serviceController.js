const Service = require("../Models/cleaningServiceModel"); // Make sure this is serviceModel, not cleaningServiceModel

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
      status 
    } = req.body;

    console.log('Admin creating service:', { name, displayName, price, duration });

    // Validate required fields
    if (!name || !displayName || !price || !duration) {
      return res.status(400).json({ 
        message: 'Missing required fields: name, displayName, price, duration' 
      });
    }

    // Create service
    const service = await Service.create({ 
      name: name.trim(),
      displayName: displayName.trim(),
      description: description ? description.trim() : null,
      price: parseFloat(price),
      duration: parseInt(duration),
      features: features || [],
      status: status || 'active'
    });

    console.log('✅ Service created successfully with ID:', service.id);

    res.status(201).json({ 
      message: 'Service created successfully', 
      service: {
        id: service.id,
        name: service.name,
        displayName: service.displayName,
        description: service.description,
        price: service.price,
        duration: service.duration,
        features: service.features,
        status: service.status,
        createdAt: service.createdAt
      }
    });
  } catch (err) {
    console.error(' Error creating service:', err);
    
    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Service with this name already exists' 
      });
    }

    res.status(500).json({ 
      message: 'Server error while creating service'
    });
  }
};

// Get All Services (Admin only)
const getServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      order: [['createdAt', 'DESC']]
    });

    console.log(`📋 Retrieved ${services.length} services for admin`);

    res.status(200).json({ 
      services, 
      message: 'Services retrieved successfully',
      count: services.length
    });
  } catch (err) {
    console.error('❌ Error fetching services:', err);
    res.status(500).json({ 
      message: 'Server error while fetching services'
    });
  }
};

// Get Active Services (for customers)
const getActiveServices = async (req, res) => {
  try {
    const services = await Service.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']]
    });

    console.log(`📋 Retrieved ${services.length} active services for customers`);

    res.status(200).json({ 
      services, 
      message: 'Active services retrieved successfully',
      count: services.length
    });
  } catch (err) {
    console.error('❌ Error fetching active services:', err);
    res.status(500).json({ 
      message: 'Server error while fetching services'
    });
  }
};

// Update Service (Admin only)
const updateService = async (req, res) => {
  const { id } = req.params;
  const { 
    displayName, 
    description, 
    price, 
    duration, 
    features,
    status 
  } = req.body;

  try {
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const updateData = {};
    if (displayName) updateData.displayName = displayName.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (price) updateData.price = parseFloat(price);
    if (duration) updateData.duration = parseInt(duration);
    if (features) updateData.features = features;
    if (status) updateData.status = status;

    await service.update(updateData);

    console.log(`✅ Service ${id} updated successfully`);

    res.status(200).json({ 
      message: 'Service updated successfully', 
      service 
    });
  } catch (err) {
    console.error('❌ Error updating service:', err);
    res.status(500).json({ 
      message: 'Server error while updating service'
    });
  }
};

// Delete Service (Admin only)
const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findByPk(id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    await service.destroy();
    
    console.log(`🗑️ Service ${id} deleted successfully`);
    
    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting service:', err);
    res.status(500).json({ 
      message: 'Server error while deleting service'
    });
  }
};

module.exports = {
  createService,
  getServices,
  getActiveServices,
  updateService,
  deleteService
};