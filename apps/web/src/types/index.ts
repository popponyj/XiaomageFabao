export interface App {
  id: string;
  name: string;
  packageName: string;
  iconPath: string | null;
  createdAt: string;
  updatedAt: string;
  storeAccounts?: StoreAccount[];
  _count?: { releases: number };
}

export interface StoreAccount {
  id: string;
  appId: string;
  storeType: string;  // xiaomi, huawei, oppo, vivo, honor, appgallery
  storeName: string;  // 小米、华为、OPPO、vivo、荣耀、应用宝
  email: string;
  privateKey: string;
  publicKey: string;
  categoryId: string | null;
  categoryName: string | null;
  keywords: string | null;
  desc: string | null;
  brief: string | null;
  privacyUrl: string | null;
  apkPath: string | null;
  versionName: string | null;  // 本地上传的APK版本
  versionCode: string | null;
  storeVersionName: string | null;  // 商店线上版本
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseRecord {
  id: string;
  appId: string;
  storeAccountId: string;
  storeType: string;
  versionName: string;
  versionCode: string;
  status: 'pending' | 'success' | 'failed';
  message: string | null;
  createdAt: string;
  app?: { id: string; name: string; packageName: string };
  storeAccount?: { storeName: string; storeType: string };
}

// 应用商店选项
export const STORE_OPTIONS = [
  { type: 'xiaomi', name: '小米', color: '#FF6900' },
  { type: 'huawei', name: '华为', color: '#CF0A2C' },
  { type: 'oppo', name: 'OPPO', color: '#008B5C' },
  { type: 'vivo', name: 'vivo', color: '#415FFF' },
  { type: 'honor', name: '荣耀', color: '#00BFFF' },
  { type: 'appgallery', name: '应用宝', color: '#00A1FF' },
];
