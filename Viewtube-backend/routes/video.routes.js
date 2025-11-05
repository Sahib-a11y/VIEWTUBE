import express from 'express';
import * as videoController from '../controllers/video.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/trending', videoController.getTrendingVideos);
router.get('/search', videoController.searchVideos);
router.get('/:id', videoController.getVideoById);
router.post('/:id/like', authMiddleware, videoController.likeVideo);
router.post('/:id/dislike', authMiddleware, videoController.dislikeVideo);

export default router;