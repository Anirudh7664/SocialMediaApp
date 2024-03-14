const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
// const crypto = require('crypto');
// const sendMail = require('./sendMail')
// require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 3000;
// Importing the model from userModel
const URL = 'mongodb+srv://Anirudh_Randev:AnirudhMongo@mernstack.ayfakqv.mongodb.net/SocialMediaApp?retryWrites=true&w=majority';

mongoose
  .connect(URL)
  .then(() => app.listen(PORT))
  .then(() => console.log(`Connected To Database and listening at PORT ${PORT}`))
  .catch((err) => console.log(err));

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', UserSchema);

const PostSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  title: String,
  content: String,
});

const Post = mongoose.model('Post', PostSchema);

const contactSchema = new mongoose.Schema({
  email:String,
  query:String

})

const Contact = mongoose.model('Contact',contactSchema);



// Your routes and other code go here

app.post('/register', async (req, res) => {
  try {
    const hashedPassword = bcrypt.hashSync(req.body.password, 8);
    const user = new User({
      username: req.body.username, password: hashedPassword
    });
    // const exist = await User.findOne({ username: user.username });
    // if(exist){
    //   return res.status(300).send("User already exist");
    // }

    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});



app.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (user && bcrypt.compareSync(req.body.password, user.password)) {
      const token = jwt.sign({ userId: user._id }, 'YOUR_SECRET_KEY');
      res.json({ token });
    } else {
      res.status(401).send('Invalid credentials');
    }
  } catch (error) {
    res.status(500).send('Error during login');
  }
});


//login check with token generation............
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).send('A token is required for authentication');

  try {
    req.user = jwt.verify(token.split(' ')[1], 'YOUR_SECRET_KEY');
    next();
  } catch (err) {
    console.log(err)
    return res.status(403).send('Invalid Token');
  }

}


//create post
app.post('/posts', verifyToken, async (req, res) => {
  try {
    const post = new Post({ userId: req.user.userId, title: req.body.title, content: req.body.content });
    await post.save();
    res.status(201).send('Post created successfully');
  } catch (error) {
    res.status(500).send('Error creating post');
  }
});


//get all Posts
app.get('/allPost', verifyToken, async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).send('Error fetching posts');
  }
});

//get specific post
app.get('/allPost/:postId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.json(post);
  } catch (error) {
    res.status(500).send('Error fetching post');
  }
});


//update a post
app.put('/allPost/:postId', verifyToken, async (req, res) => {
  try {
    const post = await Post.findOne({
      _id: req.params.postId, userId:
        req.user.userId
    });
    if (!post) return res.status(404).send('Post not found or unauthorized');
    post.title = req.body.title;
    post.content = req.body.content;
    await post.save();
    res.status(200).send('Post updated successfully');
  } catch (error) {
    res.status(500).send('Error updating post');
  }
});



//delete a post
app.delete('/allPost/:postId', verifyToken, async (req, res) => {
  try {
    const result = await Post.findOneAndDelete({ _id: req.params.postId, userId: req.user.userId });
    if (!result) {
      res.status(200).send("Post Not Found");
    }
    res.status(200).send("Post Deleted Successfully");
  } catch (error) {
    res.status(500).send('Error deleting post');
  }
})

app.post('/contact', async (req, res) => {
  try {
    const { email, query } = req.body;

    const contactInstance = new Contact({
      email: email,
      query: query
    });

    const saved = await contactInstance.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error saving contact:', error);
    res.status(500).send('Internal Server Error');
  }
});




