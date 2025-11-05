import Playlist from '../models/Playlist.model.js';
import YouTubeService from '../services/youtube.service.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/ApiError.js';

const youtubeService = new YouTubeService();

export const getUserPlaylists = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const playlists = await Playlist.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json(new ApiResponse(200, playlists, 'Playlists fetched successfully'));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const getPlaylistById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return next(new ApiError(404, 'Playlist not found'));
    }

    if (!playlist.isPublic && playlist.user.toString() !== req.user.id) {
      return next(new ApiError(403, 'Not authorized to view this playlist'));
    }

    if (playlist.videos.length > 0) {
      const videoIds = playlist.videos.map(v => v.videoId);
      const videoDetails = await youtubeService.getMultipleVideoDetails(videoIds);
      
      playlist.videos = playlist.videos.map(video => {
        const details = videoDetails.find(v => v.id === video.videoId);
        return {
          ...video.toObject(),
          title: details?.snippet?.title,
          thumbnail: details?.snippet?.thumbnails?.medium?.url,
          channelTitle: details?.snippet?.channelTitle,
          duration: details?.contentDetails?.duration
        };
      });
    }

    res.status(200).json(new ApiResponse(200, playlist, 'Playlist fetched successfully'));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const createPlaylist = async (req, res, next) => {
  try {
    const { name, description, isPublic } = req.body;
    const userId = req.user.id;

    if (!name || name.trim().length === 0) {
      return next(new ApiError(400, 'Playlist name is required'));
    }

    const playlist = new Playlist({
      name: name.trim(),
      description: description?.trim() || '',
      user: userId,
      isPublic: isPublic || false
    });

    await playlist.save();

    res.status(201).json(new ApiResponse(201, playlist, 'Playlist created successfully'));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const updatePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic } = req.body;
    const userId = req.user.id;

    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return next(new ApiError(404, 'Playlist not found'));
    }

    if (playlist.user.toString() !== userId) {
      return next(new ApiError(403, 'Not authorized to update this playlist'));
    }

    if (name) playlist.name = name.trim();
    if (description !== undefined) playlist.description = description.trim();
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, 'Playlist updated successfully'));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const deletePlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return next(new ApiError(404, 'Playlist not found'));
    }

    if (playlist.user.toString() !== userId) {
      return next(new ApiError(403, 'Not authorized to delete this playlist'));
    }

    await Playlist.findByIdAndDelete(id);

    res.status(200).json(new ApiResponse(200, null, 'Playlist deleted successfully'));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const addVideoToPlaylist = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { videoId } = req.body;
    const userId = req.user.id;

    if (!videoId) {
      return next(new ApiError(400, 'Video ID is required'));
    }

    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return next(new ApiError(404, 'Playlist not found'));
    }

    if (playlist.user.toString() !== userId) {
      return next(new ApiError(403, 'Not authorized to modify this playlist'));
    }

    const videoExists = playlist.videos.some(v => v.videoId === videoId);
    if (videoExists) {
      return next(new ApiError(400, 'Video already in playlist'));
    }

    if (playlist.videos.length === 0) {
      const videoDetails = await youtubeService.getVideoDetails(videoId);
      playlist.thumbnail = videoDetails.snippet.thumbnails.medium.url;
    }

    playlist.videos.push({ videoId });
    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, 'Video added to playlist successfully'));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};

export const removeVideoFromPlaylist = async (req, res, next) => {
  try {
    const { id, videoId } = req.params;
    const userId = req.user.id;

    const playlist = await Playlist.findById(id);

    if (!playlist) {
      return next(new ApiError(404, 'Playlist not found'));
    }

    if (playlist.user.toString() !== userId) {
      return next(new ApiError(403, 'Not authorized to modify this playlist'));
    }

    playlist.videos = playlist.videos.filter(v => v.videoId !== videoId);

    if (playlist.videos.length === 0) {
      playlist.thumbnail = '';
    } else if (playlist.thumbnail && playlist.videos[0]) {
      const videoDetails = await youtubeService.getVideoDetails(playlist.videos[0].videoId);
      playlist.thumbnail = videoDetails.snippet.thumbnails.medium.url;
    }

    await playlist.save();

    res.status(200).json(new ApiResponse(200, playlist, 'Video removed from playlist successfully'));
  } catch (error) {
    next(new ApiError(500, error.message));
  }
};