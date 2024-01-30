const { connect,mongoose  } = require("mongoose")


const connectDb = async () => {
  return connect(process.env.DB_URI, { dbName: process.env.DB_NAME })
}
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = { connectDb }
