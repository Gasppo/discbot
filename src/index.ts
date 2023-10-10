import dotenv from 'dotenv';
import { botInviteHandler } from './bot/inviteHandler';
import { botMessageHandler } from './bot/messageHandler';
import { memberDeletedRoleHandler, memberRoleUpdateHandler } from './bot/roleUpdateHandler';
import { client } from './discordClient';
import { clearInvites } from './methods/invites';

dotenv.config();

const token = process.env.DISCORD_BOT_TOKEN || "";
const inviteCache: Map<string, Map<string, number>> = new Map();  // To store invite counts for guilds

client.once('ready', async () => {
    try {
        const now = new Date().toLocaleString();
        console.log(`${now} - Bot is ready! Tag is ${client?.user?.tag}`);

        for (const guild of client.guilds.cache.values()) {
            const guildInvites = await guild.invites.fetch();
            const inviteMap = new Map();

            guildInvites.forEach(invite => inviteMap.set(invite.code, invite.uses));
            inviteCache.set(guild.id, inviteMap);
            clearInvites(guild, inviteCache);

            setInterval(() => clearInvites(guild, inviteCache), 2 * 60 * 60 * 1000);
        }
    } catch (error) {
        console.error(`${new Date().toLocaleString()} - Error starting: `, error);
    }
});


client.on('guildMemberAdd', async (member) => { botInviteHandler(member, inviteCache) });
client.on('guildMemberRemove', memberDeletedRoleHandler);
client.on('guildMemberUpdate', memberRoleUpdateHandler);
client.on('messageCreate', async (message) => { botMessageHandler(message, inviteCache) });
client.login(token);
