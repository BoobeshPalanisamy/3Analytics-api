/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */

const ChatModel = require("../../database/models/chat");
const UserModel = require("../../database/models/user");

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.chat = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
    console.log(req.body);

    const [senderUser, receiverUser] = await Promise.all([
      UserModel.findById(sender),
      UserModel.findById(receiver),
    ]);

    if (!senderUser || !receiverUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const newMessage = new ChatModel({ sender, receiver, content });
    const savedMessage = await newMessage.save();

    res.json(savedMessage);
  } catch (error) {
    res.status(500).json({ error: "Message not sent." });
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    const messages = await ChatModel.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }, // In case the conversation can be in any order
      ],
    }).sort({ timestamp: 1 }); // You can sort the messages by timestamp if needed

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve messages." });
  }
};
