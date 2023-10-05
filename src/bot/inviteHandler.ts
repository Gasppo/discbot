import { GuildMember } from "discord.js";
import { findUsedInvite, processInvite } from "../methods/invites";

export const botInviteHandler = async (member: GuildMember, inviteCache: Map<string, Map<string, number>>) => {
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

}