const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profule = require('../../models/Profile');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

//@route    POST  /api/posts
//@desc     create a new post.
//@access   private.
router.post(
  '/',
  [auth, [check('text', 'text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findOne({ _id: req.user.id }).select('-password');
      const newPost = new Post({
        user: req.user.id,
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('server error');
    }
  }
);

//@route    GET  /api/posts
//@desc     get all posts
//@access   private.
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server error');
  }
});

//@route    POST  /api/posts/:post_id
//@desc     get a post by post_id.
//@access   private.
router.get('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.json(post);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.status(500).send('server error');
  }
});

//@route    DELETE  /api/posts/:post_id
//@desc     delete a post by post_id.
//@access   private.
router.delete('/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }

    //check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'user not authorized' });
    }
    await post.remove();
    res.status(200).json({ msg: 'post removed' });
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.status(500).send('server error');
  }
});

//@route    PUT  /api/posts/like/:post_id
//@desc     add a like to a post by post_id
//@access   private
router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }
    const like = post.likes.find(
      (like) => like.user.toString() === req.user.id
    );
    if (like) {
      return res.status(400).json({ msg: 'post already liked by user' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.status(500).send('server error');
  }
});

//@route    DELETE  /api/posts/unlike/:post_id
//@desc     remove a like from a post by post_id
//@access   private
router.delete('/unlike/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    //check if the post has already been liked
    if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(400).json({msg: 'post has not yet been liked'});
    }

    //get removed index
    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
    // if (!post) {
    //   return res.status(404).json({ msg: 'post not found' });
    // }
    // let likesL = post.likes.length;
    // const likes = post.likes.filter(
    //   (like) => like.user.toString() !== req.user.id
    // );
    // if (likes.length === likesL) {
    //   return res.status(400).json({ msg: "post has't yet been liked by user" });
    // }
    // post.likes = likes;
    // await post.save();
    // res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('server error');
  }
});


//@route    PUT  /api/posts/comment/:post_id
//@desc     add a comment to a post by post_id
//@access   private
router.put(
  '/comment/:post_id',
  [auth, [check('text', 'text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    try {
      const post = await Post.findById(req.params.post_id);
      if (!post) {
        console.log('post not found');
        return res.status(404).json({ msg: 'post not found' });
      }
      const user = await User.findById(req.user.id).select('-password');
      const newComment = {
        user: req.user.id,
        name: user.name,
        avatar: user.avatar,
        text: req.body.text,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.log(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'post not found' });
      }
      res.status(500).send('server error');
    }
  }
);

//@route    DELETE  /api/posts/uncomment/:post_id/:comment_id
//@desc     remove a comment from a post by post_id and comment_id
//@access   private
router.delete('/uncomment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    //check post exists
    if (!post) {
      return res.status(404).json({ msg: 'post not found' });
    }

    const comment = await post.comments.find(
      (comment) => comment.id.toString() === req.params.comment_id
    );

    //check comment exists
    if (!comment) return res.status(404).json({ msg: 'comment not found' });

    //check user
    if (comment.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'user not authorized' });

    const newComments = post.comments.filter(
      (comment) => comment.id.toString() !== req.params.comment_id
    );

    post.comments = newComments;
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.log(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'post not found' });
    }
    res.status(500).send('server error');
  }
});
module.exports = router;
