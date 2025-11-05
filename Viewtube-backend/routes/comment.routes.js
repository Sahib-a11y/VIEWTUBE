import express from 'express';
import * as commentController from '../controllers/comment.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:videoId', commentController.getCommentsByVideo);
router.post('/:videoId', authMiddleware, commentController.addComment);
router.put('/:id', authMiddleware, commentController.updateComment);
router.delete('/:id', authMiddleware, commentController.deleteComment);
router.post('/:id/like', authMiddleware, commentController.likeComment);
router.post('/:id/dislike', authMiddleware, commentController.dislikeComment);

export default router;