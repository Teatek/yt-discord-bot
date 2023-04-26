import fetch from 'node-fetch';
import { ENV } from './environmentSetup.js';
import { ConfigYtData } from './fileHandler.js';

export interface ApiResponse {
  url: string,
  title: string,
  description: string,
}

async function getVideosFromApi(channelId: string): Promise<ApiResponse[]> {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${
    channelId}&maxResults=5&order=date&type=video&key=${ENV.YT_KEY}`
  const videos = await fetch(url)
  .then((response) => response.json())
  .then(data => data['items'].reverse())
  .catch(err => {
    throw new Error(err);
  });
  // Remove unnecessary fields
  return videos.map(obj => {
    const objFormat: ApiResponse = {
      url : obj.id.videoId,
      title : obj.snippet.title,
      description : obj.snippet.description,
    };
    return objFormat;
  });
}

async function isVideoAShort(url: string): Promise<boolean> {
  const response = await fetch(`https://www.youtube.com/shorts/${url}`);
  const redirectedUrl = response.url;
  if (redirectedUrl.includes("shorts")) {
    return true;
  }
  return false;
}

export async function getVideosFromChannel(ytChannel: ConfigYtData, latestVideo: string): Promise<ApiResponse[]> {
  const listVideos = await getVideosFromApi(ytChannel.id);
  let urls: ApiResponse[] = [];

  // remove already posted videos
  for(let i = 0; i < listVideos.length; i++) {
    const video = listVideos[i];
    if (video.url == latestVideo) {
      listVideos.splice(0, i+1);
      break;
    }
  }
  // filter videos
  console.log("New videos found :");
  for (let i = 0; i < listVideos.length; i++) {
    const el = listVideos[i];
    const isShort = await isVideoAShort(el.url);
    if (!isShort) {
      console.log(el.title);
      // add to array
      urls.push(el);
    }
  }
  return urls;
}
