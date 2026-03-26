import { Router } from 'express';
import { prisma } from '../utils/prisma';
const router = Router({ mergeParams: true });

// 获取应用的所有商店配置
router.get('/', async (req, res) => {
  try {
    const { appId } = req.params as { appId: string };
    const accounts = await prisma.storeAccount.findMany({
      where: { appId },
      orderBy: { storeType: 'asc' },
    });
    res.json({ success: true, data: accounts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '获取商店配置失败' });
  }
});

// 获取单个商店配置
router.get('/:id', async (req, res) => {
  try {
    const account = await prisma.storeAccount.findUnique({
      where: { id: req.params.id },
    });
    if (!account) {
      return res.status(404).json({ success: false, error: '配置不存在' });
    }
    res.json({ success: true, data: account });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '获取配置失败' });
  }
});

// 创建商店配置
router.post('/', async (req, res) => {
  try {
    const { appId } = req.params as { appId: string };
    const { storeType, storeName, email, privateKey, publicKey } = req.body;

    if (!storeType || !storeName || !email || !privateKey || !publicKey) {
      return res.status(400).json({ success: false, error: '缺少必填字段' });
    }

    const account = await prisma.storeAccount.create({
      data: { appId, storeType, storeName, email, privateKey, publicKey },
    });

    res.json({ success: true, data: account });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '创建商店配置失败' });
  }
});

// 更新商店配置
router.put('/:id', async (req, res) => {
  try {
    const data: any = {};
    const fields = ['storeName', 'email', 'privateKey', 'publicKey', 'categoryId', 'categoryName', 'keywords', 'desc', 'brief', 'updateDesc', 'privacyUrl', 'isActive', 'versionName', 'versionCode'];
    fields.forEach(f => { if (req.body[f] !== undefined) data[f] = req.body[f]; });

    const account = await prisma.storeAccount.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: account });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '更新配置失败' });
  }
});

// 删除商店配置
router.delete('/:id', async (req, res) => {
  try {
    await prisma.storeAccount.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '删除配置失败' });
  }
});

export default router;
