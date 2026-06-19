require("dotenv").config();
const mongoose = require("mongoose");
const logger = require("./middleware/logger");

const connectToDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    logger.error("FATAL: MONGO_URI is not set. Add your MongoDB Atlas connection string to server/.env.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    logger.info("MongoDB connection successful");
    return mongoose.connection;
  } catch (err) {
    logger.error({ err }, "MongoDB connection failed");
    process.exit(1);
  }
};

module.exports = connectToDB;
