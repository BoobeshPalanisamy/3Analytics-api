var express = require("express");
var router = express.Router();
const userController = require("../controllers/user/userController");
const { useAuth } = require("../middleware/middleware");

// Custom function to wrap route handlers in a Promise for consistent error handling
const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Route for user login
router.post("/login", use(userController.login));
// Route for user signup
router.post("/signup", use(userController.signup));
// Route for user logout
router.get("/logout", use(userController.logout));
// Route to check user authorization
router.get("/isAuthorized", use(userController.isAuthorized));
// Route to get user data by user ID (requires authentication)
router.get("/getUser/:userId", useAuth, use(userController.getUser));

module.exports = router;
