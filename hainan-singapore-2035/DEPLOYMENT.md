# 双岛 2035 · 独立部署说明

该项目仅挂靠在 `zhanglingshare/huidong-simulator/hainan-singapore-2035/`，**不是惠东风洞的一部分**。惠东已有 GitHub Pages 不能运行双岛的服务端 API 和 D1 数据库。

## 运行架构
- Cloudflare Worker：`two-islands-2035`（唯一名称，不使用惠东的 Worker）。
- 绑定：`DB` 指向双岛独立 D1 数据库（数据库名 `two-islands-2035`）。
- 数据：`zhanglingshare/huidong-simulator` 的 `hainan-singapore-2035/data/latest.json`。
- CI：父仓库 `.github/workflows/two-islands-ci.yml`。
- 部署：父仓库 `.github/workflows/two-islands-cloudflare-deploy.yml`，**只允许手动运行**。

## 一次性账户准备
在 Cloudflare 账户中创建独立 D1 数据库 `two-islands-2035`，然后把以下三个值保存为此 GitHub 仓库的 Actions Secrets：

- `CLOUDFLARE_ACCOUNT_ID`：Cloudflare Account ID。
- `CLOUDFLARE_API_TOKEN`：专用的限权 API Token，具备 Workers Scripts Edit 与 D1 Edit；只授权目标账户。
- `TWO_ISLANDS_D1_DATABASE_ID`：该 D1 数据库的真实 UUID（不是项目自带占位 ID）。

在 GitHub Actions 页面手动运行 **Two Islands 2035 Cloudflare staging deploy**。它会测试、构建、配置 Worker、创建双岛自己的 D1 表，并部署到 Cloudflare。缺少凭据会明确报错，不会改变惠东。

## 重要：目前默认为非公开部署
部署脚本默认关闭 `workers_dev` 和 `preview_urls`，不绑定惠东域名，也不设置其他公开 Route。要得到可直接打开的**私有** URL，需要在 Cloudflare 另行配置受 Cloudflare Access 保护的独立域名、访问策略与可信身份校验。未完成这一环节前，**云端部署成功也不等于私有网站已可访问**。

尤其需要注意，当前 `/api/snapshots` 的身份来源是 Sites 可信托管层注入的 `oai-authenticated-user-id`。直接向独立 Worker 开放公网，会让客户端自行伪造该头；在未配置可靠身份校验前不得公开此接口或开放有快照功能的站点。

## 验收标准
- 用私有 URL 打开六页交互，实测桌面、手机，以及 `/api/simulate`、`/api/evidence`。
- D1 各账户快照隔离需通过真实身份测试。
- 只从独立数据路径读取公开情报；真实经济参数与合成情景严格区分。
- 每次部署保持惠东根目录 `index.html`、`model.js`、`README.md` 和原工作流完全不变。
