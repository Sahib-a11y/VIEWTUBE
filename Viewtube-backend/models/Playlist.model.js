import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'User',
    required: true
  },
  videos: [{
    videoId: {
      type: String,
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  thumbnail: {
    type: String,
    default: ''
  },
  isPublic: {
    type: Boolean,
    default:  false
  }
}, {
  timestamps: true
})

playlistSchema.index({user:1})

export default mongoose.model('Playlist', playlistSchema)