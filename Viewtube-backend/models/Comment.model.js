import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true
  },
  user: {
    type:mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  text: {
    type: String,
    required:true,
    trim:true
  },
  likes:[{
    type: mongoose.Schema.Types.ObjectId,
    ref:'User'
  }],
  dislikes: [{
    type:mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  parentComment:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    types:mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
},{
  timestamps: true
});

commentSchema.index({ videoId:1, createdAt:-1})

export default mongoose.model('Comment', commentSchema);