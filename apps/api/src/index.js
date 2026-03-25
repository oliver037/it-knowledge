import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import routes from './routes.js';

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').map((item) => item.trim()) || '*'
  })
);
app.use(express.json({ limit: '1mb' }));

app.use('/api', routes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: '服务器异常，请稍后重试' });
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}`);
});
