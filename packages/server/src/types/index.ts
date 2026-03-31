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

// 应用宝API类型
export interface YingyongbaoApiResponse<T = unknown> {
  ret: number;
  msg: string;
  data?: T;
  // 查询详情时直接返回在根级别
  pkg_name?: string;
  app_name?: string;
  // 上传信息
  pre_sign_url?: string;
  serial_number?: string;
  // 审核状态
  audit_status?: number;
  audit_reason?: string;
}

export interface YingyongbaoAppDetail {
  pkg_name: string;
  app_name: string;
  app_type: number;
  category: number;
  operator?: string;
  developer?: string;
  introduce?: string;
  one_word_summary?: string;
  age_level?: number;
  screen_size?: number;
  language?: number;
  is_support_ipv6?: number;
  device_type?: number;
  feature?: string;
  login_flag?: number;
  login_account?: string;
  pay_type?: number;
  demo_video_flag?: number;
}

export interface YingyongbaoReleaseParams {
  pkgName: string;
  appId: string;
  appName?: string;
  category?: number;
  introduce?: string;
  oneWordSummary?: string;
  feature?: string;
  deployType?: number;
  apk32FileSerialNumber?: string;
  apk32FileMd5?: string;
  apk64FileSerialNumber?: string;
  apk64FileMd5?: string;
}
