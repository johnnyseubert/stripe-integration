import { Request, Response } from 'express';
import {
   handleProcessWebHookCheckout,
   handleProcessWebHookUpdateSubscription,
   stripe,
} from '../lib/stripe';
import { config } from '../config';

export const stripeWebhookController = async (req: Request, res: Response) => {
   const signature = req.headers['stripe-signature'] as string;

   let event;

   if (!signature) {
      return res.status(400).send('Webhook Error: Missing stripe-signature');
   }

   if (!config.websocketSecret) {
      throw new Error('Missing websocketSecret');
   }

   try {
      event = await stripe.webhooks.constructEventAsync(
         req.body,
         signature,
         config.websocketSecret
      );
   } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
   }

   switch (event.type) {
      case 'checkout.session.completed':
         await handleProcessWebHookCheckout(event.data.object);
         break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
         handleProcessWebHookUpdateSubscription(event.data.object);
         break;
      default:
         console.log(`Unhandled event type ${event.type}`);
   }

   res.send();
};
