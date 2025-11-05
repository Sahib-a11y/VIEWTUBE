import express from 'express';
import * as playlistController from '../controllers/playlist.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, playlistController.getUserPlaylists);
router.get('/:id', playlistController.getPlaylistById);
router.post('/', authMiddleware, playlistController.createPlaylist);
router.put('/:id', authMiddleware, playlistController.updatePlaylist);
router.delete('/:id', authMiddleware, playlistController.deletePlaylist);
router.post('/:id/videos', authMiddleware, playlistController.addVideoToPlaylist);
router.delete('/:id/videos/:videoId', authMiddleware, playlistController.removeVideoFromPlaylist);

export default router;