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

const deleteInvite = async (guild: Guild, invite: Invite, guildInvites: Map<string, number>) => {
    const code = invite.code;
    const inviteCreatedTimestamp = invite.createdTimestamp || 0;

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bot " + (process.env.DISCORD_BOT_TOKEN || ""));
    const redirect: RequestRedirect = 'follow';

    var requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
        redirect
    };

    console.log(`${new Date().toLocaleString()} - Invite ${code} created at ${new Date(inviteCreatedTimestamp).toLocaleString()} by ${invite.inviter?.tag}`);
    await fetch("https://discord.com/api/v10/invites/" + code, requestOptions)
        .then(response => {
            if (response.status === 200) {
                guildInvites.delete(code);
                return console.log(`${new Date().toLocaleString()} - Deleted invite ${code} created at ${new Date(inviteCreatedTimestamp).toLocaleString()} by ${invite.inviter?.tag}`);
            }
            
            //Get rate limit data
            else if (response.status === 429) {

                const retry = response.headers.get("retry-after");


                console.log(`${new Date().toLocaleString()} - Rate limit exceeded. Reset after ${retry} seconds.`);

                setTimeout(() => {
                    deleteInvite(guild, invite, guildInvites);
                }, parseInt(retry || "25") * 1000);
            }

            else
                console.log(`${new Date().toLocaleString()} - Error deleting invite ${code} created at ${new Date(inviteCreatedTimestamp).toLocaleString()} by ${invite.inviter?.tag} - ${response.status} - ${response.statusText}`);
        })
        .catch(error => {
            console.log(`${new Date().toLocaleString()} - Error deleting invite ${code} created at ${new Date(inviteCreatedTimestamp).toLocaleString()} by ${invite.inviter?.tag} - ${error}`);
        });
}

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

            const invitesArray = Array.from(invites.values())
                .filter(inv => inv.maxAge && inv.maxAge <= 2592000 && inv?.createdTimestamp && inv?.createdTimestamp < halfHourAgo.getTime())
                .splice(0, 5);

            console.log(`${new Date().toLocaleString()} - Clearing invites from ${guild.name} - Current invites: ${invitesArray.length}`);

            for (const invite of invitesArray) {
                await deleteInvite(guild, invite, guildInvites);
                cleared++;
            }
        }
    }
    catch (e) {
        console.log(new Date().toLocaleString() + " - " + e);
    }

    return cleared;
}
