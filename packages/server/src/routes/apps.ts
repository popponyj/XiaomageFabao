import { Router } from 'express';
import { prisma } from '../utils/prisma';

const router = Router();

// 获取所有应用
router.get('/', async (req, res) => {
  try {
    const apps = await prisma.app.findMany({
      include: {
        storeAccounts: {
          select: {
            id: true,
            storeType: true,
            storeName: true,
            isActive: true,
            email: true,
            versionName: true,
            versionCode: true,
            storeVersionName: true,
            apkPath: true,
          },
        },
        _count: {
          select: { releases: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json({ success: true, data: apps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '获取应用列表失败' });
  }
});

// 获取单个应用
router.get('/:id', async (req, res) => {
  try {
    const app = await prisma.app.findUnique({
      where: { id: req.params.id },
      include: {
        storeAccounts: true,
        releases: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
    if (!app) {
      return res.status(404).json({ success: false, error: '应用不存在' });
    }
    res.json({ success: true, data: app });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '获取应用失败' });
  }
});

// 创建应用
router.post('/', async (req, res) => {
  try {
    console.log('Request body:', req.body);
    const name = req.body?.name;
    const packageName = req.body?.packageName;
    
    if (!name || !packageName) {
      return res.status(400).json({ success: false, error: '缺少必填字段: name和packageName' });
    }

    const app = await prisma.app.create({
      data: { name, packageName },
    });

    res.json({ success: true, data: app });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '创建应用失败' });
  }
});

// 更新应用
router.put('/:id', async (req, res) => {
  try {
    const { name, packageName } = req.body;
    
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (packageName !== undefined) data.packageName = packageName;

    const app = await prisma.app.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: app });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '更新应用失败' });
  }
});

// 删除应用
router.delete('/:id', async (req, res) => {
  try {
    await prisma.app.delete({
      where: { id: req.params.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '删除应用失败' });
  }
});

export default router;
