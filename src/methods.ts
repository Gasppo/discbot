import { Collection, GuildMember, Invite } from "discord.js";

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


export const processInvite = (invite: Invite | undefined, member: GuildMember) => {
    console.log(`${member.user.tag} joined using the invite code ${invite?.code} from ${invite?.inviter?.username}. Invite was used ${invite?.uses} times since its creation.`);
}