import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createTodoController = async (req: Request, res: Response) => {
   const { title } = req.body as { title?: string };
   const userId = req.headers['x-user-id'] as string;

   if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
   }

   if (!title) {
      return res.status(400).json({ error: '"title" are required' });
   }

   const user = await prisma.user.findFirst({
      where: {
         id: userId,
      },
      select: {
         id: true,
         stripeSubscriptionId: true,
         stripeSubscriptionStatus: true,
         _count: {
            select: {
               todos: true,
            },
         },
      },
   });

   if (!user) {
      return res.status(400).json({ error: 'user not found' });
   }

   const hasQuotaAvailable = user._count.todos < 5;
   const hasActiveSubscription =
      user.stripeSubscriptionId && user.stripeSubscriptionStatus === 'active';

   if (!hasActiveSubscription && !hasQuotaAvailable) {
      return res
         .status(400)
         .json({
            error: 'You need a PRO subscription, to create more than five todos',
         });
   }

   const todo = await prisma.todo.create({
      data: {
         title,
         userId,
      },
   });

   return res.json(todo);
};
