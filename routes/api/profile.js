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

//@route    GET  /api/profile/user/:user_id
//@desc     get profile by userId
//@access   public
router.get('/user', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.query.user_id,
    }).populate('user', ['name', 'avatar']);
    if (!profile) return res.status(400).json({ msg: 'profile not found' });
    res.json(profile);
  } catch (err) {
    console.log(err.message);
    if (err.kind == 'ObjectId')
      return res.status(400).json({ msg: 'profile not found' });
    res.status(500).send('server error');
  }
});

//@route    DELETE  /api/profile
//@desc     delete user profile
//@access   private
router.delete('/', auth, async (req, res) => {
  try {
    //todo: remove posts of user

    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });

    //remove user
    await User.findOneAndRemove({ _id: req.user.id });
    res.json({ msg: 'user removed' });
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server error');
  }
});

//@route    PUT  /api/profile/experience
//@desc     add user experience in profile
//@access   private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'title is required').not().isEmpty(),
      check('company', 'company is required').not().isEmpty(),
      check('from', 'from date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(500).json({ errors: errors.array() });
    }
    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;
    const newExp = { title, company, location, from, to, current, description };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('server error');
    }
  }
);

//@route    DELETE  /api/profile/experience/:exp_id
//@desc     delete user experience by experience_id in profile
//@access   private
router.delete('/experience', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const expUpdated = profile.experience.filter(
      (currExp) => !(currExp._id == req.query.exp_id)
    );
    profile.experience = expUpdated;
    await profile.save();
    res.json(profile.experience);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server error');
  }
});

//@route    PUT  /api/profile/education
//@desc     add user education in profile
//@access   private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'school is required').not().isEmpty(),
      check('degree', 'degree is required').not().isEmpty(),
      check('fieldofstudy', 'fieldofstudy is required').not().isEmpty(),
      check('from', 'from date is required').not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(500).json({ errors: errors.array() });
    }
    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    } = req.body;
    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description,
    };
    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send('server error');
    }
  }
);

//@route    DELETE  /api/profile/education/:edu_id
//@desc     delete user education by education_id in profile
//@access   private
router.delete('/education', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });
    const eduUpdated = profile.education.filter(
      (currEdu) => !(currEdu._id == req.query.edu_id)
    );
    profile.education = eduUpdated;
    await profile.save();
    res.json(profile.education);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('server error');
  }
});

module.exports = router;
