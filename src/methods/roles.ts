import { GuildMember, Invite, PartialGuildMember } from "discord.js";
import { getDistinctReferrals } from "./referrals";
import { prisma } from "../prisma";

const RANKS = ["Mode Invite Pioneer", "Mode Invite Ambassador", "Mode Invite King"];

const assignRole = (member: GuildMember, roleName: string) => {
    const role = member.guild.roles.cache.find(role => role.name === roleName);
    if (role) {
        console.log(`Assigning role ${roleName} to ${member.user.tag}`)
        member.roles.add(role);
    }
}

const removeRole = (member: GuildMember, roleName: string) => {
    const role = member.guild.roles.cache.find(role => role.name === roleName);
    if (role) {
        console.log(`Removing role ${roleName} from ${member.user.tag}`)
        member.roles.remove(role);
    }
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

export const handleVerifiedRole = async (member: GuildMember | PartialGuildMember) => {
    await prisma.discordInvite.updateMany({ where: { invitee: member.user.tag }, data: { validated: true } });

    const tags = (await prisma.discordInvite.findMany({ where: { invitee: member.user.tag, validated: true } })).map(invite => invite.inviter);

    const guild = member.guild;
    const members = await guild.members.fetch()

    tags.forEach(tag => {
        const member = members.find(member => member.user.tag === tag);
        if (member) handleRoleRank(member, tags.length);
    })

}