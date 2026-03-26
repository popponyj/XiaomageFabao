# 小码法宝 - 应用商店自动发布系统

基于 React、Express 的 Web 应用，用于管理多个 APP 在各大应用商店的自动发布。解决频繁切换开发者账号、手动上传 APK 的繁琐问题。

## 核心功能

- **应用管理**：添加/管理APP基本信息
- **商店配置**：为每个APP配置各应用商店的开发者账号信息
- **APK上传**：上传并关联APP的APK包，记录版本信息
- **版本对比**：显示商店线上版本与本地APK版本的对比
- **一键发布**：调用商店API提交版本更新
- **发布记录**：查看历史发布记录和状态

## 技术栈

### 前端
- **框架**：React 19 + TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS
- **图标**：react-icons

### 后端
- **框架**：Node.js + Express + TypeScript
- **数据库**：SQLite + Prisma ORM
- **API调用**：axios + form-data
- **文件上传**：multer
- **签名加密**：原生 crypto 模块（X.509证书 + RSA分段加密）

## 项目结构

```
xiaomage-fabao/
├── apps/
│   └── web/                    # 前端项目 (React + Vite)
│       ├── src/
│       │   ├── pages/          # 页面组件
│       │   ├── types/          # 类型定义
│       │   └── main.tsx        # 应用入口
│       └── package.json
├── packages/
│   └── server/                 # 后端项目 (Express)
│       ├── src/
│       │   ├── routes/         # API 路由
│       │   ├── services/       # 业务逻辑（小米API等）
│       │   ├── utils/          # 工具函数（签名等）
│       │   └── index.ts        # 入口
│       └── package.json
├── prisma/
│   └── schema.prisma           # 数据库模型
├── uploads/                    # 上传文件存储
└── docs/
    └── xiaomi-api-docs.md      # 小米API接口文档
```

## 数据库模型

### App (应用表)
- id: 唯一标识
- name: 应用名称
- packageName: 包名
- iconPath: 图标路径

### StoreAccount (商店配置表)
- id: 唯一标识
- appId: 关联应用
- storeType: 商店类型（xiaomi/huawei/oppo等）
- storeName: 商店显示名称
- email: 开发者邮箱
- privateKey: 访问密码（小米开发者站的"私钥"）
- publicKey: 小米公钥证书
- desc/brief/updateDesc: 应用描述信息
- apkPath: APK文件路径
- versionName/versionCode: 本地APK版本
- storeVersionName: 商店线上版本

### ReleaseRecord (发布记录表)
- id: 唯一标识
- appId: 关联应用
- storeAccountId: 关联商店配置
- versionName/versionCode: 版本信息
- status: 状态 (pending/success/failed)
- message: 返回信息

## 快速开始

### 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装后端依赖
cd packages/server && npm install

# 安装前端依赖
cd apps/web && npm install
```

### 数据库初始化

```bash
# 生成 Prisma Client
export DATABASE_URL="file:./prisma/dev.db"
npx prisma generate --schema=./prisma/schema.prisma

# 创建数据库文件
cd packages/server && mkdir -p prisma && touch prisma/dev.db
```

### 开发模式

```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run dev:server  # 后端 http://localhost:3001
npm run dev:web     # 前端 http://localhost:5173
```

### 生产构建

```bash
# 构建前端
cd apps/web && npm run build
```

## 使用指南

### 1. 添加应用

1. 进入「应用管理」页面
2. 点击「添加应用」
3. 填写应用名称和包名

### 2. 配置商店账号

1. 在应用列表中点击「添加商店」
2. 选择应用商店（目前支持小米）
3. 填写开发者邮箱、访问密码、小米公钥
4. 填写应用描述、一句话简介、更新说明

### 3. 上传 APK

1. 找到目标应用商店配置
2. 点击「上传APK」按钮
3. 填写版本名称和版本编码
4. 选择 APK 文件上传

### 4. 查询商店版本

1. 点击版本信息旁的刷新图标
2. 系统调用商店API查询线上版本
3. 显示「商店版本」与「APK版本」对比

### 5. 提交发布

1. 确保已上传APK且版本信息正确
2. 点击「发布到商店」按钮
3. 在确认弹窗中点击「确认发布」
4. 等待发布完成，查看发布记录

## 小米 API 对接

### 签名机制

小米 API 使用特殊的签名方式：

1. 计算参数 MD5 值
2. 组装 `password` + `sig` 数组为 JSON
3. 使用小米提供的 X.509 公钥证书提取 RSA 公钥
4. 分段 RSA 加密（每段最大117字节）
5. 转小写 16 进制字符串

### API 接口

- `POST /dev/query` - 查询应用信息
- `POST /dev/category` - 获取分类列表
- `POST /dev/push` - 提交应用更新

## 版本历史

### v1.0.0 (2026-03-26)
- 初始版本
- 支持小米应用商店对接
- 应用管理和商店配置功能
- APK上传和版本管理
- 商店版本查询和对比
- 发布确认弹窗和加载状态

## 许可证

MIT
