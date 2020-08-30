const express = require('express');
const router = express.Router();

//@route    /api/posts
//@desc     test route for posts.
//@access   public.
router.get('/', (req, res) => res.send('posts page showing.'));

module.exports = router;
