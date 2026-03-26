import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import { generateSignature, getStringMD5, getFileMD5 } from '../utils/xiaomi-signature';
import type { XiaomiApiResponse, ReleaseParams } from '../types';

const XIAOMI_API_BASE = 'https://api.developer.xiaomi.com/devupload';

export class XiaomiApiClient {
  private email: string;
  private password: string;
  private certPem: string; // 小米 X.509 公钥证书

  constructor(email: string, password: string, certPem: string) {
    this.email = email;
    this.password = password;
    this.certPem = certPem;
  }

  /**
   * 查询应用信息
   * 对应 Python: query()
   */
  async queryApp(packageName: string): Promise<XiaomiApiResponse> {
    const requestData = JSON.stringify({
      packageName,
      userName: this.email,
    });

    const { SIG } = generateSignature(
      [{ name: 'RequestData', hash: getStringMD5(requestData) }],
      this.password,
      this.certPem
    );

    const form = new FormData();
    form.append('RequestData', requestData);
    form.append('SIG', SIG);

    const response = await axios.post(
      `${XIAOMI_API_BASE}/dev/query`,
      form,
      { headers: { ...form.getHeaders() } }
    );

    return response.data;
  }

  /**
   * 获取分类列表
   * 对应 Python: get_categories()
   */
  async getCategories(): Promise<XiaomiApiResponse> {
    const response = await axios.post(`${XIAOMI_API_BASE}/dev/category`);
    return response.data;
  }

  /**
   * 提交应用推送
   * 对应 Python: push()
   *
   * 注意：appInfo 在 RequestData 中是 json.dumps 的字符串
   */
  async pushApp(params: ReleaseParams): Promise<XiaomiApiResponse> {
    // 构建 appDetail（与 Python 示例一致）
    const appDetail: Record<string, any> = {
      appName: params.appName,
      packageName: params.packageName,
      versionName: params.versionName,
    };
    if (params.categoryId) appDetail.category = parseInt(params.categoryId, 10);
    if (params.keywords) appDetail.keyWords = params.keywords;
    if (params.desc) appDetail.desc = params.desc;
    if (params.brief) appDetail.brief = params.brief;
    if (params.updateDesc) appDetail.updateDesc = params.updateDesc;
    if (params.privacyUrl) appDetail.privacyUrl = params.privacyUrl;

    // RequestData 中 appInfo 是 JSON 字符串（与 Python 第 105 行一致）
    const requestData = JSON.stringify({
      userName: this.email,
      appInfo: JSON.stringify(appDetail),
      synchroType: 1,
    });

    // 收集签名条目
    const sigEntries: { name: string; hash: string }[] = [];
    sigEntries.push({ name: 'RequestData', hash: getStringMD5(requestData) });

    if (params.apkPath && fs.existsSync(params.apkPath)) {
      sigEntries.push({ name: 'apk', hash: getFileMD5(params.apkPath) });
    }

    const { SIG } = generateSignature(sigEntries, this.password, this.certPem);

    // 构建表单
    const form = new FormData();
    form.append('RequestData', requestData);
    form.append('SIG', SIG);

    if (params.apkPath && fs.existsSync(params.apkPath)) {
      form.append('apk', fs.createReadStream(params.apkPath));
    }

    const response = await axios.post(
      `${XIAOMI_API_BASE}/dev/push`,
      form,
      {
        headers: { ...form.getHeaders() },
        timeout: 300000,
      }
    );

    return response.data;
  }
}
