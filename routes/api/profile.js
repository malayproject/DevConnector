const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route     GET  /api/profile/me
//@desc     get current user's profile
//@access   private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) {
      return res
        .status(400)
        .json({ msg: "profile doesn't exist for this user" });
    }
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server error');
  }
});

//@route    POST  /api/profile
//@desc     create or update current user's profile
//@access   private
router.post(
  '/',
  [
    auth,
    [
      check('status', 'status is required').not().isEmpty(),
      check('skills', 'skills is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    //build profile
    const profileFields = {};
    profileFields.social = {};
    profileFields.user = req.user.id;
    profileFields.status = status;
    profileFields.skills = skills.split(',').map((skill) => skill.trim());
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;
    if (youtube) profileFields.social.youtube = youtube;
    if (facebook) profileFields.social.facebook = facebook;
    if (twitter) profileFields.social.twitter = twitter;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;
    console.log(profileFields);
    try {
      let profile = await Profile.findOne({ user: req.user.id });

      //update profile
      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        console.log('profile updated');
        return res.json(profile);
      }
      //create profile
      profile = new Profile(profileFields);
      await profile.save();
      console.log('new profile created');
      res.json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).send('server error');
    }
  }
);

//@route    GET  /api/profile
//@desc     get all profiles
//@access   public
router.get('/', async (req, res) => {
  try {
    let profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server error');
  }
});
module.exports = router;
