export interface XiaomiApiResponse<T = unknown> {
  // 小米API返回的字段（query/push接口用 result，其他用 code）
  code?: number;
  result?: number;
  message: string;
  data?: T;
  packageInfo?: {
    appName: string;
    versionName: string;
    versionCode: number;
    packageName: string;
  };
}

export interface AppInfo {
  packageName: string;
  versionName: string;
  versionCode: string;
  appName: string;
  icon: string;
  categoryId: string;
  categoryName: string;
}

export interface ReleaseParams {
  packageName: string;
  appName: string;
  versionName: string;
  versionCode: string;
  apkPath: string;
  categoryId?: string;
  keywords?: string;
  desc?: string;
  brief?: string;
  updateDesc?: string;
  privacyUrl?: string;
}
