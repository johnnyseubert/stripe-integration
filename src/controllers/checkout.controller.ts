import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { createCheckoutSession } from '../lib/stripe';

export const createCheckoutController = async (req: Request, res: Response) => {
   const userId = req.headers['x-user-id'] as string;

   if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
   }

   const user = await prisma.user.findFirst({
      where: {
         id: userId,
      },
   });

   if (!user) {
      return res.status(400).json({ error: 'user not found' });
   }

   const checkout = await createCheckoutSession(userId);

   return res.json(checkout);
};
