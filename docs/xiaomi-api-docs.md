# 小米应用商店自动发布API接口文档

**文档更新时间**：2026-02-02 13:39:00  
**来源**：小米澎湃OS开发者平台 - 应用自动发布接口操作指南https://dev.mi.com/xiaomihyperos/documentation/detail?pId=1134

---

## 一、接口基本信息

### 协议与编码
- **协议**：HTTP 1.1
- **请求方式**：全部使用POST方法
- **数据格式**：JSON格式
- **字符编码**：UTF-8

### 接口地址
```
https://api.developer.xiaomi.com/devupload
```

---

## 二、认证方式

### 数字签名(SIG)生成方法
所有需要传递明确参数的接口都需要进行安全验证，使用数字签名认证。

**签名生成步骤：**
1. 计算每个参数的MD5值（参数为文件时计算整个文件的MD5值）
2. 将参数及其MD5值按指定格式组成JSON数组
3. 使用小米分配的公钥对JSON串进行RSA数字签名
4. 将数字签名转换为小写16进制字符串

**签名格式示例：**
```json
{
  "password": "访问密码",
  "sig": [
    {"name": "parameterName1", "hash": "文件MD5值"},
    {"name": "parameterName2", "hash": "文件MD5值"}
  ]
}
```

### 密钥管理
- **公钥**：小米应用商店分配的公钥
- **私钥**：在开发者站获取的私钥（非登录密码）
- **注意**：每次重置私钥后原私钥失效，公钥不变

---

## 三、具体接口详情

### 1. 应用包查询接口
**地址**：`/dev/query`

**请求参数**：
| 参数名 | 可选性 | 类型 | 说明 |
|--------|--------|------|------|
| RequestData | 必选 | json | 查询参数 |
| SIG | 必选 | string | 数字签名 |

**RequestData字段**：
```json
{
  "packageName": "应用包名",
  "userName": "开发者邮箱"
}
```

**SIG计算方法**：
```json
{
  "sig": [{"name": "RequestData", "hash": "RequestData JSON字符串的MD5值"}],
  "password": "私钥或账号密码"
}
```

**返回结果**：
```json
{
  "result": 0,
  "packageInfo": {
    "appName": "应用名称",
    "versionName": "版本名",
    "versionCode": 版本号,
    "packageName": "包名"
  },
  "create": true,
  "updateVersion": false,
  "updateInfo": false,
  "message": "响应消息"
}
```

---

### 2. 应用类别查询接口
**地址**：`/dev/category`

**请求参数**：无

**返回结果**：
```json
{
  "result": 0,
  "message": "查询成功",
  "categories": [
    {"categoryId": 1, "categoryName": "理财"},
    {"categoryId": 2, "categoryName": "聊天与社交"}
  ]
}
```

---

### 3. 应用推送接口
**地址**：`/dev/push`

**请求参数**：
| 参数名 | 可选性 | 类型 | 说明 |
|--------|--------|------|------|
| RequestData | 必选 | json | 应用信息 |
| SIG | 必选 | string | 数字签名 |
| apk | 可选 | file | APK安装包 |
| secondApk | 可选 | file | 双包发布时的第二个APK |
| icon | 必选 | file | 应用图标 |
| screenshot_1~5 | 可选 | file | 应用截图 |
| screenshot_pad_1~5 | 可选 | file | 平板截图 |

**RequestData结构**：
```json
{
  "userName": "开发者邮箱",
  "synchroType": 0,
  "appInfo": {
    "appName": "应用名称",
    "packageName": "包名",
    "publisherName": "开发者名称",
    "category": 分类ID,
    "keyWords": "关键字1 关键字2",
    "versionName": "版本名",
    "desc": "应用详情",
    "brief": "一句话简介",
    "privacyUrl": "隐私政策链接",
    "testAccount": {"zh_CN": {}},
    "onlineTime": 上线时间戳
  }
}
```

**synchroType说明**：
- 0：新增应用
- 1：更新版本
- 2：内容更新

---

## 四、错误码说明

| 错误码 | 错误描述 |
|--------|----------|
| -10000 | 参数格式或加密错误 |
| -2 | 包名与APK中不一致 |
| -20014 | 密码错误 |
| -32 | 需要先创建包名 |
| -92 | APK不满足要求 |
| -20002 | 数字签名异常 |
| -20029 | RequestData非JSON格式 |
| -20034 | testAccount参数格式错误 |

---

## 五、使用限制

- **文件大小**：不超过2G
- **调用频率**：非恶意调用无限制
- **测试环境**：暂无沙盒环境，可使用线上环境测试后撤回

---

## 六、示例代码

文档提供了多种编程语言的示例代码：
- Java 8示例
- Python 3示例
- Go示例
- PHP示例
