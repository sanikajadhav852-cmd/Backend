const express = require("express");
const router = express.Router();
const { login } = require("../controllers/authController");

router.post("/login", login);

router.get("/test", (req, res) => {
  res.send("Auth route working");
});
module.exports = router;
