# Songbird Price Status Discord Bot

Template for pulling various token prices from the Songbird network

This bot will update its status message:
1. With the current price.
2. Changing colors to denote an increase or decrease from last check, if any
3. Changing arrow direction to denote and increase or decrease from last check, if any

It is based on [Cryptocurrency-Status-Discord-Bot](https://github.com/cferreras-zz/Cryptocurrency-Status-Discord-Bot) by Carlos Ferreras

who based it on [Minecraft Player Count Discord Bot](https://github.com/SpencerTorres/Minecraft-Player-Count-Discord-Bot) by Spencer Torres

It takes inspiration for how it works and looks from [discord-stock-ticker](https://github.com/rssnyder/discord-stock-ticker) by Riley Snyder

![Example bot setup.](https://images2.imgbox.com/79/b2/iVPxlKO4_o.jpg)

## Install and Setup

- Install nvm - see [nvm github] (https://github.com/nvm-sh/nvm) for latest:

```curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash```

- Get latest node LTS

```nvm install --lts```

- Clone to system and give it the token name you will be running (i.e. orc-bot)

```https://github.com/go140point6/crypto-sgbnetwork-price-bot.git token-bot```\
```cd ~/crypto-sgbnetwork-price-bot```\
```npm install```\
```cp .env-template .env```

- Edit .env to include your bot ID and token, as well as your server ID.  Select one of the available tokens or add a new one.
  
```node index.js```

*Recommend you use a process manager (such as pm2) to manage your processes in the background.*

## Get a Discord bot

Follow the steps on [the Discord developer documentation.](https://discordapp.com/developers/docs/intro).

Scope: Bot
Bot Permissions: Manage Roles, Change Nickname.

In your discord server, you must create three roles:
1. Price Bot (name it whatever you want) and leave it the default color grey.  Toggle the "display separately from other online members" and place it higher than the two roles below.  IMPORTANT: Give your bot this role (or you will get a permissions error on starting the bot).
2. tickers-red (exactly that) and make it color red (it must be below your Price Bot role).  No need to assign to your bot.
3. tickers-green (exactly that) and make it color green (it must be below your Price Bot role).  No need to assign to your bot.

Note: As of discord.js v13, you will have to give you bot the priviledged gateway intents (Presence and Server Members)!