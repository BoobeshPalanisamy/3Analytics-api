var express = require("express");
var router = express.Router();
const userController = require("../controllers/user/userController");
const { useAuth } = require("../middleware/middleware");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/login", use(userController.login));
router.post("/signup", use(userController.signup));
router.get("/logout", use(userController.logout));
router.get("/isAuthorized", use(userController.isAuthorized));
router.get("/getUser/:userId", useAuth, use(userController.getUser));

module.exports = router;
