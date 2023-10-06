import { prisma } from "../prisma";


export const getDistinctReferrals = async (username: string) => {

    try {
        const result = await prisma.discordInvite.findMany({
            where: {
                inviter: username,
                validated: true
            },
            distinct: ['invitee']
        });

        return result.length;
    }
    catch (e) {
        console.log(new Date().toLocaleString() + " - " + e);
        return 0;
    }

}