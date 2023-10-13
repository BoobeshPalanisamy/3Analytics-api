var express = require("express");
var router = express.Router();
const chatContoller = require("../controllers/chat/chatController");
const { useAuth } = require("../middleware/middleware");

const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post("/chat", useAuth, use(chatContoller.chat));
router.post("/getMessages", useAuth, use(chatContoller.getMessages));

module.exports = router;
