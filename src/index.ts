import dotenv from 'dotenv';
import { botInviteHandler } from './bot/inviteHandler';
import { botMessageHandler } from './bot/messageHandler';
import { memberRoleUpdateHandler } from './bot/roleUpdateHandler';
import { client } from './discordClient';

dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN || "";
const inviteCache: Map<string, Map<string, number>> = new Map();  // To store invite counts for guilds

client.once('ready', async () => {
    console.log(`Bot is ready! Tag is ${client?.user?.tag}`);

    // Cache invites for all guilds the bot is in
    client.guilds.cache.forEach(async (guild) => {
        const guildInvites = await guild.invites.fetch();
        const inviteMap = new Map();

        guildInvites.forEach(invite => inviteMap.set(invite.code, invite.uses));
        inviteCache.set(guild.id, inviteMap);
    });
});


client.on('guildMemberAdd', async (member) => { botInviteHandler(member, inviteCache) });
client.on('messageCreate', botMessageHandler);
client.on('guildMemberUpdate', memberRoleUpdateHandler);
client.login(token);
