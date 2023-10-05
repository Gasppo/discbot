import { GuildMember } from "discord.js";
import { getDistinctReferrals } from "./referrals";

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

    if (referrals < 0) return;
    if (referrals < 5) return assignRole(member, RANKS[0]);
    if (referrals < 10) return assignRole(member, RANKS[1]);
    if (referrals >= 10) return assignRole(member, RANKS[2]);

}