import { GuildMember, PartialGuildMember, Role } from "discord.js";
import { handleVerifiedRole } from "../methods/roles";
import { prisma } from "../prisma";


export const memberRoleUpdateHandler = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) => {

    const VERIFIED = "Verified";

    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    const verifiedRole = addedRoles.find(role => role.name === VERIFIED);

    if (verifiedRole) {
        await handleVerifiedRole(newMember);
    }

}

export const memberDeletedRoleHandler = async (member: GuildMember | PartialGuildMember) => {
    await prisma.discordInvite.deleteMany({ where: { invitee: member.user.tag } });
}
