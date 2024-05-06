const express = require("express");
const User = require("../models/userModel");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateToken, jwtAuthMiddleware } = require("../auth/jwtAuth");

//Signup Route 
router.post("/signup", async (req, res) => {
  try {
    console.log("Req.body is here", req.body);
    const data = req.body; //asuming the request body contains user data
    if (!data) return res.status(400).json({ message: "All fields Required!" });

    const user = await new User(data);
    if (!user) {
      return res.status(500).json({
        success: false,
        message: "Unable to SignUp, Please try again!",
      });
    }
    const password = data.password;
    if (!password)
      return res.status(400).json({ message: "Password Required !" });

    const payload = { id: user.id };
    const token = generateToken(payload);

    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Singup Successfully", token });
  } catch (error) {
    console.log("Error Occoured : ", error);
    throw error;
  }
});


// Login Route
router.post("/login", async (req, res) => {
  const { aadharCardNumber, password } = req.body;
  if (!(aadharCardNumber && password)) {
    return res
      .status(400)
      .json({ success: false, message: "All fields Required!" });
  }
  const user = await User.findOne({ aadharCardNumber });
  if (!user) return res.status(400).json({ message: "User Not Found!" });
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch)
    {return res
      .status(400)
      .json({ success: false, message: "Invalid Credentials!" });}

  const payload = { id: user.id };
  const token = generateToken(payload);

   res
    .status(200)
    .json({ success: true, message: "User LoggedIn Successfully!", token });
});

// Get Profile route
router.get("/profile", jwtAuthMiddleware, async (req, res) => {
  try {
    const data = req.user;
    const userId = data.id;
    const user = await User.findById(userId);
    res.status(200).json({ success: true, message: "User Profile : ", user });
  } catch (error) {
    console.log("Error in Finding User Profile : ", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//Update passsword  Route
router.put("/profile/password", jwtAuthMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    const isPasswordMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Password!" });
    }

    user.password = newPassword;
    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Password Updated Successfully" });
  } catch (error) {
    console.log("Error in Updating Passoword : ", error);
    res.status(500).json({ success: false, message: "Internal Server Error!" });
  }
});

module.exports = router;
