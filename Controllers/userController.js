const User =require("../Models/userModel");
const createUser = async (req, res)=>{
    const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Simulate user creation logic
  res.status(201).json({
    message: 'User created successfully',
    user: { name, email },
});
console.log(name, email, password)
}


// Get User Info
const userInfo = async (req, res) => {
    try {
      const user = await User.findByPk(req.user.userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      res.json({ user });
    } catch (error) {
      console.error("Error fetching user info", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  const getAllUsers = async (req, res) => {
    try {
      // Extract user info from request (assuming middleware handles authentication)
      const user = req.user; // This should be set in an authentication middleware
  
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
      }
  
      // Fetch all users since the requester is an admin
      const users = await User.findAll();
      res.status(200).json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  
  // Update User (Including Role)
  const updateUser = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role } = req.body;
  
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
      }
  
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // Update user details
      user.name = name || user.name;
      user.email = email || user.email;
      user.role = role || user.role; // Update role if provided
  
      await user.save();
      res.status(200).json({ message: "User updated successfully", user });
    } catch (error) {
      console.error("Error updating user", error);
      res.status(500).json({ message: "Server error" });
    }
  };
  
  // Delete User (Admin Only)
  const deleteUser = async (req, res) => {
    try {
      if (req.user.role !== "admin") {
        return res.status(403).json({ message: "Access denied. Admins only." });
      }
  
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      await user.destroy();
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user", error);
      res.status(500).json({ message: "Server error" });
    }
  };

module.exports={deleteUser, createUser, updateUser, deleteUser,getAllUsers,userInfo}
