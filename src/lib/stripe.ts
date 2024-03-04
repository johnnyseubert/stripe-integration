import Stripe from 'stripe';
import { config } from '../config';

export const stripe = new Stripe(config.stripeSecretKey, {
   apiVersion: '2023-10-16',
});

export const createCheckoutSession = async (userId: string) => {
   try {
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
      });

      return {
         url: session.url,
      };
   } catch (error: any) {
      throw new Error(error);
   }
};

export const handleProcessWebHookCheckout = async () => {};

export const handleProcessWebHookUpdateSubscription = async () => {};
