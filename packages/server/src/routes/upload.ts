import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma';

const router = Router({ mergeParams: true });
const UPLOAD_DIR = process.env.UPLOAD_DIR || '../../uploads';

// 确保上传目录存在
const uploadDir = path.resolve(__dirname, UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
});

// 上传 APK 到商店配置
router.post('/:storeAccountId', upload.single('apk'), async (req, res) => {
  try {
    const { storeAccountId } = req.params;

    if (!req.file) {
      return res.status(400).json({ success: false, error: '没有上传文件' });
    }

    // 更新商店配置的 APK 路径和版本信息
    const updateData: any = { apkPath: req.file.path };
    if (req.body.versionName) updateData.versionName = req.body.versionName;
    if (req.body.versionCode) updateData.versionCode = String(req.body.versionCode);

    await prisma.storeAccount.update({
      where: { id: storeAccountId },
      data: updateData,
    });

    res.json({
      success: true,
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
      },
    });
  } catch (error: any) {
    console.error('上传失败:', error.message || error);
    res.status(500).json({ success: false, error: `上传失败: ${error.message}` });
  }
});

export default router;
