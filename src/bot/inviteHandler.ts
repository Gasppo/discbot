import { GuildMember } from "discord.js";
import { findUsedInvite, processInvite } from "../methods/invites";

export const botInviteHandler = async (member: GuildMember, inviteCache: Map<string, Map<string, number>>) => {
    try {
        const guild = member.guild;
        const invitesAfter = await guild.invites.fetch();
        const invitesBefore = inviteCache.get(guild.id) || new Map();

        const usedInviteCode = findUsedInvite(invitesBefore, invitesAfter);

        if (usedInviteCode) await processInvite(invitesAfter.get(usedInviteCode), member);

        inviteCache.set(guild.id, invitesBefore);
    } catch (error) {
        console.error("Error handling invite:", error);
    }
}