// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     unique: true,
//     required: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'user','guest'],
//     default: 'user',
//   },
// });

// module.exports = mongoose.model('User', userSchema);
// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { model, Schema } = require("mongoose");

// import { Schema, model, Document } from 'mongoose';

// interface Book {
//   title: string;
//   author: string;
// }

// interface User extends Document {
//   username: string;
//   password: string;
//   role: 'admin' | 'user';
//   books: Book[];
// }

const userSchema  = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'user','guest'],
    default: 'user',
  },
  
  books: [
    {
      title: {
        type: String,
        required: true,
      },
      author: {
        type: String,
        required: true,
      },
      borrowDate: {
        type: Date,
        default: null,
      },
    },
  ],
});
const UserModel = mongoose.model('User', userSchema);
module.exports = { UserModel }