/**
 * @typedef {import('express').Request} Request
 * @typedef {import('express').Response} Response
 */
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { randomBytes } = require("crypto");
const UserModel = require("../../database/models/user");
const SECRET_KEY = "CVHQDs848v";
const ACCESS_TOKEN = "Analytics_access_token";
const ExpirationInMilliSeconds = 172800000; //2 days

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.login = async (req, res, next) => {
  let { phoneNumber, password } = req.body;

  if (phoneNumber === "" || password === "") {
    const error = new Error("Empty credentials supplied");
    error.statusCode = 454;
    throw error;
  } else {
    try {
      const user = await UserModel.findOne({ phoneNumber });
      if (!user) {
        const error = new Error("User Not Available Please Signup to continue");
        error.statusCode = 401;
        throw error;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        const error = new Error("Invalid credentials entered!");
        error.statusCode = 400;
        throw error;
      }

      if (user.role !== "user") {
        const error = new Error("Invalid credentials entered!");
        error.statusCode = 500;
        throw error;
      }

      var userObj = {
        userId: user._id,
        phoneNumber: user.phoneNumber,
        name: user.name,
      };

      const token = jwt.sign(userObj, SECRET_KEY);

      res.cookie(ACCESS_TOKEN, token, {
        httpOnly: true,
        maxAge: ExpirationInMilliSeconds, //2 days
      });

      res.status(200).json({
        message: "Signin successful",
        data: userObj,
      });
    } catch (error) {
      console.error(error);
      next(error);
    }
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.signup = async (req, res, next) => {
  let { name, phoneNumber, email, password, role } = req.body;
  console.log(req.body);

  try {
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ phoneNumber });
    if (existingUser) {
      const error = new Error(
        "Invalid User with provided phonenumber already exists entered!"
      );
      error.statusCode = 409;
      throw error;
    } else {
      const salt = 10;
      const hashedPassword = await bcrypt.hash(password, salt);
      const newUser = new UserModel({
        name,
        phoneNumber,
        email,
        password: hashedPassword,
        role,
      });
      const savedUser = await newUser.save();
      // Generate JWT token
      const token = jwt.sign(
        {
          userId: savedUser._id,
          phoneNumber: savedUser.phoneNumber,
          name: savedUser.name,
        },
        SECRET_KEY
      );

      res
        .cookie(ACCESS_TOKEN, token, {
          httpOnly: true,
          maxAge: ExpirationInMilliSeconds, //2days
        })
        .status(200)
        .json({
          message: "Signup Successful",
          data: {
            userId: savedUser._id,
            phoneNumber: savedUser.phoneNumber,
            name: savedUser.name,
          },
        });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.logout = async (req, res) => {
  res.clearCookie(ACCESS_TOKEN);
  res.status(200).json({
    status: true,
    message: "Logged out successfully",
    data: null,
  });
};

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */
exports.isAuthorized = async (req, res) => {
  const { Analytics_access_token } = req.cookies;

  if (Analytics_access_token) {
    // Check if the access token is valid
    const payload = await validateAccessToken(Analytics_access_token);
    if (payload) {
      res.json(payload);
    } else {
      res.json(null);
    }
  } else {
    res.json(null);
  }
};

async function validateAccessToken(token) {
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const { userId } = decoded;

    // Check if the userId exists in the UserModel database
    const user = await UserModel.findById(userId);
    if (!user) {
      return null;
    }
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * @param {Request} req - The Express request object
 * @param {Response} res - The Express response object
 */

exports.getUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Query the database to find all users except the given user
    const users = await UserModel.find({ _id: { $ne: userId } });

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
