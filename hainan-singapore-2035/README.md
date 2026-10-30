# 双岛2035 · 海南岛 × 新加坡

一个以“连接如何变化”为主线的开源决策风洞。六页共享同一个实验：世界入口、看见变化、制定战略、推演现场、未来分叉、盲区与桥梁。

**v2.1续建：已加入经官方来源逐项核对的2025年参考指标（只在情报流展示），全部推演参数、网络关系、2026—2035情景结果仍为合成演示，尚未使用真实经济参数标定。**

## 功能

- 拖拽、聚焦、点击双岛关系网络，查看主体与连接。
- 在资源约束下选择港航、服务、人才、韧性投入及实施时间；两地均可作为行动对象。
- 加入、更新、移除演示事件，区分“仅有消息”“公告核验”“假设生效”。
- 播放2026—2035年度演化，与同事件下的均衡起步方案对照。
- 查看480条合成路径的P10/P50/P90、投入敏感性及关键节点。
- 发现隐藏约束、意外后果和候选桥梁，加入桥梁后重跑。
- 导出判断卡与复现方案，通过D1保存包含输入、输出、版本、种子的个人快照。

已运行：年度示例规则、SNA指标、蒙特卡洛。SmartPLS、ABM、SD、动态博弈、MCDA及渗流扩展待独立接入和验证。示例对方响应不等于动态博弈已实现。

## 启动

需要Node.js 22.13+、Python 3.9+，使用锁文件安装依赖。

```sh
npm run install:ci
npm run dev
```

打开终端显示的本地地址。托管使用Vinext与Cloudflare Workers；计算仅在服务端运行。

## 保存快照

启用D1绑定`DB`并应用`drizzle/`迁移。快照按平台注入的ChatGPT用户ID隔离，保存时结果原样保留。
普通本地预览没有托管身份时，可推演、导入和导出方案；持久保存需要有效身份上下文。

## GitHub来源和定期更新（惠东仓库独立子目录挂靠）

项目标识固定为`two-islands-2035-20261030`。当前源码暂挂在公开仓库`zhanglingshare/huidong-simulator`的`hainan-singapore-2035/`子目录；惠东原有根目录页面、模型、数据和工作流不属于本项目。

服务端配置以下非秘密变量：`DATA_REPOSITORY=zhanglingshare/huidong-simulator`、`DATA_BRANCH=main`、`DATA_MANIFEST=hainan-singapore-2035/data/latest.json`。本项目专用GitHub Actions位于父仓库`.github/workflows/two-islands-ci.yml`与`two-islands-update-data.yml`，仅对本子目录运行；数据收集默认北京时间每日08:00，也可手动运行。`GET /api/evidence`只读取上述独立manifest。

本项目包含服务端API与Cloudflare D1绑定，惠东现有GitHub Pages仅托管静态HTML，不能直接运行本项目的服务端推演；运行部署须独立配置Cloudflare Workers与D1。

来源由`data/sources.json`配置。2026-10-30新增六项官方基线参考指标，依据保存在`data/reviews/`及`data/history/`。不同币种/常住与总人口/货物吨数与TEU不得直接比较。工作流记录页面标题、来源URL与正文哈希，只发现变化，不会把抓取成功自动升级为已核验事实。失败保留旧数据，全失败且没有旧值时不发布空更新。

另行授权的情报任务负责一手来源核验和结构化数据更新。确认记录后可运行：

```sh
python3 scripts/update_data.py --apply-reviewed /path/to/reviewed-patch.json
python3 scripts/update_data.py --check
```

记录字段：`id,label,tier,source_url,published_at,status,reviewed_by,reviewed_at`；指标另需`value,unit,period,region,definition`。保留原币种、口径和修订关系。先写`data/history/`再原子替换`data/latest.json`。

**当前边界：**latest初始为空且标明未连接；资料更新不会自动标定模型。真实证据到参数映射需要独立验证。旧实验快照不会被新资料覆盖。GitHub计划任务可能排队，不等于实时流。

## 验证

```sh
npm test
npm run typecheck
npm run build
```

测试覆盖资源限制、未来事件不改变过去、消息不改变路径、生效分离、桥梁作用、双方响应、可复现输出、抓取失败保留旧数据。

## 主要目录

| 路径 | 用途 |
|---|---|
| `app/page.tsx` | 六页联动工作区 |
| `app/globals.css` | 桌面与移动端样式 |
| `lib/contracts.ts` | 数据与交互契约 |
| `lib/engine.ts` | 服务端合成演示引擎 |
| `app/api/` | 推演、快照、GitHub资料适配器 |
| `data/` | 来源、最新版本与历史快照 |
| `scripts/update_data.py` | 来源变化检测、复核数据写入 |
| `.github/workflows/update-data.yml` | 定期收集工作流 |
| `tests/` | 引擎与更新测试 |

## 开源和数据使用

代码MIT。第三方数据与引用资料遵循来源自身授权，MIT不重新授权第三方内容。仓库不含密钥、个人快照或真实私有参数。合成结果不构成现实经济预测或决策承诺。

## 续建交接（2026-10-30）

- Sites 原预览继续独立运行；本源码包的改动**尚未部署**到该网站，不要把预览 URL 当作本ZIP版本的验证。
- 当前挂靠路径为`zhanglingshare/huidong-simulator/hainan-singapore-2035/`；不要修改惠东根目录页面、模型、数据或既有工作流。若未来拆分独立仓库，只迁移本目录与明确归属双岛的专用工作流。
- GitHub Actions 的实际执行仍需在仓库导入后核验；工作流只收集官方页面元数据，指标需单独复核才能写入`data/latest.json`。
- 演示 Monte Carlo 与 SNA 不构成真实参数标定的 SmartPLS/PLS-SEM 模型；应另建研究/验证管线，再选择经过检验的公开参数发布。
