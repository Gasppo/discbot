import { GuildMember, Invite, PartialGuildMember } from "discord.js";
import { getDistinctReferrals } from "./referrals";
import { prisma } from "../prisma";

const RANKS = ["Mode Invite Pioneer", "Mode Invite Ambassador", "Mode Invite King"];

const assignRole = async (member: GuildMember, roleId: string) => {
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
        console.log(`${new Date().toLocaleString()} - Assigning role ${role.name} to ${member.user.tag}`)
        await member.roles.add(role);
    }
}

const removeRole = async (member: GuildMember, roleId: string) => {
    const role = member.guild.roles.cache.get(roleId);
    if (role) {
        console.log(`${new Date().toLocaleString()} - Removing role ${role.name} from ${member.user.tag}`)
        await member.roles.remove(role);
    }
}

export const refreshRole = async (member: GuildMember) => {

    const referrals = await getDistinctReferrals(member.user.tag);

    //We remove the current role and assign the new one
    switch (true) {
        case referrals < 1:
            await removeRole(member, RANKS[0]);
            break;
        case referrals < 5:
            await removeRole(member, RANKS[1]);
            await assignRole(member, RANKS[0]);
            break;
        case referrals < 10:
            await removeRole(member, RANKS[2]);
            await assignRole(member, RANKS[1]);
            break;
        default:
            await assignRole(member, RANKS[2]);
            break;
    }

}

export const handleRoleRank = async (member: GuildMember, referrals: number) => {

    if (referrals < 5) await assignRole(member, RANKS[0]);
    else if (referrals < 10) await assignRole(member, RANKS[1]);
    else await assignRole(member, RANKS[2]);


}

export const handleVerifiedRole = async (member: GuildMember | PartialGuildMember) => {

    await prisma.discordInvite.updateMany({ where: { invitee: member.user.tag }, data: { validated: true } });
    const inviters = await prisma.discordInvite.findMany({ where: { invitee: member.user.tag, validated: true }, select: { inviter: true } })

    const guild = member.guild;

    const tags = inviters.map(({ inviter }) => inviter);
    const uniqueTags = [...new Set(tags)];

    await Promise.all(uniqueTags.map(async (tag) => {
        //We try to find the member in the cache, if not we fetch it
        let guildMember = guild.members.cache.get(tag);
        if (!guildMember) guildMember = await guild.members.fetch({ query: tag, limit: 1 }).then(members => members.first());

        if (guildMember) await refreshRole(guildMember);
    }));

}