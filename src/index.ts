import express from 'express';
import { createCheckoutController } from './controllers/checkout.controller';
import { stripeWebhookController } from './controllers/stripe.controller';
import { createTodoController } from './controllers/todo.controller';
import {
   createUserController,
   findOneUserController,
   listUsersController,
} from './controllers/user.controller';

const app = express();

app.post(
   '/webhook',
   express.raw({ type: 'application/json' }),
   stripeWebhookController
);

app.use(express.json());

app.get('/users', listUsersController);
app.get('/users/one', findOneUserController);
app.post('/users', createUserController);
app.post('/todos', createTodoController);
app.post('/checkout', createCheckoutController);

app.listen(3333, () => {
   console.log('Server started on port 3333');
});
