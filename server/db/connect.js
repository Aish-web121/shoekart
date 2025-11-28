const mongoose = require("mongoose");

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected !")
  } catch (error) {
    console.error("error while connecting database!", error);
  }
};

module.exports = connectDatabase;
