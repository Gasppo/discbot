import { GuildMember, Invite, PartialGuildMember } from "discord.js";
import { getDistinctReferrals } from "./referrals";
import { prisma } from "../prisma";

const RANKS = ["Mode Invite Pioneer", "Mode Invite Ambassador", "Mode Invite King"];

const assignRole = (member: GuildMember, roleName: string) => {
    const role = member.guild.roles.cache.find(role => role.name === roleName);
    if (role) member.roles.add(role);
}

const removeRole = (member: GuildMember, roleName: string) => {
    const role = member.guild.roles.cache.find(role => role.name === roleName);
    if (role) member.roles.remove(role);
}

export const refreshRole = async (member: GuildMember) => {

    //Clear any existing roles in the RANKS array
    RANKS.forEach(rank => removeRole(member, rank));

    const referrals = await getDistinctReferrals(member.user.tag);
    handleRoleRank(member, referrals);

}

export const handleRoleRank = (member: GuildMember, referrals: number) => {

    const inviter = member.guild.members.cache.find(member => member.user.tag === member.user.tag);

    if (!inviter) return;
    if (referrals < 0) return;
    if (referrals < 5) return assignRole(inviter, RANKS[0]);
    if (referrals < 10) return assignRole(inviter, RANKS[1]);
    if (referrals >= 10) return assignRole(inviter, RANKS[2]);

}

export const handleVerifiedRole = async (member: GuildMember | PartialGuildMember) => {
    await prisma.discordInvite.updateMany({ where: { invitee: member.user.tag }, data: { validated: true } });
}