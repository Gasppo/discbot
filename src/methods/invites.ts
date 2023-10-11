import { Collection, Guild, GuildMember, Invite } from "discord.js";
import { prisma } from "../prisma";

export const processInvite = async (invite: Invite | undefined, member: GuildMember) => {

    const invitee = member.user.tag;
    const inviter = invite?.inviter?.tag || '';
    const code = invite?.code;
    const uses = invite?.uses;

    try {
        if (invitee && inviter && code && uses) {
            console.log(`${new Date().toLocaleString()} - ${member.user.username} joined using the invite code ${code} from ${inviter}. Invite was used ${uses} times since its creation.`);
            await prisma.discordInvite.create({ data: { code, invitee, inviter } })

        }

        else {
            console.log(`${new Date().toLocaleString()} - ${member.user.username} joined using an unknown invite.`);
        }
    }
    catch (e) {
        console.log(new Date().toLocaleString() + " - " + e);
    }
}

export const findUsedInvite = (invitesBefore: Map<string, number>, invitesAfter: Collection<string, Invite>): string => {
    let usedInviteCode = "";

    for (const [code, invite] of invitesAfter.entries()) {
        const beforeUses = invitesBefore.get(code) || 0;
        const inviteUses = invite.uses || 0;

        if (beforeUses < inviteUses) usedInviteCode = code;

        invitesBefore.set(code, inviteUses);
    }

    return usedInviteCode;
};

export const clearInvites = async (guild: Guild, inviteCache: Map<string, Map<string, number>>) => {

    //Clear invites from guild where the age is greater than 1 hour
    let cleared = 0;
    
    try {
        const now = new Date();
        const halfhour = 30 * 60 * 1000;
        const halfHourAgo = new Date(now.getTime() - halfhour);

        const guildInvites = inviteCache.get(guild.id);


        if (guildInvites) {
            const invites = await guild.invites.fetch();
            for (const invite of invites.values()) {
                const code = invite.code;
                const inviteCreatedTimestamp = invite.createdTimestamp || 0;
                if (invite.maxAge && invite.maxAge <= 2592000 && inviteCreatedTimestamp < halfHourAgo.getTime()) {
                    console.log(`${new Date().toLocaleString()} - Deleting invite ${code} from ${invite.inviter?.tag}`);
                    guildInvites.delete(code);
                    await invite.delete();
                    cleared++;
                }
            }
        }
    }
    catch (e) {
        console.log(new Date().toLocaleString() + " - " + e);
    }

    return cleared;
}