import { prisma } from "../prisma";


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