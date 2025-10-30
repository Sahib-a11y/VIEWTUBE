import axios from "axios";

class YoutubeService {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.YOUTUBE_API_KEY;
        this.baseURL = 'https://www.googleapis.com/youtube/v3/videos?id=7lCDEYXw3mM&key=YOUR_API_KEY&part=snippet,statistics'
    }

    async searchVideos(query, maxResults = 20 ) {
        try {
            const response  =  await axios.get(`${this.baseURL}/search`, {
                params: {
                    part: 'snippet',
                    q: query,
                    type: 'video',
                    maxResults,
                    key: this.apiKey
                }
            });
            return response.data.items;
        } catch (error) {
            throw new Error(`YouTube API Error: ${error.message}`)
        }
    }

    async getVideoDetails(videoId) {
        try{
            const response  = await axios.get(`${this.baseURL}/videos`, {
                params: {
                    part:'snippet,contentDetails,statistics',
                    id: videoId,
                    key:this.apiKey
                }
            });
            return response.data.items[0];
        } catch (error) {
            throw new Error(`YouTube API Error: ${error.message}`)
        }
    }

    async getMultipleVideoDetails(videoIds) {
        try {
            const  response  = await axios.get(`${this.baseURL}/videos`, {
                params: {
                    part: 'snippet.content.Details,statistics',
                    id: videoIds.join(','),
                    key: this.apiKey
                }
            });
            return response.data.items;
        }catch (error) {
            throw new Error(`YouTube API Error: ${error.message}`)
        }
    }

     async getTrendingVideos(maxResults = 20) {
        try{
            const response = await axios.get(`${this.baseURL}/videos`,{
                params: {
                    part: 'snippet,contentDetails,statistices',
                    chart: 'mostPopular',
                    regionCode: 'US',
                    maxResults,
                    key: this.apiKey
                }
            });
            return response.data.items;
        } catch (error) {
            throw new Error(`YouTube API Error: ${error.message}`)
        }
     }

     async getChannelVideos(channelId, maxResults = 20) {
        try {
            const response = await axios.get(`${this.baseURL}/search`, {
                params: {
                    part: 'snippet',
                    channelId,
                    type: 'video',
                    order: 'date',
                    maxResults,
                    key: this.apiKey
                }
            });
            return response.data.items;
        }catch (error) {
            throw new Error(`YouTube API Error: ${error.message}`)
        }
     }

     async getVideoComments(videoId, maxResults = 20 ) {
        try {
            const response = await axios.get(`${this.baseURL}/commentThreads`, {
                params: {
                    part: 'snippet',
                    videoId,
                    maxResults,
                    key: this.apiKey
                }
            })
            return response.data.items;
        }catch (error) {
            throw new Error(`YouTube API Error: ${error.message}`);
        }
     }
}

export default YoutubeService;