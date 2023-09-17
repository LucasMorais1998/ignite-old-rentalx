import express from 'express';
import { categories } from './routes/categories.routes';

const app = express();

app.use(express.json());

app.use('/categories', categories);

app.listen(3333, () => console.log('server is running!'));
