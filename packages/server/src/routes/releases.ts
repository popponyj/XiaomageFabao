import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { XiaomiApiClient } from '../services/xiaomi-api';

const router = Router();

// 获取所有发布记录
router.get('/', async (req, res) => {
  try {
    const releases = await prisma.releaseRecord.findMany({
      include: {
        app: { select: { id: true, name: true, packageName: true } },
        storeAccount: { select: { storeName: true, storeType: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: releases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '获取发布记录失败' });
  }
});

// 获取应用的发布记录
router.get('/app/:appId', async (req, res) => {
  try {
    const releases = await prisma.releaseRecord.findMany({
      where: { appId: req.params.appId },
      include: { storeAccount: { select: { storeName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: releases });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '获取发布记录失败' });
  }
});

// 提交发布
router.post('/', async (req, res) => {
  try {
    const { storeAccountId } = req.body;

    // 获取商店配置
    const storeAccount = await prisma.storeAccount.findUnique({
      where: { id: storeAccountId },
      include: { app: true },
    });

    if (!storeAccount) {
      return res.status(404).json({ success: false, error: '商店配置不存在' });
    }

    if (!storeAccount.apkPath) {
      return res.status(400).json({ success: false, error: '请先上传 APK 文件' });
    }

    if (!storeAccount.versionName || !storeAccount.versionCode) {
      return res.status(400).json({ success: false, error: '版本信息不完整' });
    }

    // 创建发布记录
    const release = await prisma.releaseRecord.create({
      data: {
        appId: storeAccount.appId,
        storeAccountId,
        storeType: storeAccount.storeType,
        versionName: storeAccount.versionName,
        versionCode: storeAccount.versionCode,
        status: 'pending',
      },
    });

    // 小米商店发布
    if (storeAccount.storeType === 'xiaomi') {
      try {
        if (!storeAccount.publicKey) {
          return res.status(400).json({ success: false, error: '缺少小米公钥证书，请先编辑商店配置添加公钥' });
        }
        const client = new XiaomiApiClient(storeAccount.email, storeAccount.privateKey, storeAccount.publicKey);
        const result = await client.pushApp({
          packageName: storeAccount.app.packageName,
          appName: storeAccount.app.name,
          versionName: storeAccount.versionName,
          versionCode: storeAccount.versionCode,
          apkPath: storeAccount.apkPath,
          categoryId: storeAccount.categoryId || undefined,
          keywords: storeAccount.keywords || undefined,
          desc: storeAccount.desc || undefined,
          brief: storeAccount.brief || undefined,
          updateDesc: storeAccount.updateDesc || undefined,
          privacyUrl: storeAccount.privacyUrl || undefined,
        });

        // 小米接口返回 result 为 0 或 message 包含"成功"都表示成功
        const isSuccess = result.result === 0 || 
                          (result.message && result.message.includes('成功'));
        await prisma.releaseRecord.update({
          where: { id: release.id },
          data: {
            status: isSuccess ? 'success' : 'failed',
            message: result.message,
          },
        });

        res.json({ success: true, data: result });
      } catch (apiError: any) {
        await prisma.releaseRecord.update({
          where: { id: release.id },
          data: { status: 'failed', message: apiError.message },
        });
        res.status(500).json({ success: false, error: `发布失败: ${apiError.message}` });
      }
    } else {
      res.status(400).json({ success: false, error: '暂不支持该应用商店' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '提交发布失败' });
  }
});

// 查询商店线上版本
router.get('/store-version/:storeAccountId', async (req, res) => {
  try {
    const { storeAccountId } = req.params;

    const storeAccount = await prisma.storeAccount.findUnique({
      where: { id: storeAccountId },
      include: { app: true },
    });

    if (!storeAccount) {
      return res.status(404).json({ success: false, error: '商店配置不存在' });
    }

    // 小米商店查询
    if (storeAccount.storeType === 'xiaomi') {
      try {
        if (!storeAccount.publicKey) {
          return res.status(400).json({ success: false, error: '缺少小米公钥证书' });
        }
        const client = new XiaomiApiClient(storeAccount.email, storeAccount.privateKey, storeAccount.publicKey);
        const result = await client.queryApp(storeAccount.app.packageName);

        // 解析返回的版本信息
        // 小米API返回结构: { result: 0, packageInfo: { versionName, ... }, message }
        let storeVersionName = null;
        if (result.result === 0) {
          // 小米API返回的数据在 result.packageInfo 中
          const appData = result.packageInfo as any;
          if (appData && appData.versionName) {
            storeVersionName = appData.versionName;
          }
        }

        // 更新数据库中的商店版本
        await prisma.storeAccount.update({
          where: { id: storeAccountId },
          data: { storeVersionName },
        });

        res.json({
          success: true,
          data: {
            storeVersionName,
            packageName: storeAccount.app.packageName,
            rawResponse: result,
          },
        });
      } catch (apiError: any) {
        res.status(500).json({ success: false, error: `查询失败: ${apiError.message}` });
      }
    } else {
      res.status(400).json({ success: false, error: '暂不支持该应用商店' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: '查询商店版本失败' });
  }
});

export default router;
