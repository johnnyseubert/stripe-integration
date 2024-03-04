import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const listUsersController = async (req: Request, res: Response) => {
   const users = await prisma.user.findMany({
      include: {
         todos: true,
      },
   });
   return res.json(users);
};

export const findOneUserController = async (req: Request, res: Response) => {
   const userId = req.headers['x-user-id'] as string;

   if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
   }

   const user = await prisma.user.findUnique({
      where: {
         id: userId,
      },
   });

   return res.json(user);
};

export const createUserController = async (req: Request, res: Response) => {
   const { name, email } = req.body as { name?: string; email?: string };

   if (!name || !email) {
      return res.status(400).json({ error: '"name" and "email" are required' });
   }

   const userEmailAlreadyExists = await prisma.user.findFirst({
      where: {
         email,
      },
   });

   if (userEmailAlreadyExists) {
      return res.status(400).json({ error: 'Email already exists' });
   }

   const user = await prisma.user.create({
      data: {
         name,
         email,
      },
   });

   return res.json(user);
};
