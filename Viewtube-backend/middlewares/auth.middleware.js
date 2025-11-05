import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import ApiError from '../utils/ApiError.js';

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new ApiError(401, 'No authentication token provided');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = { id: user._id.toString(), username: user.username };
    next();
  } catch (error) {
    next(new ApiError(401, 'Please authenticate'));
  }
};

export default authMiddleware;