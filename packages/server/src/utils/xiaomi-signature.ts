import crypto from 'crypto';
import fs from 'fs';

interface SigEntry {
  name: string;
  hash: string;
}

/**
 * 从 X.509 证书中提取 PKCS1 格式的 RSA 公钥
 * 对应 Python: public_key.public_bytes(encoding=PEM, format=PKCS1)
 */
function extractPublicKeyFromCert(certPem: string): string {
  const cert = new crypto.X509Certificate(certPem);
  const pubKey = cert.publicKey;
  // 导出为 PKCS1 格式，与 Python 示例一致
  return pubKey.export({ type: 'pkcs1', format: 'pem' }) as string;
}

/**
 * 用 RSA 公钥分段加密数据（PKCS1_v1_5）
 * 对应 Python: encrypt_by_public_key
 * 
 * 小米证书是 1024 位 RSA 密钥
 * 每段最多加密 117 字节（128 - 11 padding）
 */
function rsaEncryptLong(plaintext: Buffer, publicKeyPem: string): string {
  // 固定使用 117 字节分段（与 Python 示例的 1024 位密钥一致）
  // Python: ENCRYPT_GROUP_SIZE = GROUP_SIZE - 11 = 128 - 11 = 117
  const ENCRYPT_GROUP_SIZE = 117;

  const result: Buffer[] = [];
  let offset = 0;

  while (offset < plaintext.length) {
    const remain = plaintext.length - offset;
    const segSize = Math.min(remain, ENCRYPT_GROUP_SIZE);
    const segment = plaintext.subarray(offset, offset + segSize);
    const encrypted = crypto.publicEncrypt(
      {
        key: publicKeyPem,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      segment
    );
    result.push(encrypted);
    offset += segSize;
  }

  return Buffer.concat(result).toString('hex').toLowerCase();
}

/**
 * 计算字符串的 MD5
 * 对应 Python: hashlib.md5(json.dumps(request_data).encode()).hexdigest()
 */
export function getStringMD5(str: string): string {
  return crypto.createHash('md5').update(str, 'utf8').digest('hex').toLowerCase();
}

/**
 * 计算文件的 MD5
 */
export function getFileMD5(filePath: string): string {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex').toLowerCase();
}

/**
 * 生成小米 API 签名 (SIG)
 * 
 * 对应 Python:
 *   sig_json = {"sig": [{name, hash}, ...], "password": password}
 *   encrypted_sig = encrypt_by_public_key(json.dumps(sig_json))
 *
 * @param sigEntries 签名条目
 * @param password 访问密码（小米开发者站"私钥"）
 * @param certPem 小米公钥证书（X.509 格式）
 */
export function generateSignature(
  sigEntries: SigEntry[],
  password: string,
  certPem: string
): { SIG: string } {
  if (!certPem || !certPem.includes('BEGIN CERTIFICATE')) {
    throw new Error('无效的公钥证书格式，应为 X.509 PEM 证书');
  }

  const sigJson = JSON.stringify({
    password: password,
    sig: sigEntries,
  });

  try {
    const publicKeyPem = extractPublicKeyFromCert(certPem);
    const SIG = rsaEncryptLong(Buffer.from(sigJson, 'utf8'), publicKeyPem);
    return { SIG };
  } catch (e: any) {
    throw new Error(`签名生成失败: ${e.message}`);
  }
}
