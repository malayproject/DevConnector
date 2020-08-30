const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true,
    });
    console.log('database connected');
  } catch (err) {
    console.error('exit process with database connection failure');
    console.error(err);
    process.exit(1);
  }
};
module.exports = connectDB;
