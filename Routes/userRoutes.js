const express =require('express');
const router =express.Router();

const {createUser,userInfo, getAllUsers, updateUser, deleteUser} =require("../Controllers/userController");
const authenticate =require("../Utils/authenticate")
router.post("/api/user/create",createUser);
router.get("/api/user/getUser/:id", userInfo);
router.get("/api/user/getUsers", authenticate, getAllUsers);
router.put("/api/user/update/:id", updateUser);
router.delete("/api/user/delete/:id", deleteUser);

module.exports =router