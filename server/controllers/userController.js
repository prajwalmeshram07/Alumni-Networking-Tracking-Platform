import User from '../models/User.js';

export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user._id);

    if (userToFollow.id === currentUser.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    if (!currentUser.connections.includes(userToFollow.id)) {
      await currentUser.updateOne({ $push: { connections: userToFollow.id } });
      await userToFollow.updateOne({ $push: { connections: currentUser.id } }); // Mutual connection for simplicity
      res.status(200).json({ message: "User followed and connected" });
    } else {
      res.status(403).json({ message: "You already follow this user" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getConnections = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('connections', 'name profilePic email');
    res.status(200).json(user.connections);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      if (req.body.skills !== undefined) {
        user.skills = Array.isArray(req.body.skills) ? req.body.skills : req.body.skills.split(',').map(s=>s.trim());
      }
      user.company = req.body.company !== undefined ? req.body.company : user.company;
      user.jobTitle = req.body.jobTitle !== undefined ? req.body.jobTitle : user.jobTitle;
      user.city = req.body.city !== undefined ? req.body.city : user.city;
      user.state = req.body.state !== undefined ? req.body.state : user.state;
      user.country = req.body.country !== undefined ? req.body.country : user.country;
      user.profilePic = req.body.profilePic !== undefined ? req.body.profilePic : user.profilePic;
      
      const geoQuery = [user.city, user.state, user.country].filter(Boolean).join(', ');
      
      if (geoQuery.trim() !== '') {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(geoQuery)}&format=json&limit=1`, {
            headers: { 'User-Agent': 'AluminayeProject/1.0' }
          });
          const geoData = await response.json();
          if (geoData && geoData.length > 0) {
            user.location = {
              lat: parseFloat(geoData[0].lat),
              lng: parseFloat(geoData[0].lon)
            };
          }
        } catch (err) {
          console.error('Geocoding Error:', err);
        }
      }
      
      const updatedUser = await user.save();
      res.json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } }).select('name profilePic role email connections company city state country location');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    console.log('GET /api/users/' + req.params.id);
    const user = await User.findById(req.params.id).select('-password');
    if (user) {
      res.json(user);
    } else {
      console.log('User not found: ' + req.params.id);
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: error.message });
  }
};
