import express from 'express';
import cors from 'cors';
import path from 'path';
import appsRouter from './routes/apps';
import storeAccountsRouter from './routes/storeAccounts';
import uploadRouter from './routes/upload';
import releasesRouter from './routes/releases';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 调试中间件
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/apps', appsRouter);
app.use('/api/apps/:appId/store-accounts', storeAccountsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/releases', releasesRouter);

// 错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: err.message || '服务器内部错误' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
