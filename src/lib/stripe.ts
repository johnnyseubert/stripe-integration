import Stripe from 'stripe';
import { config } from '../config';
import { prisma } from './prisma';

export const stripe = new Stripe(config.stripeSecretKey, {
   apiVersion: '2023-10-16',
});

export const getStripeCustomerByEmail = async (email: string) => {
   const customer = await stripe.customers.list({
      email,
   });

   return customer.data.length > 0 ? customer.data[0] : null;
};

export const createStripeCustomer = async (email: string, name?: string) => {
   let customer = await getStripeCustomerByEmail(email);

   if (!customer) {
      customer = await stripe.customers.create({
         email: email,
         name,
      });
   }

   return customer;
};

export const createCheckoutSession = async (
   userId: string,
   userEmail: string
) => {
   try {
      const customer = await createStripeCustomer(userEmail);

      const session = await stripe.checkout.sessions.create({
         payment_method_types: ['card'],
         mode: 'subscription',
         client_reference_id: userId,
         line_items: [
            {
               price: config.proPriceId,
               quantity: 1,
            },
         ],
         success_url: 'https://example.com/success',
         cancel_url: 'https://example.com/cancel',
         customer: customer.id,
      });

      return {
         url: session.url,
      };
   } catch (error: any) {
      throw new Error(error);
   }
};

export const handleProcessWebHookCheckout = async (
   session: Stripe.Checkout.Session
) => {
   if (session.status !== 'complete') return;

   // Meu id do usuário no banco que associei ao checkout
   const clientReferenceId = session.client_reference_id;
   // Id da compra na stripe
   const stripeSubscriptionId = session.subscription;
   // Id do usuário na stripe
   const stripeCustomerId = session.customer;

   if (!clientReferenceId || !stripeSubscriptionId || !stripeCustomerId) {
      throw new Error('handleProcessWebHookCheckout Missing required fields');
   }

   const userExists = await prisma.user.findFirst({
      where: {
         id: clientReferenceId,
      },
      select: {
         id: true,
      },
   });

   if (!userExists) {
      throw new Error('handleProcessWebHookCheckout user not found');
   }

   await prisma.user.update({
      data: {
         stripeCustomerId: stripeCustomerId as string,
         stripeSubscriptionId: stripeSubscriptionId as string,
      },
      where: {
         id: clientReferenceId,
      },
   });
};

export const handleProcessWebHookUpdateSubscription = async (
   subscription: Stripe.Subscription
) => {
   const subscriptionStatus = subscription.status;
   // Id da compra na stripe
   const stripeSubscriptionId = subscription.id;
   // Id do usuário na stripe
   const stripeCustomerId = subscription.customer;

   const userExists = await prisma.user.findFirst({
      where: {
         stripeCustomerId: stripeCustomerId as string,
      },
      select: {
         id: true,
      },
   });

   if (!userExists) {
      throw new Error('handleProcessWebHookUpdateSubscription user not found');
   }

   await prisma.user.update({
      data: {
         stripeSubscriptionId: stripeSubscriptionId as string,
         stripeSubscriptionStatus: subscriptionStatus as string,
      },
      where: {
         id: userExists.id,
      },
   });
};
