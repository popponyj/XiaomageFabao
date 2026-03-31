原文链接： [https://wikinew.open.qq.com/index.html#/iwiki/4015262492](https://wikinew.open.qq.com/index.html#/iwiki/4015262492)

# 一、功能介绍
通过接入API应用更新能力，开发者可以在不人工登录开放平台的情况下通过后台接口直接更新APP版本和基础信息。无需每次前往腾讯应用开放平台管理中心页面进行操作，能够减少更新链路步骤，节约开发者的人力成本和时间，方便开发者做统一的更新管理维护。

接入前建议您详细阅读帮助文档，按照流程和说明接入，如有疑问可以咨询在线客服。

注意事项：

①仅提供应用版本和基础信息更新功能，暂时不支持新应用发布。

②API更新能力现仅支持开发者账号使用，子账号暂不支持。

# 二、接入前准备工作
### 2.1 接入流程图
<img src="https://cdn.nlark.com/yuque/0/2026/jpeg/32490100/1774946624934-a3d76a21-8610-4aa3-8956-d12907f2ff66.jpeg" width="961" title="" crop="0,0,1,1" id="uc3130941" class="ne-image">

### 2.2 完成前置流程
开发者需在腾讯应用开放平台先将需要更新的应用接入并成功发布上线。

### 2.3 申请开通API接口
2.3.1 申请路径

选择应用-右上角账户管理-API发布接口，如下图：

<img src="https://cdn.nlark.com/yuque/0/2026/jpeg/32490100/1774946624998-7c210691-21b8-4cc7-a5e4-6403e392ba2b.jpeg" width="2695" title="" crop="0,0,1,1" id="u4ffadf52" class="ne-image">

2.3.2 点击【申请开通】，获取分配的接入密钥（access_secret），如下图：

<img src="https://cdn.nlark.com/yuque/0/2026/jpeg/32490100/1774946624875-6e74b789-fa7e-4429-b03a-96c5d2bf07ac.jpeg" width="2562" title="" crop="0,0,1,1" id="u87c02938" class="ne-image">

2.3.3 调用API接口：

①包括获取文件上传信息接口、查询应用详情接口、应用更新接口、查询应用更新审核状态接口。

②也可仅更新应用的基础信息。

# 三、 API接口接入
## 3.1 调用说明
### 3.1.1 调用流程
API是基于HTTP协议来调用。

步骤：填充参数 > 生成签名 > 拼装HTTP请求 > 发起HTTP请求> 得到HTTP响应 > 解析json

调用注意事项：

所有的请求和响应数据编码皆为utf-8格式，URL里的所有参数名和参数值请做URL编码。如果请求的Content-Type是application/x-www-form-urlencoded，则HTTP Body体里的所有参数值也做URL编码。

无特殊说明时，一般请求的 Content-type 为 application/x-www-form-urlencoded。

### 3.1.2 签名机制
调用任何一个API都必须进行签名，API签名计算规则为涉及的所有请求参数（包括公共参数和业务参数）。目前支持的公共参数有：

| 参数名称 | 参数类型 | 是否必传 | 参数描述 |
| --- | --- | --- | --- |
| user_id | string | 是 | 开发者在开发平台这注册后分配的UserID |
| timestamp | string | 是 | 时间戳（秒级）示例：1724043864，允许客户端请求最大时间误差为30分钟 |
| sign | string | 是 | API输入参数签名结果，签名算法参照下面的介绍 |


签名方法：

1）请求参数（除api_sign外的公共参数+业务参数）按照ASCII升序排序

2）请求参数使用&拼接字符串，值为null的参数不参与签名，拼接成k1=v1&k2=v2

3）对step2得到的字符串进行HmacSHA256计算，计算时使用的密钥key为在开放平台管理中心申请获取的access_secret

4）将hash计算结果转换为小写16进制，得到签名sign

注意：在计算签名时，参数名和参数值都不做URL编码。

### 3.1.3 调用环境
### 3.1.4 使用限制说明
<font style="color:rgb(216,57,49);">1）API目前仅支持应用版本和基础信息更新功能，暂时不支持新应用发布。</font>

<font style="color:rgb(216,57,49);">2）只支持主账号userID进行接口调用。</font>

## 3.2 查询应用详情API接口
接口功能：通过包名查询应用的详情信息。（请求应用更新接口时，按需原样传入或变更后传入其中相关允许变更字段）

请求路由：/query_app_detail

请求方法：POST

请求类型：Content-Type: x-www-form-urlencoded

请求业务参数：

| 字段 | 类型 | 是否必传 | 说明 |
| --- | --- | --- | --- |
| pkg_name | string | 是 | 应用包名 （标识APP） |
| app_id | string | 是 | 应用id（标识APP） |


app_id和包名开发者可以在开放平台的安卓应用管理的应用首页中查看，如下图。

<img src="https://cdn.nlark.com/yuque/0/2026/jpeg/32490100/1774946624881-2d6aadf3-449e-46de-8c11-912f0b87f751.jpeg" width="1428" title="" crop="0,0,1,1" id="u4996b57b" class="ne-image">

响应参数：（由下参数组成的json格式字符串）

| 参数名称 | 类型 | 字段说明 |
| --- | --- | --- |
| ret | int | 返回码（为0时表示成功） |
| msg | string | 返回结果描述信息（ret非0时，会填充相应描述信息） |
| pkg_name | string | 包名 |
| app_name | string | 应用名称 |
| app_type | int | 应用类型： 1 软件 2 不联运游戏 3 联运网游 4 联运单机 5 联运免费 |
| category | int | 应用分类<br/>（分类数字含义详见下方应用分类含义表，不同app_type，值不同） |
| operator | string | 应用运营方 |
| developer | string | 应用研发方 |
| introduce | string | 应用简介 |
| one_word_summary | string | 一句话简介 |
| age_level | int | 年龄分级 （3: 年满3周岁，8: 年满8周岁，12: 年满12周岁，16: 年满16周岁，18: 年满18周岁） |
| screen_size | int | 支持屏幕尺寸（0: 全部，1: 480*320以上，2: 640*480以上，3: 960*720以上） |
| language | int | 支持语言（0: 中文，1: 英文，2: 多语言） |
| is_support_ipv6 | int | 是否支持IPv6（0: 支持，1: 不支持） |
| device_type | int | 支持的设备类型（0: Phone，1: Pad，2：同时支持Phone和Pad） |
| feature | string | 版本特性说明 |
| login_flag | int | 是否涉及登录（1:是，2:否） |
| login_account | string | 登录账号（login_flag为1时必填。若您的应用内涉及账号登录能力，请您提供测试账号和密码，格式为：账号：xxx 密码：xxx，便于审核，否则将会驳回处理） |
| pay_type | int | 涉及支付类型（1：无支付无提现，2：无支付仅支持提现，3：含支付） |
| demo_video_flag | int | 是否涉及配套设备（1：是，2：否） |


软件应用（1 软件）分类含义表：

| 分类值 | 含义 |
| --- | --- |
| 10 | 生活 |
| 11 | 购物 |
| 12 | 视频 |
| 13 | 音乐 |
| 14 | 阅读 |
| 15 | 摄影 |
| 16 | 系统 |
| 17 | 工具 |
| 19 | 社交 |
| 20 | 办公 |
| 21 | 教育 |
| 22 | 理财 |
| 23 | 交通出行 |
| 24 | 旅游出行 |
| 25 | 健康 |
| 33 | 美食 |
| 34 | 母婴 |
| 36 | 汽车 |
| 40 | 游戏辅助 |


不联运免费游戏 （2 不联运免费游戏 ）分类含义表：

| 29 | AVG动作冒险 |
| --- | --- |
| 30 | 策略SLG |
| 31 | 题材 |
| 32 | 经营养成 |
| 35 | 棋牌 |
| 37 | 枪战射击STG |
| 38 | 体育竞速 |
| 39 | 休闲益智 |
| 42 | 文字游戏 |
| 43 | 画风 |
| 46 | 角色扮演RPG |


## 3.3 文件上传
### 3.3.1 流程
1）开发者先请求获取文件上传信息API接口，得到腾讯云cos预签名URL以及文件上传流水号

2）开发者拿1）中的预签名URL即可访问腾讯云cos进行文件上传 （无需开发者申请cos资源，由开放平台承担）

3）开发者请求应用更新API接口（把当次更新的所有文件上传的流水号和其他非文件更新信息一并提交）

备注说明： [<u><font style="color:rgb(36,91,219);">对象存储 预签名授权上传-开发者指南-文档中心-腾讯云</font></u>](https://cloud.tencent.com/document/product/436/14114)

<font style="color:rgb(216,57,49);">注意：直接上传原始数据，不要上传二进制文件数据。</font>

### 3.3.2 获取文件上传信息API接口
接口功能：用于获取文件上传信息

请求路由：/ get_file_upload_info

请求方法：POST

请求类型：Content-Type: x-www-form-urlencoded

<font style="color:rgb(216,57,49);">限制：每个用户每天最多调用最多100次，即每个用户每天最多上传100个文件</font>

<font style="color:rgb(216,57,49);">注意：cos预签名URL上传文件时，请同步读取整个文件，然后同步上传！</font>

请求业务参数：

| 参数名称 | 类型 | 是否必传 | 字段说明 |
| --- | --- | --- | --- |
| pkg_name | string | 是 | 应用包名（标识APP） |
| app_id | string | 是 | 应用id（标识APP） |
| file_type | string | 是 | 文件类型（包括：<br/>img —— 图片文件<br/>apk —— 应用包文件<br/>pdf —— pdf文件<br/>video —— 视频文件<br/>txt —— 文本文件） |
| file_name | string | 是 | 文件名<br/>（带上格式后缀，比如：xxx.png、xxx.jpg、xxx.apk、xxx.pdf、xxx.mp4、xxx.m4a、xxx.txt） |


响应参数：（由下参数组成的json格式字符串）

| 参数名称 | 类型 | 字段说明 |
| --- | --- | --- |
| ret | int | 返回码（为0时表示成功） |
| msg | string | 返回结果描述信息（ret非0时，会填充相应描述信息） |
| pre_sign_url | string | 预签名URL（用于上传文件至腾讯云cos） |
| serial_number | string | 文件上传流水号 |


拿到与签名URL后，文件上传至腾讯云cos的示例见4.2.

备注说明： [<u><font style="color:rgb(36,91,219);">对象存储 预签名授权上传-开发者指南-文档中心-腾讯云</font></u>](https://cloud.tencent.com/document/product/436/14114)

[<u><font style="color:rgb(36,91,219);">对象存储 异常处理-SDK 文档-文档中心-腾讯云</font></u>](https://cloud.tencent.com/document/product/436/35218)

[<u><font style="color:rgb(36,91,219);">对象存储 错误码-API 文档-文档中心-腾讯云</font></u>](https://cloud.tencent.com/document/product/436/7730)

文件上传可能会比较耗时，建议客户端执行等待时间设置为1min及以上（取决于上传文件的大小）。

## 3.4 应用更新API接口
接口功能：更新应用信息，包括基础信息，以及apk包、图片、pdf、视频等文件信息。也可仅更新基础信息，而不更新文件信息。

请求路由：/ update_app

请求方法：POST

请求类型：Content-Type: x-www-form-urlencoded

<font style="color:rgb(216,57,49);">限制：每个用户每天最多调用 50次</font>

接口处理可能会比较耗时，建议客户端执行等待时间设置为15秒以上（如果涉及传apk包，则需要下载包并解析校验，建议超时时间设置60秒或以上）。

请求业务参数（ <font style="color:rgb(36,91,219);">蓝色 </font>为公共参数， 黑色 为软件和免费游戏特有参数）：

<font style="color:rgb(222,120,2);">注意：字符串里不要有 emoji 表情符号！</font>

| 参数名称 | 类型 | 是否必传 | 字段说明 |
| --- | --- | --- | --- |
| <font style="color:rgb(36,91,219);">distribution_end</font> | string | 否 | 分发终端选项，初始值默认跟随用户分发协议。格式：“PC端/车载端/平板端/其他智能设备端” 排列的二进制字符串，<br/>比如“1001”（pc端分发/车载端不分发/平板端不分发/其他智能设备端分发），0不分发，1选中分发；不传 或 空字符串，则默认上次选中的分发选项 |
| <font style="color:rgb(36,91,219);">pkg_name</font> | string | 是 | 应用包名 （标识APP） |
| <font style="color:rgb(36,91,219);">app_id</font> | string | 是 | 应用id （标识APP） |
| <font style="color:rgb(36,91,219);">app_name</font> | string | 否 | 应用名称（1自然年最多修改2次，修改后需要重新上传软著）<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">modify_app_name_reason</font> | string | 否 | 应用名称修改原因。<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">category</font> | int | 否 | 应用分类（见应用分类含义表）<br/>31003：传奇类、 35002：棋类 、35004： 牌类，此三类禁止变更<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">modify_category_reason</font> | string | 否 | 应用分类修改原因<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">operator</font> | string | 否 | 应用运营方<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">developer</font> | string | 否 | 应用研发方<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">introduce</font> | string | 否 | 应用简介<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">one_word_summary</font> | string | 否 | 一句话简介<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">age_level</font> | int | 否 | 年龄分级 （3: 年满3周岁，8: 年满8周岁，12: 年满12周岁，16: 年满16周岁，18: 年满18周岁）<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">icon_file_serial_number</font> | string | 否 | 应用图标文件上传流水号（1张512*512像素200KB以内的PNG格式直角图标）<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">snapshots_file_serial_number</font> | string | 否 | 应用截图文件上传流水号（支持多张，以竖线分隔，请上传4-5张。建议尺寸1080*1920px，最小不低于320*480px；所有图片宽高一致；JPG/PNG格式，单张图片不超过1M）<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">screen_size</font> | int | 否 | 支持屏幕尺寸（0: 全部，1: 480*320以上，2: 640*480以上，3: 960*720以上）<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">language</font> | int | 否 | 支持语言（0: 中文，1: 英文，2: 多语言） |
| <font style="color:rgb(36,91,219);">ipv6</font> | int | 否 | 是否支持IPv6（0: 支持，1: 不支持）<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">device_type</font> | int | 否 | 支持的设备类型（0: Phone，1: Pad，2：同时支持Phone和Pad） |
| <font style="color:rgb(36,91,219);">feature</font> | string | 否 | 版本特性说明<br/>备注：不变更则不填 |
| <font style="color:rgb(36,91,219);">deploy_type</font> | int | 是 | 审核通过后的发布类型（1:审核通过后立即发布，2:定时发布） |
| <font style="color:rgb(36,91,219);">deploy_time</font> | int | 否 | 定时发布时间（deploy_type为2时需要填写，格式为秒级时间戳，北京时间，必须晚于当前时间） |
| copyright_elec_cert_file_serial_number | string | 否 | 电子版权证书文件上传流水号（1份5M以内PDF格式的电子版权认证证书）<br/>备注：不变更则不填 |
| copyright_licences_file_serial_number | string | 否 | 计算机软件著作权证书文件上传流水号（最少1张最多10张10M以内JPG/PNG格式的软著版权证明图片，多张以竖线分隔）<br/>备注：不变更则不填 |
| is_soft_delegation | int | 否 | 软著资质是否包含转授权（0：否，1：是）<br/>备注：不变更则不填 |
| soft_delegation_file_serial_number | string | 否 | 转授权文件上传流水号（支持多张，以竖线分隔）<br/>备注：is_soft_delegation为1时才需要<br/>[<u><font style="color:rgb(36,91,219);">查看样例</font></u>](https://drive.weixin.qq.com/s?k=AJEAIQdfAAofRB8E2HAB4AygatACc)<br/>①如授权方是企业的，请上传【软著授权书】和【授权方营业执照（手写“用于授权申请腾讯移动开放平台移动应用上线 或 用于注册腾讯移动开放平台开发者账号 +日期”加盖公司印泥公章）】<br/>②如授权方是个人的，请上传【软著授权书】和【授权方身份证复印件（正面+反面）+签名+红色手印+个人签字照片（即本人正在签署授权函的正面照片）】<br/>请参考 [<u><font style="color:rgb(36,91,219);">版权证明指引</font></u>](https://wikinew.open.qq.com/index.html#/iwiki/889016882) |
| soft_delegation_period_type | int | 否 | 软著转授权有效期类型（0：指定有效期，1：永久有效）<br/>备注：is_soft_delegation传1时需要 |
| soft_delegation_start_time | int | 否 | 软著转授权有效期起始时间（秒级时间戳，北京时间）<br/>备注：soft_delegation_type传0时需要 |
| soft_delegation_end_time | int | 否 | 软著转授权有效期结束时间（秒级时间戳，北京时间）<br/>备注：soft_delegation_type传0时需要 |
| special_ind_category | string | 否 | 特殊行业分类<br/>备注：不变更则不填<br/>格式为如下示例的json串。<br/>{"checkedKeys":["1-1","1-2","1-3","1-4","1-5","1-6","1-8","1-9","1-10","1-11","1-12","1-13","1-14"],"status":true}<br/>status固定填true，checkedKeys为分类列表（支持选多个分类），分类由一级分类和二级分类中间加-拼接而成，分类数字含义详见下方特殊行业分类含义表。 |
| other_copyright_file_serial_number | string | 否 | 其他版权证明文件上传流水号（支持多张，以竖线分隔）<br/>备注：不变更则不填<br/>[<u><font style="color:rgb(36,91,219);">查看样例</font></u>](https://drive.weixin.qq.com/s?k=AJEAIQdfAAoUiMwsHHAB4AygatACc)<br/>①ICP证（增值电信业务经营许可证）或ICP备案截图加盖公章（备案上的官网内容需要与应用内容存在关联）<br/>② 普通类型应用请上传 [<u><font style="color:rgb(36,91,219);">应用发布承诺函</font></u>](https://drive.weixin.qq.com/s?k=AJEAIQdfAAohJwT9eoAB4AygatACc)；以下特殊类型应用请上传专用发布承诺函<br/>[<u><font style="color:rgb(36,91,219);">金融理财类应用发布承诺函</font></u>](https://drive.weixin.qq.com/s?k=AJEAIQdfAAoRy0WWWCAB4AygatACc)[<u><font style="color:rgb(36,91,219);">网络购物类应用发布承诺函</font></u>](https://drive.weixin.qq.com/s?k=AJEAIQdfAAoB1uO2T8AB4AygatACc)[<u><font style="color:rgb(36,91,219);">医疗健康类应用发布承诺函</font></u>](https://drive.weixin.qq.com/s?k=AJEAIQdfAAoMQbKUY8AB4AygatACc)[<u><font style="color:rgb(36,91,219);">网赚类应用发布承诺函</font></u>](https://drive.weixin.qq.com/s?k=AJEAIQdfAAo0AHLOY1AB4AygatACc)<br/>③特殊行业资质（请根据特殊行业资质评估结果上传资质材料）<br/>注：如特殊行业资质属于授权性质的，请您上传【授权书】和【授权方营业执照（手写“用于授权申请腾讯移动开放平台移动应用上线 或 用于注册腾讯移动开放平台开发者账号 +日期”加盖公司印泥公章）】<br/>请参考 [<u><font style="color:rgb(36,91,219);">资质要求指引</font></u>](https://wikinew.open.qq.com/index.html#/iwiki/4007776097) |
| security_reports_file_serial_number | string | 否 | 安全评估报告和安全承诺书文件上传流水号（支持多张，以竖线分隔）<br/>备注：不变更则不填<br/>[<u><font style="color:rgb(36,91,219);">查看样例</font></u>](https://drive.weixin.qq.com/s?k=AJEAIQdfAAoIc21ix3AB4AygatACc)<br/>APP含有社交、弹幕、私信、即时通信等具备舆论属性或社会动员能力的功能或服务的，请您务必上传安全评估报告，否则会被拒绝上架。<br/>请您上传【安全评估报告图片】 请参考 [<u><font style="color:rgb(36,91,219);">如何进行安全评估</font></u>](https://wikinew.open.qq.com/index.html#/iwiki/4007776048) |
| apk32_flag | int | 否 | 是否上传 32位或32&64位兼容包 （1:是，2:否）<br/>备注：填1，则同时需要传apk32_file_serial_number |
| apk64_flag | int | 否 | 是否上传 64位安装包 （1:是，2:否）<br/>备注：填1，则同时需要传apk64_file_serial_number |
| apk32_file_serial_number | string | 否 | 32位或32&64位兼容包 文件上传流水号 |
| apk32_file_md5 | string | 否 | 32位或32&64位兼容包 的md5值<br/>备注：上传了apk32_file_serial_number则需要传 |
| apk64_file_serial_number | string | 否 | 64位安装包 文件上传流水号 |
| apk64_file_md5 | string | 否 | 64位安装包 的md5值<br/>备注：上传了apk64_file_serial_number则需要传 |
| login_flag | int | 否 | 是否涉及登录（1:是，2:否）<br/>备注：不变更则不填 |
| login_account | string | 否 | 登录账号（login_flag为1时必填。若您的应用内涉及账号登录能力，请您提供测试账号和密码，格式为：账号：xxx 密码：xxx，便于审核，否则将会驳回处理） |
| pay_type | int | 否 | 涉及支付类型（1：无支付无提现，2：无支付仅提现，3：含支付）<br/>备注：不变更则不填 |
| pay_promise_file_serial_number | string | 否 | 无支付仅提现承诺函文件流水号（涉及支付类型值为2时，需要该承诺函） |
| demo_video_flag | int | 否 | 是否涉及配套设备（1：是，2：否） |
| demo_video_file_serial_number | string | 否 | 配套设备操作视频文件流水号（是否涉及配套设备值为1时，需要该操作视频。上传500M以内的mp4/m4a格式视频） |


特殊行业分类含义表：

| 一级分类 | 二级分类 |
| --- | --- |
| 1：金融理财类 | 1：证券、期货、基金、股票业务、<br/>2：贷款业务<br/>3：银行<br/>4：信用卡业务<br/>5：信托、汽车金融<br/>6：商业保理业务<br/>8：外汇业务<br/>9：金融理财资讯<br/>10：实物黄金买卖、贵金属交易<br/>11：第三方支付业务<br/>12：保险业务<br/>13：征信业务<br/>14：典当 |
| 2：网络购物类 | 1：电商平台服务<br/>2：数字藏品 |
| 3：线上社交类 | 1：交友、婚恋<br/>2：通讯<br/>3：具有娱乐属性 |
| 4：在线教育 | 1：在线视频课程、教职工/学生/家长为主要用户 |
| 5：医疗健康类 | 1：医疗服务<br/>2：医疗器械<br/>3：药品<br/>4：医疗美容<br/>5：美容美发 |
| 6：影音娱乐、新闻阅读 | 1：网络直播平台、在线、视频平台、FM平台、在线音乐、浏览器<br/>2：新闻<br/>3：漫画、动漫<br/>4：期刊杂志、轻阅读、小说 |
| 7：旅游出行 | 1：航空公司、机票销售<br/>2：演出票务销售<br/>3：网约车、租车<br/>4：住宿、餐饮消费<br/>5：地图类 |
| 8：生活服务 | 1：求职招聘<br/>2：汽车销售/服务<br/>3：快递/物流<br/>4：慈善组织<br/>5：按摩类<br/>6：网赚类<br/>7：宗教类 |
| 9：深度合成（包括但不限于AI换脸、变声器、AI机器人对话） | 1：AI换脸<br/>2：变声器<br/>3：AI机器人对话 |


响应参数：（由下参数组成的json格式字符串）

| 参数名称 | 类型 | 字段说明 |
| --- | --- | --- |
| ret | int | 返回码（为0时表示成功） |
| msg | string | 返回结果描述信息（ret非0时，会填充相应描述信息） |


## 3.5 查询应用更新审核状态API接口
接口功能：查询提交的应用更新的审核状态。

请求路由：/query _app_update_status

请求方法：POST

请求类型：Content-Type: x-www-form-urlencoded

请求业务参数：

| 参数名称 | 参数类型 | 字段说明 |
| --- | --- | --- |
| pkg_name | string | 应用包名 （ 标识APP） |
| app_id | string | 应用id（标识APP） |


响应参数：（由下参数组成的json格式字符串）

| 参数名称 | 类型 | 字段说明 |
| --- | --- | --- |
| ret | int | 返回码（为0时表示成功） |
| msg | string | 返回结果描述信息（ret非0时，会填充相应描述信息） |
| audit_status | int | 审核状态（1:审核中,2:审核驳回,3:审核通过,8:开发者主动撤销） |
| audit_reason | string | 审核原因说明 |


# 四. 调用示例
### 4.1 签名
golang语言：

```plain
package main

import (
        "crypto/hmac"
        "crypto/sha256"
        "encoding/hex"
        "fmt"
        "io/ioutil"
        "net/http"
        "net/url"
        "sort"
        "strconv"
        "strings"
        "time"
)

var (
        domain        = "https://p.open.qq.com/open_file/developer_api" //正式环境接口域名
        user_id     = "************"                              // 开发者用户id
        access_secret = "**************"                          // 开发者API接口访问密钥
)

func checkError(err error) {
        if err != nil {
                panic(err)
        }
}

// 计算签名
func calSign(key string, data url.Values) string {
        // 将请求参数按key排序
        keys_arr := make([]string, 0, len(data))
        for key := range data {
                keys_arr = append(keys_arr, key)
        }
        sort.Strings(keys_arr)
        // 拼接参数
        sign_arr := make([]string, 0, len(keys_arr))
        for _, key := range keys_arr {
                sign := key + "=" + data.Get(key)
                sign_arr = append(sign_arr, sign)
        }
        sign_str := strings.Join(sign_arr, "&")

        // 进行HmacSHA256计算
        h := hmac.New(sha256.New, []byte(key))
        h.Write([]byte(sign_str))
        res := h.Sum(nil)
        return hex.EncodeToString(res)
}

func main() {
        data := make(url.Values)
        //公共参数
        data.Set("user_id", user_id)
        data.Set("timestamp", strconv.FormatInt(time.Now().Unix(), 10))
        //业务参数: 具体看每个API接口文档获得
        data.Set("xxx", "xxxxxx")

        //计算签名
        sign := calSign(access_secret, data)
        fmt.Println("api sign:", sign)
        data.Set("sign", sign) //设置签名参数

        // 创建一个 HTTP POST 请求（以请求获取文件上传信息接口为例）
   uri := domain + "/get_file_upload_info"
           req, err := http.NewRequest("POST", uri, strings.NewReader(data.Encode()))
        if err != nil {
                fmt.Println("Error creating request:", err)
                return
        }
        // 设置请求头
        req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
        // 创建一个 HTTP 客户端
        client := &http.Client{Timeout: 3 * time.Second}

        // 发送请求
        resp, err := client.Do(req)
        if err != nil {
                fmt.Println("Error sending request:", err)
                return
        }
        defer resp.Body.Close()

        // 读取响应
        body, err := io.ReadAll(resp.Body)
        if err != nil {
                fmt.Println("Error reading response:", err)
                return
        }
        // 打印响应
        fmt.Println("Response Status:", resp.Status)
        fmt.Println("Response Body:", string(body))
}
```

### 4.2 文件上传
```plain
package main

import (
        "bytes"
        "crypto/hmac"
        "crypto/sha256"
        "encoding/hex"
        "encoding/json"
        "fmt"
        "io"
        "io/ioutil"
        "net/http"
        "net/url"
        "os"
        "sort"
        "strconv"
        "strings"
        "time"
)

var (
        domain        = "https://p.open.qq.com/open_file/developer_api" //正式环境接口域名
        user_id       = "************"                                  // 开发者用户id
        access_secret = "**************"                                // 开发者API接口访问密钥
)

// GetFileUploadInfoRsp 请求获取文件上传信息返回结构
type GetFileUploadInfoRsp struct {
        Ret          int32  `json:"ret"`           // 返回码
        Msg          string `json:"msg"`           // 返回信息说明
        PreSignURL   string `json:"pre_sign_url"`  // 预签名URL（用于上传文件至腾讯云cos）
        SerialNumber string `json:"serial_number"` // 文件上传流水号
}

// 计算签名
func calSign(key string, data url.Values) string {
        // 将请求参数按key排序
        keys_arr := make([]string, 0, len(data))
        for key := range data {
                keys_arr = append(keys_arr, key)
        }
        sort.Strings(keys_arr)
        // 拼接参数
        sign_arr := make([]string, 0, len(keys_arr))
        for _, key := range keys_arr {
                sign := key + "=" + data.Get(key)
                sign_arr = append(sign_arr, sign)
        }
        sign_str := strings.Join(sign_arr, "&")

        // 进行HmacSHA256计算
        h := hmac.New(sha256.New, []byte(key))
        h.Write([]byte(sign_str))
        res := h.Sum(nil)
        return hex.EncodeToString(res)
}

// uploadFile 通过预签名方式上传文件
func uploadFile(preSignURL string) error {
        // 打开要发送的 APK 文件
        file, err := os.Open("example.apk")
        if err != nil {
                return fmt.Errorf("Open file err:%v", err)
        }
        defer file.Close()

        // 读取文件内容
        fileContent, err := ioutil.ReadAll(file)
        if err != nil {
                fmt.Println("Error reading file:", err)
                return fmt.Errorf("Read file err:%v", err)
        }

        req, err := http.NewRequest(http.MethodPut, preSignURL, bytes.NewBuffer(fileContent))
        if err != nil {
                return fmt.Errorf("http NewRequest err:%v", err)
        }
        // 用户可自行设置请求头部
        req.Header.Set("Content-Type", "application/octet-stream")
        // 创建一个 HTTP 客户端
        client := &http.Client{Timeout: 30 * time.Second}
        resp, err := client.Do(req)
        if err != nil {
                return fmt.Errorf("http Do err:%v", err)
        }
        defer resp.Body.Close()
        if resp.StatusCode != http.StatusOK {
                return fmt.Errorf("http Do fail, resp StatusCode:%d, Status:%s", resp.StatusCode, resp.Status)
        }
        // 读取响应
        body, err := io.ReadAll(resp.Body)
        if err != nil {
                return fmt.Errorf("Read response body err:%v", err)
        }
        fmt.Println("got resp body:", string(body))
        return nil
}

func main() {
        data := make(url.Values)
        //公共参数
        data.Set("user_id", user_id)
        data.Set("timestamp", strconv.FormatInt(time.Now().Unix(), 10))
        //业务参数: 具体看每个API接口文档获得
        data.Set("app_id", "xxxxxx")
        data.Set("pkg_name", "xxxxxx")

        //计算签名
        sign := calSign(access_secret, data)
        fmt.Println("api sign:", sign)
        data.Set("sign", sign) //设置签名参数

        // 创建一个 HTTP POST 请求（以请求获取文件上传信息接口为例）
        uri := domain + "/get_file_upload_info"
        req, err := http.NewRequest("POST", uri, strings.NewReader(data.Encode()))
        if err != nil {
                fmt.Println("Error creating request:", err)
                return
        }
        // 设置请求头
        req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
        // 创建一个 HTTP 客户端
        client := &http.Client{Timeout: 3 * time.Second}

        // 发送请求
        resp, err := client.Do(req)
        if err != nil {
                fmt.Println("Error sending request:", err)
                return
        }
        defer resp.Body.Close()
        if resp.StatusCode != http.StatusOK {
                fmt.Println("Error sending request, StatusCode:", resp.StatusCode)
                return
        }

        // 读取响应
        body, err := io.ReadAll(resp.Body)
        if err != nil {
                fmt.Println("Error reading response Body, err:", err)
                return
        }
        // 打印响应
        fmt.Println("Response Body:", string(body))
        var getFileUploadInfoRsp GetFileUploadInfoRsp
        if err := json.Unmarshal(body, &getFileUploadInfoRsp); err != nil {
                fmt.Println("Error response json.Unmarshal err:", err)
                return
        }
        if getFileUploadInfoRsp.Ret != 0 {
                fmt.Printf("Error response, ret:%d, msg:%s", getFileUploadInfoRsp.Ret, getFileUploadInfoRsp.Msg)
                return
        }

        // 通过预签名方式上传文件至腾讯云cos
        if err := uploadFile(getFileUploadInfoRsp.PreSignURL); err != nil {
                fmt.Println("Error upload file err:", err)
                return
        }
}
```

# 五. 错误返回码
调用接口响应中的ret值的含义说明。

### 5.1 公共返回码
| ret | msg |
| --- | --- |
| 1000001 | 请求参数user_id为空 |
| 1000002 | 请求参数userid格式错误 |
| 1000003 | 系统繁忙，请稍后再试 |
| 1000004 | 用户不存在 |
| 1000005 | 请求参数pkg_name为空 |
| 1000006 | 请求参数app_id为空 |
| 1000007 | 请求参数app_id格式错误 |
| 1000008 | 应用不存在 |
| 1000009 | 请求pkg_name与app_id不匹配 |
| 1000010 | 仅支持软件应用 |
| 1000011 | 应用尚未上架 |
| 1000012 | 您没有该应用的权限 |
| 1000013 | 请求参数解析出错 |
| 1000014 | 未携带时间戳参数 |
| 1000015 | 请求参数timestamp格式错误 |
| 1000016 | 请求参数timestamp时间戳失效 |
| 1000017 | 未携带签名参数 |
| 1000018 | 查询开发者api密钥出错，请稍后再试 |
| 1000019 | 未查询到开发者access_secret，请确认是否已申请access_secret |
| 1000020 | 请求签名校验不通过 |
| 1000021 | 服务内部处理出错，请稍后再试 |


### 5.2 获取文件上传信息接口返回码
| ret | msg |
| --- | --- |
| 2000001 | 请求参数file_type为空 |
| 2000002 | 文件类型不支持 |
| 2000003 | 请求参数file_name为空 |
| 2000004 | 获取cos预签名失败，请稍后再试 |
| 2000005 | 系统繁忙，请稍后再试 |


### 5.3 查询应用详情信息接口返回码
| ret | msg |
| --- | --- |
| 3000001 | 获取到对应的应用信息出错，请稍后再试 |
| 3000002 | 无法查询到应用信息 |
| 3000003 | app_id和pkg_name绑定错误，请查证后再试 |


### 5.4 更新应用接口返回码
| ret | msg |
| --- | --- |
| 4000001 | 请求参数category格式错误 |
| 4000002 | 请求参数age格式错误 |
| 4000003 | 请求参数screen_size格式错误 |
| 4000004 | 请求参数language格式错误 |
| 4000005 | 请求参数ipv6格式错误 |
| 4000006 | 请求参数device_type格式错误 |
| 4000007 | 请求参数is_soft_delegation格式错误 |
| 4000008 | 请求参数soft_delegation_period_type格式错误 |
| 4000009 | 请求参数soft_delegation_start_time格式错误 |
| 4000010 | 请求参数soft_delegation_end_time格式错误 |
| 4000011 | 请求参数apk_file_bit_type格式错误 |
| 4000012 | 请求参数login_flag格式错误 |
| 4000013 | 请求参数pay_type格式错误 |
| 4000014 | 请求参数demo_video_flag格式错误 |
| 4000015 | 请求参数deploy_type格式错误 |
| 4000016 | 请求参数deploy_time格式错误 |
| 4000017 | 应用名称长度不得超过50 |
| 4000018 | 应用名称修改原因长度不得超过200 |
| 4000019 | 无效的应用分类 |
| 4000020 | 应用分类修改原因长度不得超过200 |
| 4000021 | 应用简介长度应介于60-500之间 |
| 4000022 | 应用一句话简介长度应介于5-15之间 |
| 4000023 | 无效的应用年龄分级 |
| 4000024 | 无效的应用屏幕尺寸 |
| 4000025 | 无效的应用支持语言类型 |
| 4000026 | 无效的应用ipv6支持类型 |
| 4000027 | 无效的应用支持设备类型 |
| 4000028 | 无效的应用软著转授权标记 |
| 4000029 | 无效的应用软著转授权有效期类型 |
| 4000030 | 无效的应用软著转授权有效期起止时间 |
| 4000031 | 调用信息安全检测校验接口失败，请稍后重试 |
| 4000032 | 无效的应用涉及登录标记 |
| 4000033 | 测试登录账号不能为空 |
| 4000034 | 无效的应用涉及支付类型 |
| 4000035 | 请上传无支付仅提现承诺函 |
| 4000036 | 无效的应用涉及配套设备标记 |
| 4000037 | 请上传配套设备操作视频 |
| 4000038 | 无效的应用审核通过后的发布类型 |
| 4000039 | 无效的应用审核通过后定时发布时间 |
| 4000040 | 未传apk32_file_md5 |
| 4000041 | 未传apk64_file_md5 |
| 4000042 | 查询文件上传记录出错，请稍后再试 |
| 4000043 | 未查询到文件上传记录，请查证后重试 |
| 4000044 | 下载包文件失败，请查证后重试 |
| 4000045 | 解析校验32位或32&64位兼容包失败，请查证后重试 |
| 4000046 | 解析校验64位包失败，请查证后重试 |
| 4000047 | 请求参数apk32_flag格式错误 |
| 4000048 | 请求参数apk64_flag格式错误 |
| 4000049 | 无效的请求参数apk32_flag |
| 4000050 | 无效的请求参数apk64_flag |
| 4000051 | 未传32位或32&64位兼容包 |
| 4000052 | 未传64位安装包 |
| 4000053 | 调用提交应用审核接口失败（原因详见返回的msg内容） |


### 5.5 查询提交的应用更新的审核状态接口返回码
| ret | msg |
| --- | --- |
| 5000001 | 查询应用审核信息出错，请稍后再试 |
| 5000002 | 未查询到应用审核信息，请查证后重试 |

