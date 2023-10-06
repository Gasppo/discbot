import { GuildMember, Invite, PartialGuildMember } from "discord.js";
import { getDistinctReferrals } from "./referrals";
import { prisma } from "../prisma";

const RANKS = ["Mode Invite Pioneer", "Mode Invite Ambassador", "Mode Invite King"];

const assignRole = async (member: GuildMember, roleName: string) => {
    const role = member.guild.roles.cache.find(role => role.name === roleName);
    if (role) {
        console.log(`Assigning role ${roleName} to ${member.user.tag}`)
        await member.roles.add(role);
    }
}

const removeRole = async (member: GuildMember, roleName: string) => {
    const role = member.guild.roles.cache.find(role => role.name === roleName);
    if (role) {
        console.log(`Removing role ${roleName} from ${member.user.tag}`)
        await member.roles.remove(role);
    }
}

export const refreshRole = async (member: GuildMember) => {

    const referrals = await getDistinctReferrals(member.user.tag);

    //We remove the current role and assign the new one
    if (referrals <= 0) await removeRole(member, RANKS[0]);
    else if (referrals < 5) await removeRole(member, RANKS[1]);
    else if (referrals < 10) await removeRole(member, RANKS[2]);

    await handleRoleRank(member, referrals);

}

export const handleRoleRank = async (member: GuildMember, referrals: number) => {

    if (referrals <= 0) return;
    if (referrals < 5) return await assignRole(member, RANKS[0]);
    if (referrals < 10) return await assignRole(member, RANKS[1]);
    if (referrals >= 10) return await assignRole(member, RANKS[2]);

}

export const handleVerifiedRole = async (member: GuildMember | PartialGuildMember) => {

    await prisma.discordInvite.updateMany({ where: { invitee: member.user.tag }, data: { validated: true } });
    const inviters = await prisma.discordInvite.findMany({ where: { invitee: member.user.tag, validated: true }, select: { inviter: true } })

    const guild = member.guild;

    const tags = inviters.map(({ inviter }) => inviter);
    const uniqueTags = [...new Set(tags)];

    //This is not usually a large number, so we can iterate over it without worrying about performance
    for (const tag of uniqueTags) {

        //We try to find the member in the cache, if not we fetch it
        let guildMember = guild.members.cache.find(member => member.user.tag === tag);
        if (!guildMember) guildMember = await guild.members.fetch({ query: tag, limit: 1 }).then(members => members.first());

        if (guildMember) await refreshRole(guildMember);
    }

}