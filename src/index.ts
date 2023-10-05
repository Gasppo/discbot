import dotenv from 'dotenv';
import { client } from './discordClient';
import { findUsedInvite, processInvite } from './methods';
import { botHandler } from './bot/cases';

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


client.on('guildMemberAdd', async (member) => {
    const guild = member.guild;
    const invitesAfter = await guild.invites.fetch();
    const invitesBefore: Map<string, number> = inviteCache.get(guild.id) || new Map();

    const usedInviteCode = findUsedInvite(invitesBefore, invitesAfter);

    if (usedInviteCode) {
        const invite = invitesAfter.get(usedInviteCode);
        await processInvite(invite, member);
    }

    // Update the cache
    inviteCache.set(guild.id, invitesBefore);
});


client.on('messageCreate',botHandler);

client.login(token);
