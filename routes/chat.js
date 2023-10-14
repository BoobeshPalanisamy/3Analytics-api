var express = require("express");
var router = express.Router();
const chatContoller = require("../controllers/chat/chatController");
const { useAuth } = require("../middleware/middleware");

// Custom function to wrap route handlers in a Promise for consistent error handling
const use = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Route to send a chat message (requires authentication)
router.post("/chat", useAuth, use(chatContoller.chat));
// Route to get chat messages (requires authentication)
router.post("/getMessages", useAuth, use(chatContoller.getMessages));

module.exports = router;
