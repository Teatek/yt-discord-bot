# yt-discord-bot

A TypeScript bot to post new videos from Youtube channels to a Discord channel.

## Dependencies

* discordjs
* dotenv
* fs
* node-fetch
* typescript

To install:

    npm install

## How to launch

    npm run build
    npm run start

## Configuration

The project have 3 files needed to work.

### Config
You need to create a file named `config.json`. A template file named `example.config.json` is available so you can know how to write it.
For every Youtube channel, you need to get his id. For that you can search on the internet to find it.

Since each Youtube API call search cost 100 credits you need to be carefull no to excedeed it (channels x schedule).

### Database
When the app finds new videos, it write the last video url to a file named `database.json`. You should create it if you haven't.

#### Example

`{"channels":[{"id":"UCBR8-60-B28hp2BmDPdntcQ","latestVideo":""}]}`

### Env

In a .env you have to fill you Discord token and Youtube API key.

## License

yt-discord-bot is free and open source under the MIT license.
