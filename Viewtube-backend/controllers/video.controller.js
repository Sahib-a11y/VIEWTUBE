import VideoModel from "../models/Video.model";
import YoutubeService from "../services/youtube.service";
import ApiResponse from '../utils/ApiResponse';
import ApiError from '../utils/ApiError';


const youtubeService  = new YoutubeService();
export const getTrendingVideos = async (req,res,next) => {
    try{
        const videos = await youtubeService.getTrendingVideos(20);

        const formattedVideos = videos.map(video => ({
            videoId: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.high.url,
            channelTitle: video.snippet.channelTitle,
            channelId: video.snippet.channelId,
            duration: video.statistics.viewCount,
            publishedAt: video.snippet.publishedAt
        }));

        res.status(200).json(new ApiResponse(200, formattedVideos,'Trending videos fetched successfully'));
    } catch (error) {
        next(new ApiError(500, error.message));
    }
}

export const searchVideos = async (req, res, next) => {
    try{
        const {query} = req.query;

        if(!query) {
            return next(new ApiError(400, 'Search query is required'))
        }

        const videos = await youtubeService.searchVideos(query,20);

        const videoIds = videos.map(v => v.id.videoId);
        const detailedVideos = await youtubeService.getMultipleVideoDetails(videoIds);

        const formattedVideos = detailedVideos.map(video => ({
            videoId: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            thumbnail: video.snippet.thumbnails.high.url,
            channelTitle: video.snippet.channelTitle,
            channelId: video.snippet.channelId,
            duration: video.contentDetails.duration,
            viewCount: video.statistics.viewCount,
            publishedAt: video.snippet.publishedAt
        }));

        res.status(200).json(new ApiResponse(200, formattedVideos, 'Search results fetched successfully'))
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

export const getVideoById = async (req, res, next) => {
    try {
        const  {id} = req.params;

        let video = await VideoModel.findOne({ videoId: id });

        const youtubeVideo = await youtubeService.getVideoDetails(id);

        if(!youtubeVideo) {
            return next(new ApiError(404, 'Video not found'))
        }

        if (video) {
            video.viewCount = youtubeVideo.statistics.viewCount;
        } else {
            video = new Video({
                videoId: youtubeVideo.id,
                title: youtubeVideo.snippet.title,
                description: youtubeVideo.snippet.description,
                thumbnail: youtubeVideo.snippet.thumbnails.high.url,
                channelTitle: youtubeVideo.snippet.channelTitle,
                channelId: youtubeVideo.snippet.channelId,
                duration: youtubeVideo.contentDetails.duration,
                viewCount: youtubeVideo.statistics.viewCount,
                publishedAt: youtubeVideo.snippet.publishedAt
            });
            await video.save()
        }

        const formattedVideo = {
            videoId: youtubeVideo.id,
            title: youtubeVideo.snippet.title,
            description: youtubeVideo.snippet.description,
            thumbnail: youtubeVideo.snippet.thumbnails.high.url,
            channelTitle: youtubeVideo.snippet.channelTitle,
            channelId: youtubeVideo.snippet.channelId,
            duration: youtubeVideo.contentDetails.duration,
            viewCount: youtubeVideo.statistics.viewCount,
            likeCount: youtubeVideo.statistics.likeCount,
            publishedAt: youtubeVideo.snippet.publishedAt,
            likes:video.likes.length,
            dislikes: video.dislikes.length
        };

        res.status(200).json(new ApiResponse(200, formattedVideo,'Video details fetched successfully'))

    }catch (error) {
        next(new ApiError(500, error.message))
    }
};

export const likeVideo = async (req, res, next) => {
    try {
        const {id} = req.params;
        const userId = req.user.id;

        let video = await Video.findOne({ video: id })

        if(!video) {
            const youtubeVideo = await youtubeService.getVideoDetails(id);
            video = new Video({
                videoId: youtubeVideo.id,
                title: youtubeVideo.snippet.title,
                description: youtubeVideo.snippet,description,
                thumbnail: youtubeVideo.snippet.thumbnails.high.url,
                channelTitle: youtubeVideo.snippet.channelTitle,
                channelId: youtubeVideo.snippet.channelId,
                publishedAt: youtubeVideo.snippet.publishedAt
            })
        }
        video.dislikes = video.dislikes.filter(id => id.toString() !== userId);
        
        const likeIndex = video.likes.filter(id => id.toString() !== userId);
        if(likeIndex > -1) {
            video.likes.splice(likeIndex,1);
        }else {
            video.likes.push(userId)
        }

        await video.save();

        res.status(200).json(new ApiResponse(200, {
            likes: video.likes.length,
            dislikes: video.dislikes.length
        }, 'Video liked successfully'));
    } catch (error) {
        next(new ApiError(500, error.message));
    }
};

export const dislikesVideo = async (req, res, next) => {
    try {
        const {id} = req.params;
        const userId = req.user.id;

        let video  =  await Video.findOne({videoId: id});

        if(!video) {
            const youtubeVideo  = await youtubeService.getVideoDetails(id);

                video = new Video({
                    videoId: youtubeVideo.id,
                    title: youtubeVideo.snippet.title,
                    description: youtubeVideo.snippet.description,
                    thumbnail: youtubeVideo.snippet.thumbnails.high.url,
                    channelTitle: youtubeVideo.snippet.channelTitle,
                    channelId: youtubeVideo.snippet.channelId,
                    publishedAt: youtubeVideo.snippet.publishedAt,
                })
        }

        video.likes = video.likes.filter(id => id.toString() !== userId);
        const dislikeIndex = video.dislikes.findIndex(id = id.toString() === userId);
        if(dislikeIndex > -1) {
            video.dislikeIndex.splice(dislikeIndex, 1);
        }else {
            video.dislikes.push(userId)
        }

        await video.save()

        res.status(200).json(new ApiResponse(200, {
            likes: video.likes.length,
            dislikes: video.dislikes.length
        }, 'Video disliked successfully'))
    }catch (error) {
        next(new ApiError(500, error.message));
    }
};