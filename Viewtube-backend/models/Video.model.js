import mongoose from "mongoose";
const  videoSchema = new mongoose.Schema({
    videoId: {
        type:String,
        required: true,
        unique: true
    },
    title: {
        type:String,
        required: true
    },
    description: {
        type:String,
        default:''
    },
    thumbnail: {
        type:String,
        required: true
    },
    channelTitle: {
        type: String,
        required: true
    },
    channelId: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        default: ''
    },
    viewCount: {
        type: Number,
        default:0
    },
    likeCOunt: {
        type: Number,
        default:0
    },
    publishedAt: {
        type: Date,
        required:true
    },
    likes:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, {
    timestamps:true
});
 videoSchema.index({videoId:1});
 videoSchema.index({ channelId:1});

 export default mongoose.model('Video', videoSchema);