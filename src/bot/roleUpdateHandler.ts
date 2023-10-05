import { GuildMember, PartialGuildMember, Role } from "discord.js";
import { handleVerifiedRole } from "../methods/roles";


export const memberRoleUpdateHandler = async (oldMember: GuildMember | PartialGuildMember, newMember: GuildMember | PartialGuildMember) => {

    const VERIFIED = "Verified";

    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
    const verifiedRole = addedRoles.find(role => role.name === VERIFIED);

    if (verifiedRole) {
        await handleVerifiedRole(newMember);
    }

}