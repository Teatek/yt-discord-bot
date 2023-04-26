import { writeFile } from 'fs';
import { readFile } from 'fs/promises';

enum FileType {
  Config = "config.json",
  Database = "database.json"
}

export type ConfigData = {
  youtubeChannels: ConfigYtData[];
  schedule: string[];
  discordChannel: string;
}

export type ConfigYtData = {
  name: string;
  id: string;
}

export type DbData = {
  channels: DbChannelData[];
}

export type DbChannelData = {
  id: string;
  latestVideo: string;
}

export async function readConfigFile() {
  const res = await readFile(FileType.Config);
  return JSON.parse(res.toString()) as ConfigData;
}

export async function readDatabaseFile() {
  const res = await readFile(FileType.Database);
  return JSON.parse(res.toString()) as DbData;
}

export function writeDatabase(data: DbData): boolean {
  const dataStr = JSON.stringify(data);
  writeFile(FileType.Database, dataStr, (err) => {
    if (err) {
      console.log(err);
      return false;
    }
  });
  return true;
}
