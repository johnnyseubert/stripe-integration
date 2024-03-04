import express from 'express';
import {
   createUserController,
   findOneUserController,
   listUsersController,
} from './controllers/user.controller';
import { createTodoController } from './controllers/todo.controller';
import { createCheckoutController } from './controllers/checkout.controller';

const app = express();

app.use(express.json());

app.get('/users', listUsersController);
app.get('/users/one', findOneUserController);
app.post('/users', createUserController);
app.post('/todos', createTodoController);
app.post('/checkout', createCheckoutController);

app.listen(3333, () => {
   console.log('Server started on port 3333');
});
