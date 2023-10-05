import { Collection, GuildMember, Invite } from "discord.js";
import { prisma } from "./prisma";

/**
 * Find which invite was used by a newly joined member.
 */
export const findUsedInvite = (invitesBefore: Map<string, number>, invitesAfter: Collection<string, Invite>): string => {
    let usedInviteCode = "";

    invitesAfter.forEach((invite) => {
        const inviteHasCode = invitesBefore.has(invite.code);
        const beforeUses = invitesBefore.get(invite.code) || 0;
        const inviteUses = invite.uses || 0;

        if (!inviteHasCode) {
            if (inviteUses >= 1) {
                usedInviteCode = invite.code;
            }
            invitesBefore.set(invite.code, inviteUses);
        } else if (beforeUses < inviteUses) {
            usedInviteCode = invite.code;
        }
    });

    return usedInviteCode;
};


export const processInvite = async (invite: Invite | undefined, member: GuildMember) => {

    const invitee = member.user.tag;
    const inviter = invite?.inviter?.tag;
    const code = invite?.code;
    const uses = invite?.uses;

    try {
        if (invitee && inviter && code && uses) {
            console.log(`${member.user.username} joined using the invite code ${invite?.code} from ${invite?.inviter?.username}. Invite was used ${invite?.uses} times since its creation.`);
            await prisma.discordInvite.create({ data: { code, invitee, inviter } })
        }

        else {
            console.log(`${member.user.username} joined using an unknown invite.`);
        }
    }
    catch (e) {
        console.log(e);
    }
}

export const getDistinctReferrals = async (username: string) => {

    try {
        const result = await prisma.discordInvite.findMany({
            where: {
                inviter: username
            },
            distinct: ['invitee']
        });

        return result.length;
    }
    catch (e) {
        console.log(e);
        return 0;
    }

}