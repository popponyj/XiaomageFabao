import axios from 'axios';
import fs from 'fs';
import { generateYingyongbaoSignature, getFileMD5 } from '../utils/yingyongbao-signature';
import type { YingyongbaoApiResponse, YingyongbaoReleaseParams, YingyongbaoAppDetail } from '../types';

const YINGYONGBAO_API_BASE = 'https://p.open.qq.com/open_file/developer_api';

export class YingyongbaoApiClient {
  private userId: string;
  private accessSecret: string;

  constructor(userId: string, accessSecret: string) {
    this.userId = userId;
    this.accessSecret = accessSecret;
  }

  /**
   * 获取公共参数（包含签名）
   */
  private getSignedParams(businessParams: Record<string, any>): Record<string, string> {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // 先组装参数（不含sign）
    const params: Record<string, any> = {
      user_id: this.userId,
      timestamp,
      ...businessParams,
    };
    
    // 计算签名
    const sign = generateYingyongbaoSignature(params, this.accessSecret);
    
    return {
      ...params,
      sign,
    };
  }

  /**
   * 查询应用详情
   * 接口: /query_app_detail
   */
  async queryAppDetail(appId: string, pkgName: string): Promise<YingyongbaoApiResponse<YingyongbaoAppDetail>> {
    const params = this.getSignedParams({
      app_id: appId,
      pkg_name: pkgName,
    });

    const response = await axios.post(
      `${YINGYONGBAO_API_BASE}/query_app_detail`,
      new URLSearchParams(params).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    return response.data;
  }

  /**
   * 获取文件上传信息
   * 返回COS预签名URL和文件流水号
   * 接口: /get_file_upload_info
   */
  async getFileUploadInfo(
    appId: string,
    pkgName: string,
    fileType: 'apk' | 'img' | 'pdf' | 'video' | 'txt',
    fileName: string
  ): Promise<YingyongbaoApiResponse<{ pre_sign_url: string; serial_number: string }>> {
    const params = this.getSignedParams({
      app_id: appId,
      pkg_name: pkgName,
      file_type: fileType,
      file_name: fileName,
    });

    const response = await axios.post(
      `${YINGYONGBAO_API_BASE}/get_file_upload_info`,
      new URLSearchParams(params).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    return response.data;
  }

  /**
   * 上传文件到腾讯云COS
   * 使用预签名URL直接上传
   */
  async uploadFileToCos(preSignUrl: string, filePath: string): Promise<void> {
    const fileContent = fs.readFileSync(filePath);
    
    const response = await axios.put(preSignUrl, fileContent, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      timeout: 60000, // 上传文件可能需要较长时间
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
    });

    if (response.status !== 200) {
      throw new Error(`上传文件失败，状态码: ${response.status}`);
    }
  }

  /**
   * 应用更新
   * 接口: /update_app
   */
  async updateApp(params: YingyongbaoReleaseParams): Promise<YingyongbaoApiResponse> {
    const businessParams: Record<string, any> = {
      pkg_name: params.pkgName,
      app_id: params.appId,
      deploy_type: params.deployType || 1, // 默认审核通过后立即发布
    };

    // 可选参数
    if (params.appName) businessParams.app_name = params.appName;
    if (params.category) businessParams.category = params.category;
    if (params.introduce) businessParams.introduce = params.introduce;
    if (params.oneWordSummary) businessParams.one_word_summary = params.oneWordSummary;
    if (params.feature) businessParams.feature = params.feature;
    if (params.apk32FileSerialNumber) {
      businessParams.apk32_flag = 1;
      businessParams.apk32_file_serial_number = params.apk32FileSerialNumber;
      if (params.apk32FileMd5) businessParams.apk32_file_md5 = params.apk32FileMd5;
    }
    if (params.apk64FileSerialNumber) {
      businessParams.apk64_flag = 1;
      businessParams.apk64_file_serial_number = params.apk64FileSerialNumber;
      if (params.apk64FileMd5) businessParams.apk64_file_md5 = params.apk64FileMd5;
    }

    const signedParams = this.getSignedParams(businessParams);

    const response = await axios.post(
      `${YINGYONGBAO_API_BASE}/update_app`,
      new URLSearchParams(signedParams).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 60000, // 更新接口可能需要较长时间
      }
    );

    return response.data;
  }

  /**
   * 查询应用更新审核状态
   * 接口: /query_app_update_status
   */
  async queryAppUpdateStatus(appId: string, pkgName: string): Promise<YingyongbaoApiResponse<{
    audit_status: number;
    audit_reason?: string;
  }>> {
    const params = this.getSignedParams({
      app_id: appId,
      pkg_name: pkgName,
    });

    const response = await axios.post(
      `${YINGYONGBAO_API_BASE}/query_app_update_status`,
      new URLSearchParams(params).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 10000,
      }
    );

    return response.data;
  }
}
