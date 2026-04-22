import Post from '../models/Post.js';

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    const post = await Post.create({
      userId: req.user._id,
      content,
      image
    });
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('userId', 'name profilePic role company jobTitle')
      .populate('comments.userId', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    if (post.likes.includes(req.user._id)) {
      post.likes.pull(req.user._id);
    } else {
      post.likes.push(req.user._id);
    }
    
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) return res.status(404).json({ message: 'Post not found' });
    
    post.comments.push({ userId: req.user._id, text });
    await post.save();
    
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    console.log('GET /api/posts/user/' + req.params.userId);
    const posts = await Post.find({ userId: req.params.userId })
      .populate('userId', 'name profilePic role company jobTitle')
      .populate('comments.userId', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Error in getUserPosts:', error);
    res.status(500).json({ message: error.message });
  }
};
