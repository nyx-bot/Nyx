# Nyx Rewrite

This is the codebase for the rewrite of Nyx, written with ~~Eris~~ Oceanic.js and a lot of energy drinks.

**THIS CODE IS BASICALLY A MIXTURE OF MY CURRENT KNOWLEDGE IN JAVASCRIPT AND MY KNOWLEDGE YEARS BACK. IT'S A MESS. THAT'S WHY NYX V3 IS IN DEVELOPMENT, I ONLY OPEN-SOURCED THIS FOR TRANSPARENCY AND POTENTIALLY IF PEOPLE WANTED TO SELF-HOST THEIR OWN INSTANCES.**

## Setup

Make sure that you have [Node.js & NPM](https://nodejs.org/en/download/) (to run the bot itself), [FFmpeg](https://ffmpeg.org/download.html) (for music support), and [Git](https://git-scm.com/downloads) (for self-updating support) installed.

1) Clone the repository through the commandline by running `git clone https://github.com/nyx-bot/Nyx -b v2` in the preferred directory of your choice.
2) Copy `config.example.json` into `config.json` and edit it accordingly.
- Create a bot token on [Discord's official developer page](https://discord.com/developers/applications)
- Don't worry about Top.gg & Genuis API keys here as they're handled by the musicAPI.
- [OPTIONAL] Set up and configure a nyxCache system from [this repository](https://github.com/nyx-bot/nyxCache)
- [OPTIONAL] Set up and configure the musicAPI from [this repository](https://github.com/nyx-bot/musicAPI)
3) Install packages with `npm install`.
4) Run `index.js` with your favorite Node.js process manager.

Personally, I'd use [PM2](https://pm2.keymetrics.io/) to manage the instance. Nyx also fully supports their web dashboard placeholders thing or whatever it's called.