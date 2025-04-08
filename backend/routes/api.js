const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');

// --- VERY BASIC "AUTH" (INSECURE) ---
let loggedInUser = null; // Global variable to store the logged-in user (HIGHLY INSECURE)

// @route   POST /api/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        if (!username || !email || !password || !role) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        user = new User({ username, email, password, role });
        await user.save();
        res.status(201).json({ msg: 'User registered', userId: user._id }); // Return user ID
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   POST /api/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password }); // Insecure: Direct password comparison
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }
		loggedInUser = user; //VERY INSECURE
        res.json({ msg: 'Logged in', userId: user._id, role: user.role });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/user  (VERY SIMPLIFIED)
router.get('/user', (req, res) => {
    if (loggedInUser) {
      res.json({ userId: loggedInUser._id, username: loggedInUser.username, role: loggedInUser.role });
    } else {
        res.status(401).json({ msg: 'Not logged in' });
    }
});
// --- Product Routes ---

// @route   POST /api/products
router.post('/products', async (req, res) => {
  try {
      if (!loggedInUser || loggedInUser.role !== 'seller') {
          return res.status(403).json({ msg: 'Not authorized' });
      }

      const { name, description, startingBid, images, endDate } = req.body;
      if (!name || !description || !startingBid || !endDate) {
        return res.status(400).json({ msg: 'Please enter all required fields' });
      }
      const newProduct = new Product({
          seller: loggedInUser._id, // Use the loggedInUser's ID
          name,
          description,
          startingBid,
          currentBid: startingBid,
          images,
          endDate,
      });

      const product = await newProduct.save();
      res.json(product);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

// @route   GET /api/products
router.get('/products', async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ endDate: 1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// @route   GET /api/products/:id
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
         if (err.kind === 'ObjectId') { // Handle invalid ObjectId
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server error');
    }
});

// @route   POST /api/products/:id/bid
router.post('/products/:id/bid', async (req, res) => {
  try {
      if (!loggedInUser) {
        return res.status(401).json({ msg: 'Not logged in' });
      }

      const product = await Product.findById(req.params.id);
      if (!product || !product.isActive) {
          return res.status(404).json({ msg: 'Product not found or auction has ended' });
      }
      if (new Date() > new Date(product.endDate)) {
          return res.status(400).json({msg: "Auction has ended"})
      }
      if (product.seller.toString() === loggedInUser._id.toString()) {
          return res.status(400).json({ msg: 'Sellers cannot bid on their own products' });
      }
      const { amount } = req.body;
      if (amount <= product.currentBid) {
          return res.status(400).json({ msg: 'Bid must be higher than the current bid' });
      }

      product.currentBid = amount;
      product.currentBidder = loggedInUser._id; // Use loggedInUser's ID
      await product.save();

      res.json(product);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Product not found' });
    }
    res.status(500).send('Server error');
  }
});
module.exports = router;