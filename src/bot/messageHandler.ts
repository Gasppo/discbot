import { Message } from "discord.js";
import { getDistinctReferrals } from "../methods/referrals";
import { refreshRole } from "../methods/roles";
import { clearInvites } from "../methods/invites";

export const botMessageHandler = async (message: Message<boolean>, inviteCache: Map<string, Map<string, number>>) => {
    if (message.author.bot) return;

    const content = message.content.trim().toLowerCase();

    if (content === "!refrank") return await handleRefRank(message);
    if (content === "!fedeselacome") return await handleFedeSelacome(message);
    if (content === "!refreshrole") return await handleRoleRefresh(message);
    if (content === "!clearinvites") return await handleClearInvites(message, inviteCache);

    //Add more commands here
}

const handleClearInvites = async (message: Message<boolean>, inviteCache: Map<string, Map<string, number>>) => {

    const user = message.member?.user

    if (message.member?.roles.cache.find(role => role.name === "Mod") || user?.username.toLocaleLowerCase() === "gasppo") {
        try {
            if (message.guild) {
                const cleared = await clearInvites(message.guild, inviteCache);
                const response = `Cleared ${cleared} invites!`
                user ? user.send(response) : message.reply(response);
            }
            else {
                const response = "Sorry, I couldn't clear invites at the moment. No server found."
                user ? user.send(response) : message.reply(response);
            }
        } catch (error) {
            console.error(`${new Date().toLocaleString()} - Error clearing invites:`, error);
            const response = "Sorry, I couldn't clear invites at the moment."
            user ? user.send(response) : message.reply(response);
        }
    }
    else {
        const response = "You don't have permission to do that."
        user ? user.send(response) : message.reply(response);
    }
}

const handleRefRank = async (message: Message<boolean>) => {

    try {
        const referralCount = await getDistinctReferrals(message.author.tag);
        await handleRoleRefresh(message);
        message.reply(`You have referred ${referralCount} members! Role now updated.`);
    } catch (error) {
        console.error(`${new Date().toLocaleString()} - Error fetching referrals:`, error);
        message.reply("Sorry, I couldn't fetch your referral count at the moment.");
    }
}

const handleFedeSelacome = async (message: Message<boolean>) => {
    try {
        message.reply("Fede se la come");
    } catch (error) {
        console.error(`${new Date().toLocaleString()} - Error fetching referrals:`, error);
        message.reply("Sorry, I couldn't fetch your referral count at the moment.");
    }
}

const handleRoleRefresh = async (message: Message<boolean>) => {
    try {
        if (message.member) {
            await refreshRole(message.member);
        }

    }
    catch (error) {
        console.error(`${new Date().toLocaleString()} - Error refreshing role:`, error);
        message.reply("Sorry, I couldn't refresh your role at the moment.");
    }
}