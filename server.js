const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const db = require('./db');
const multer = require('multer');
const path = require('path');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// 🔧 Serve static files from public folder
app.use(express.static('public'));

// ✅ Explicitly serve uploaded profile photos
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const SECRET = process.env.JWT_SECRET;

// 📁 File Upload Config
const storage = multer.diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 🏠 Redirect root (/) to login
app.get('/', (req, res) => {
  res.redirect('/login.html');
});

// ---------------- AUTH ----------------

app.post('/api/register', upload.single('photo'), (req, res) => {
  const { name, email, password } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : null;

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).send(err);
    const sql = 'INSERT INTO users (name, email, password, photo) VALUES (?, ?, ?, ?)';
    db.query(sql, [name, email, hash, photo], (err) => {
      if (err) return res.status(500).send(err);
      res.send({ message: 'User registered successfully' });
    });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err || results.length === 0) return res.status(400).send({ error: 'Invalid email' });
    const user = results[0];
    bcrypt.compare(password, user.password, (err, match) => {
      if (!match) return res.status(400).send({ error: 'Invalid password' });
      const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1d' });
      res.send({ token });
    });
  });
});

// ------------- MIDDLEWARE -------------
function verifyToken(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.status(403).send({ error: 'Token required' });
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).send({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// ------------- PROFILE ----------------

app.get('/api/profile', verifyToken, (req, res) => {
  const sql = 'SELECT id, name, email, photo FROM users WHERE id = ?';
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results[0]);
  });
});

app.put('/api/profile', verifyToken, (req, res) => {
  const { name, email } = req.body;
  const sql = 'UPDATE users SET name = ?, email = ? WHERE id = ?';
  db.query(sql, [name, email, req.user.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Profile updated' });
  });
});

// ---------------- BOOKS ----------------

app.get('/api/books', (req, res) => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.get('/api/books/:id', (req, res) => {
  db.query('SELECT * FROM books WHERE id = ?', [req.params.id], (err, results) => {
    if (err || results.length === 0) return res.status(404).send({ error: 'Book not found' });
    res.send(results[0]);
  });
});

app.post('/api/books', verifyToken, (req, res) => {
  const { title, author, price, description } = req.body;
  const sql = 'INSERT INTO books (title, author, price, description) VALUES (?, ?, ?, ?)';
  db.query(sql, [title, author, price, description], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Book added' });
  });
});

app.put('/api/books/:id', verifyToken, (req, res) => {
  const { title, author, price, description } = req.body;
  const sql = 'UPDATE books SET title=?, author=?, price=?, description=? WHERE id=?';
  db.query(sql, [title, author, price, description, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Book updated' });
  });
});

app.delete('/api/books/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM books WHERE id=?', [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Book deleted' });
  });
});

// ---------------- CART ----------------

app.post('/api/cart', verifyToken, (req, res) => {
  const { book_id } = req.body;
  const user_id = req.user.id;

  db.query('SELECT * FROM cart WHERE user_id = ? AND book_id = ?', [user_id, book_id], (err, results) => {
    if (err) return res.status(500).send(err);
    if (results.length > 0) {
      db.query('UPDATE cart SET quantity = quantity + 1 WHERE user_id = ? AND book_id = ?', [user_id, book_id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Book quantity updated in cart' });
      });
    } else {
      db.query('INSERT INTO cart (user_id, book_id, quantity) VALUES (?, ?, 1)', [user_id, book_id], (err) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Book added to cart' });
      });
    }
  });
});

app.get('/api/cart', verifyToken, (req, res) => {
  const sql = `
    SELECT cart.id, cart.book_id, cart.quantity, books.title, books.author, books.price 
    FROM cart
    JOIN books ON cart.book_id = books.id
    WHERE cart.user_id = ?
  `;
  db.query(sql, [req.user.id], (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
});

app.delete('/api/cart/:id', verifyToken, (req, res) => {
  db.query('DELETE FROM cart WHERE id = ? AND user_id = ?', [req.params.id, req.user.id], (err) => {
    if (err) return res.status(500).send(err);
    res.send({ message: 'Item removed from cart' });
  });
});

// ------------- START SERVER -------------
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
