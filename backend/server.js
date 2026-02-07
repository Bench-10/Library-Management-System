import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors';


//Routes
import bookRoutes from './routes/bookRoutes.js';
import userroutes from './routes/userroutes.js';
import favoritesRoutes from './routes/favoritesRoutes.js';

dotenv.config();

const app = express();

app.use(cors({origin: "http://localhost:5173"})); 
app.use(express.json());

app.use('/api', bookRoutes)
app.use('/api', userroutes)
app.use('/api/favorites', favoritesRoutes)

//app.use('/api', userRouts)

//app.use('/api', paymentRoutes)


app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});