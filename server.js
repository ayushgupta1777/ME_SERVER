

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3001;
const jwtSecret = 'anything';

const dotenv = require("dotenv")
dotenv.config()
const morgan = require("morgan")
const cookieParser = require("cookie-parser")
const sessions = require("express-session")
// const { apiV1 } = require("./routes")

const { connectDb } = require("./db")
const { UserModel } = require("./models/User")
// const { BookModel } = require("./models/book")
// const { Expense } =  require("./models/expense")

const { Server } = require("socket.io");
const http = require("http");



app.use(express.json());



app.use(cors());

// const server = http.createServer(app);
const server = app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: "https://me-ayush.web.app",
    methods: ["GET", "POST"],
  },
}
);

io.on("connection", (socket) => {
  // console.log(`User Connected: ${socket.id}`);

  // socket.on("join_room", (data) => {
  //   socket.join(data);
  // });

  socket.on("send_message", (data) => {
    io.emit("receive_message_ad", data);
  });

  socket.on("send_message_ad",(data) =>{
    io.emit("receive_message", data);
  })

  // socket.on("send_message", (data) =>{
  //   io.emit("admin recive",data);
  // })
});



connectDb()
  // .then(async () => {
  //   const admin = await UserModel.findOne({ username: "admin" })
  //   if (admin == null) {
  //     await UserModel.create({ username: "admin", password: "admin", role: "admin" })
  //   }
  //   const guest = await UserModel.findOne({ username: "guest" })
  //   if (guest == null) {
  //     await UserModel.create({ username: "guest", password: "guest", role: "guest" })
  //   }
  // })

  app.get('/api/book', async (req, res) => {
    try {
      const book = await BookModel.find();
      res.status(200).json(book);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get boxes' });
    }
  });

// Middleware to authenticate user

const authenticateUser = (req, res, next) => {
  const token = req.header('x-auth-token');
  console.log('Received token:', token);

  if (!token) {
    return res.status(401).json({ error: 'Authorization denied' });
  }

try {
    // Decode the token without verification
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      return res.status(401).json({ error: 'Token is not valid' });
    }

    console.log('Decoded user:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Token is not valid' });
  }
};

app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new UserModel({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/api/login',async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username });

    if (user && bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user._id, username: user.username, role: user.role }, jwtSecret, { expiresIn: '1h' });
      res.json({ token });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error in login endpoint:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

  // const { username, password } = req.body;

  // // Check credentials
  // if (username === dummyUser.username && bcrypt.compareSync(password, dummyUser.password)) {
  //   // Generate a token
  //   const token = jwt.sign({ userId: dummyUser.id, username: dummyUser.username, role: dummyUser.role}, jwtSecret, { expiresIn: '1h' });
  //   res.json({ token });
  // } else {
  //   res.status(401).json({ error: 'Invalid credentials' });
  // }
});
// })
app.get('/api/admin-action', authenticateUser, (req, res) => {
  const user = req.user;
  if (user.role !== 'admin') {
    return res.status(403).json({ msg: 'Permission denied' });
  }

  res.json({ role: user.role, message: 'Admin action successful!' });
});

// Registration endpoint

app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new UserModel({ username, password });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Protected endpoint to get user information
app.get('/api/user', authenticateUser, (req, res) => {
    try {
     console.log('Decoded user%:', req.user);
      const { userId, username, role} = req.user;
      res.json({ userId, username, role});
    } catch (error) {
      console.error('Error in /api/user endpoint:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // app.get('/api/expenses', async (req, res) => {
  //   try {
  //     const expenses = await Expense.find();
  //     res.json(expenses);
  //   } catch (error) {
  //     console.error('Error fetching expenses:', error);
  //     res.status(500).json({ error: 'Internal Server Error' });
  //   }
  // });
  


  // Endpoint to add a new expense
  // app.post('/api/expenses', async (req, res) => {
  //   try {
  //     const newExpense = req.body;
      
      // Check if all required fields are present
      // if (!newExpense.name || !newExpense.isbn || !newExpense.category || !newExpense.price || !newExpense.quantity) {
      //   return res.status(400).json({ error: 'All fields are required' });
      // }
  
  //     const createdExpense = await Expense.create(newExpense);
  //     res.json(createdExpense);
  //   } catch (error) {
  //     console.error('Error adding expense:', error);
  //     res.status(500).json({ error: 'Internal Server Error' });
  //   }
  // });

  // app.post("/api/books", async (req, res) => {
  //   try {
  //     const newBook = new BookModel(req.body);
  //     const savedBook = await newBook.save();
  //     res.status(201).json(savedBook);
  //   } catch (error) {
  //     console.error("Error adding book:", error);
  //     res.status(500).json({ error: "Internal Server Error" });
  //   }
  // });
  
  // app.delete('/api/books/:id', async (req, res) => {
  //   const bookId = req.params.id;
  //   try {
  //     const deletedBook = await BookModel.findByIdAndDelete(bookId);
  
  //     if (!deletedBook) {
  //       res.status(404).json({ error: 'Book not found' });
  //       return;
  //     }
  
  //     res.status(200).json(deletedBook);
  //   } catch (error) {
  //     console.error('Error deleting book:', error);
  //     res.status(500).json({ error: 'Internal Server Error' });
  //   }
  // });


  // // app.post('/api/add-book/:userId', async (req, res) => {
  // //   const { userId } = req.params;
  // //   try {
  //     // Check if the user is an admin
  //     // if (req.user.role == 'admin') {
  //     //   return res.status(403).json({ message: 'Permission denied' });
  //     // }
  
      
  //     console.log('User ID:', userId);
  //     const { title, author } = req.body;
  
  //     // Add the book to the user's account
  //     const user = await UserModel.findOne({ _id: userId });
  
  //     // if (!user) {
  //     //   return res.status(404).json({ message: 'User not found' });
  //     // }

  
  //     user.books.push({ title, author, borrowDate: new Date() });
  //     await user.save();
  
  //     return res.status(200).json({ message: 'Book added successfully' });
  //   } catch (error) {
  //     console.error('Error adding book:', error.message);
  //     res.status(500).json({ message: 'Internal server error' });
  //   }
  // });

//   app.get('/api/issued-books/:userId', async (req, res) => {
//     try {
//       const { userId } = req.params;
  
//       // Find the user by ID
//       const user = await UserModel.findOne({ _id: userId });
  
//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       // Retrieve issued books for the user
//       const issuedBooks = user.books;
//       res.status(200).json({ issuedBooks });
//     } catch (error) {
//       console.error('Error fetching issued books:', error.message);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });



//   // Fetch User's Books
// app.get('/api/user-books/:userId', async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const user = await UserModel.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     return res.status(200).json({ books: user.books });
//   } catch (error) {
//     console.error('Error fetching user books:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Delete Book
// app.delete('/api/delete-book/:userId/:bookId', async (req, res) => {
//   try {
//     const { userId, bookId } = req.params;
//     const user = await UserModel.findById(userId);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Find the index of the book in the user's books array
//     const bookIndex = user.books.findIndex((book) => book._id.toString() === bookId);

//     if (bookIndex === -1) {
//       return res.status(404).json({ message: 'Book not found for the user' });
//     }

//     // Remove the book from the user's books array
//     user.books.splice(bookIndex, 1);
//     await user.save();

//     return res.status(200).json({ message: 'Book deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting book:', error.message);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });
  

