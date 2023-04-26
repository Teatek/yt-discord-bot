import {Client, Events, GatewayIntentBits, TextChannel } from 'discord.js';
import * as yt from "./youtubeApi.js";
import { ENV } from "./environmentSetup.js";
import { readDatabaseFile, readConfigFile, writeDatabase, DbData, ConfigData } from "./fileHandler.js";

// Create a new client instance (discord)
const client = new Client({intents : [ GatewayIntentBits.Guilds ]});

// Log in to Discord with your client's token
client.login(ENV.DISCORD_TOKEN);

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, async c => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  // get youtube videos and post them on discord
  let db = await readDatabaseFile();
  let config = await readConfigFile();
  scheduleYtVideos(client,config, db);
});

function nextTimeToGetVideos(currentTime: string, list: string[]) {
  let nextTime = list[0];
  for (let i = 0; i < list.length; i++) {
    if (currentTime < nextTime) {
      break;
    } else {
      if (i == list.length-1 && currentTime >= list[i]) {
        // go back to first time
        nextTime = list[0];
      } else {
        nextTime = list[i];
      }
    }
  }
  console.log(`Next time we check new videos : ${nextTime}`);
  return nextTime;
}

function padTime(number: number) {
  return number.toString().padStart(2, '0');
}

function getTimeBetweenNowAndNextCallToYoutube(timeList: string[]) {
  const now = new Date();
  const currentTime = padTime(now.getHours()) + ":" + padTime(now.getMinutes());
  const nextTimeString = nextTimeToGetVideos(currentTime, timeList);
  // console.log("Next time : " + nextTimeString);
  const nextTimeDate = stringToDate(nextTimeString);
  const timeInMillis = getTimeInMillisBetweenDates(now, nextTimeDate);
  return timeInMillis;
}

async function sendNewYtVideosToDiscord(discordClient: Client<boolean>, config: ConfigData, db: DbData) {
  for (let i = 0; i < config.youtubeChannels.length; i++) {
    const channel = config.youtubeChannels[i];
    try {
      // Make sure we have a good structure in database
      let lastestVideo: string = "";
      for (const dbChannel of db.channels) {
        if (dbChannel.id == channel.id) {
          lastestVideo = dbChannel.latestVideo;
        }
      }
      const videosOW: yt.ApiResponse[] = await yt.getVideosFromChannel(channel, db.channels[i].latestVideo);
      // Has found a new video
      if (videosOW.length > 0) {
        db.channels[i].latestVideo = videosOW[videosOW.length-1].url;
      }
      for (const v of videosOW) {
        discordClient.channels.fetch(config.discordChannel)
        .then((res) => {
          (res as TextChannel).send({ 'content' : `https://youtu.be/${v.url}` });
        });
      }
    } catch (e) {
      console.error(e);
    }
  }
  writeDatabase(db);
}

function scheduleYtVideos(discordClient: Client, config: ConfigData, db: DbData) {
  sendNewYtVideosToDiscord(discordClient, config, db);
  let time = getTimeBetweenNowAndNextCallToYoutube(config.schedule);
  setTimeout(scheduleYtVideos, time, discordClient, config, db);
}

function stringToDate(stringTime: string) {
  const arr = stringTime.split(":");
  const date = new Date();
  date.setHours(Number(arr[0]), Number(arr[1]));
  return date;
}

function getTimeInMillisBetweenDates(date1: Date, date2: Date) {
  return Math.abs(date2.getTime() - date1.getTime());
}
