require('dotenv').config();
require('log-timestamp');
const { Client, Events } = require('discord.js');
const { GatewayIntentBits } = require('./config/GatewayIntentBits');
const { onReady } = require('./events/onReady');
const { validateEnv } = require('./utils/validateEnv');

(async () => {
    validateEnv();

    const client = new Client({ intents: GatewayIntentBits });
    module.exports = client;

    client.once(Events.ClientReady, async() => onReady(client));

    await client.login(process.env.BOT_TOKEN);
})();