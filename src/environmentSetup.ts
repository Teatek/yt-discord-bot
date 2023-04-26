import * as dotenv from 'dotenv';

dotenv.config()

export const ENV = {
  "YT_KEY" : process.env.YOUTUBE_KEY,
  "DISCORD_TOKEN" : process.env.DISCORD_TOKEN
}

