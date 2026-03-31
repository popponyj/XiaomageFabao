import crypto from 'crypto';

/**
 * 生成应用宝API签名
 * 
 * 签名规则：
 * 1. 请求参数（除sign外的公共参数+业务参数）按照ASCII升序排序
 * 2. 使用&拼接字符串，k1=v1&k2=v2（值为null的参数不参与签名）
 * 3. 对拼接字符串进行HmacSHA256计算，密钥为access_secret
 * 4. 将结果转换为小写16进制
 * 
 * @param params 请求参数对象
 * @param accessSecret 接入密钥
 * @returns 签名结果
 */
export function generateYingyongbaoSignature(
  params: Record<string, any>,
  accessSecret: string
): string {
  // 过滤掉null/undefined/sign参数
  const filteredParams: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && key !== 'sign' && value !== '') {
      filteredParams[key] = String(value);
    }
  }
  
  // 按键名ASCII升序排序
  const sortedKeys = Object.keys(filteredParams).sort();
  
  // 拼接参数 k1=v1&k2=v2
  const signParts = sortedKeys.map(key => `${key}=${filteredParams[key]}`);
  const signString = signParts.join('&');
  
  // HmacSHA256计算
  const hmac = crypto.createHmac('sha256', accessSecret);
  hmac.update(signString, 'utf8');
  const signature = hmac.digest('hex').toLowerCase();
  
  return signature;
}

/**
 * 计算文件MD5
 */
export function getFileMD5(filePath: string): string {
  const fs = require('fs');
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').toLowerCase();
}

/**
 * 计算字符串MD5
 */
export function getStringMD5(str: string): string {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex').toLowerCase();
}
