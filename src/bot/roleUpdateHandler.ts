import { GuildMember, PartialGuildMember, Role } from "discord.js";
import { handleVerifiedRole, refreshRole } from "../methods/roles";
import { prisma } from "../prisma";


export const memberRoleUpdateHandler = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) => {

    try {
        const VERIFIED = "Verified";

        const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
        const verifiedRole = addedRoles.find(role => role.name === VERIFIED);

        if (verifiedRole) await handleVerifiedRole(newMember);
    }
    catch (error) {
        console.error(`${new Date().toLocaleString()} - Error handling role update:`, error);
    }
}

export const memberDeletedRoleHandler = async (member: GuildMember | PartialGuildMember) => {

    try {
        const inviters = await prisma.discordInvite.findMany({ where: { invitee: member.user.tag, validated: true }, select: { inviter: true } })
        await prisma.discordInvite.deleteMany({ where: { invitee: member.user.tag } });

        const guild = member.guild;

        const tags = inviters.map(({ inviter }) => inviter);
        const uniqueTags = [...new Set(tags)];

        for (const tag of uniqueTags) {

            //We try to find the member in the cache, if not we fetch it
            let guildMember = guild.members.cache.find(member => member.user.tag === tag);
            if (!guildMember) guildMember = await guild.members.fetch({ query: tag, limit: 1 }).then(members => members.first());

            if (guildMember) await refreshRole(guildMember);
        }
    }
    catch (error) {
        console.error(`${new Date().toLocaleString()} - Error handling deleted role:`, error);
    }

}
