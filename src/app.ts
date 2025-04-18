import express, { Application } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRoutes from './routes/userRoute';
import chatRoutes from './routes/chatRoute';
import taskRoutes from './routes/taskRoute';
import path from 'path';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, '../client/build')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tasks', taskRoutes);

app.listen(PORT,()=>{
    console.log(`chat app running this port ${PORT}` )
})