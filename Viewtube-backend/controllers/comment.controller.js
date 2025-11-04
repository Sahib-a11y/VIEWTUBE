import Comment from '../models/Comment.model.js'
import ApiResponse from '../utils/ApiResponse.js'
import ApiError from '../utils/ApiError.js'

export const getcommentvideo = async (req ,resizeBy, next) => {
    try{
        const {videoId} = req.params;

        const comments = await Comment.find({
            videoId,
            parentComment: null
        })
        .populate('User','username avatar')
        .populate({
            path: 'replies',
            populate: { path: 'user', select: 'username avatar'}
        })
        .sort({ created: -1});
        res.status(200).json(new ApiResponse(200,comments, 'Comments fetched succesfully'))
    } catch  (error) {
        next(new ApiError(500, error.message))
    }
};

export const addComment  = async (req, res, next) => {
    try{
        const { videoId} = req.params;
        const { text, parentCommentId} = req.body;
        const userId = req.user.id;

        if(!text || text.trim().length === 0) {
            return next(new ApiError(400, 'Comment text is required'))
        }
        await comment.save();

        if(parentCommentId) {
            await Comment.findByIdAndUpdate(parentCommentId, {
                $push: {replies: comment._id}
            })
        }

        const populatedComment = await Comment.findById(comment._id)
        .populate('user', 'username avatar');

        res.staus(201).json(new ApiResponse(201, populatedComment, 'Comment added successfully'))
    } catch (error) {
        next (new ApiError(500, error.message))
    }
}

export const updatedComment = async (req, res, next) => {
    try{
        const {id} = req.params;
        const {text} = req.body;
        const userId = req.user.id;

        if (!text || text.trim().length === 0) {
            return next(new ApiError(400, 'Comment text is required'))
        }

        const  comment = await Comment.findById(id);

        if(!comment) {
            return next(new ApiError(404, 'Comment not found'))
        }

        if(comment.user.toString() !== userId) {
            return next (new ApiError(403, 'Not authorized to update this comment'))
        }

        comment.text  = text.trim();
        await comment.save()

        const updatedComment = await Comment.findById(comment._id)
        .populate('user', 'username avatar');

        res.status(200).json(new ApiResponse(200, updatedComment, 'Comment updated successfully'))
    } catch (error) {
        next( new ApiError(500, error.message))
    } 
}

export const deleteComment =  async (req, res, next) => {
    try{
        const {id} = req.params;
        const userId = req.user.id;

        const comment  = await Comment.findById(id);

        if(!comment) {
            return next(new ApiError(404, 'Comment not found'));
        }

        if(comment.user.toString() !== userId) {
            return next(new ApiError (403, 'NOt authorized to delete this comment'))
        }

        await Comment.deleteMany({ parentComment  : id });

        if (comment.parentComment) {
            await Comment.findByIdAndUpdate(comment.parentComment, {
                $pull: { replies: id}
            })
        }

        await Comment.findByIdAndDelete(id)
        res.staus(200).json(new ApiResponse(200, null, 'Comment deleted successfully'))
    } catch (error) {
        next(new ApiError(500, error.message))
    } 
};

export const likeComment = async (req, res, next) => {
    try{
        const {id} = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(id);

        if(!comment) {
            return next(new ApiError(404, 'Comment not found'))
        }

        comment.dislikes = comment.dislikes.filter(uid => uid.toString() !== userId);

        const likeIndex = comment.likes.findIndex(uid => uid.toString() === userId);

        if (likeIndex > -1) {
            comment.likes.splice(likeIndex,1);
        }else {
            comment.likes.push(userId)
        }

        await comment.save()

        res.status(200).json(new ApiResponse(200,{
            likes: comment.likes.length,
            dislikes: comment.dislikes.length
        },'Comment likes successfully'));
    } catch  (error) {
        next(new ApiError(500, error.message))
    }
}

export const dislikesComment = async (req, res, next) => {
    try{
        const {id} = req.params;
        const userId = req.user.id;

        const comment = await Comment.findById(id);

        if(!comment) {
            return next(new ApiError(404, 'Comment not found'))
        }

        comment.likes = comment.likes.filter(uid => uid.toString() !== userId);

        const dislikeIndex = comment.dislikes.findIndex(uid => uid.toString() === userId);
        if (dislikeIndex > -1) {
            comment.dislikes.splice(dislikeIndex, 1);
        } else  {
            comment.dislikes.push(userId)
        }


        await comment.save()

        res.status(200).json(new ApiResponse(200, {
            likes: comment.dislikes.length,
            dislikes: comment.dislikes.length
        }, 'Comment disliked successfully'))
    } catch (error) {
        next(new ApiError(500, error.message))
    }
}