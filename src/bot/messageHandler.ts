import { Message } from "discord.js";
import { getDistinctReferrals } from "../methods/referrals";
import { refreshRole } from "../methods/roles";

export const botMessageHandler = async (message: Message<boolean>) => {
    if (message.author.bot) return;

    const content = message.content.trim().toLowerCase();

    if (content === "!refrank") return await handleRefRank(message);
    if (content === "!fedeselacome") return await handleFedeSelacome(message);
    if (content === "!refreshrole") return await handleRoleRefresh(message);

    //Add more commands here
}

const handleRefRank = async (message: Message<boolean>) => {
    try {
        const referralCount = await getDistinctReferrals(message.author.tag);
        message.reply(`You have referred ${referralCount} members!`);
    } catch (error) {
        console.error("Error fetching referrals:", error);
        message.reply("Sorry, I couldn't fetch your referral count at the moment.");
    }
}

const handleFedeSelacome = async (message: Message<boolean>) => {
    try {
        message.reply("Fede se la come");
    } catch (error) {
        console.error("Error fetching referrals:", error);
        message.reply("Sorry, I couldn't fetch your referral count at the moment.");
    }
}

const handleRoleRefresh = async (message: Message<boolean>) => {
    try {
        if (message.member) {
            await refreshRole(message.member);
            message.reply("Your role has been refreshed!");
        }

    }
    catch (error) {
        console.error("Error refreshing role:", error);
        message.reply("Sorry, I couldn't refresh your role at the moment.");
    }
}