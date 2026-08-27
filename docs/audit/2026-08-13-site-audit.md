# airsonde.com 官网全面审计 — 2026-08-13

**派单**：AU1（`airsonde文件/派单/AU1-官网全面审计.md`）
**执行**：AirSonde-审计窗 · 只读，未改任何站点代码、未提交、未部署
**被审对象**：生产站 `https://airsonde.com`（不是本地 dist，不是源码）

---

## 审计基线（先说清楚我量的是什么时刻的站）

| 项 | 值 |
|---|---|
| 审计开始时本地 HEAD | `92508f1`，与 `origin/main` 零 ahead / 零 behind |
| 审计结束时本地 HEAD | **`843d164`**（"About story block: one grid, bigger body, dead space cut"） |
| 页面语料 | 生产 36 个 URL 全量 curl，两次快照 |
| 快照 A | CSS 指纹 `LightBase.BL-wWHFS.css` |
| 快照 B | CSS 指纹 `LightBase.CjYB2D2-.css`（审计中途重新部署） |
| 收尾时 | CSS 指纹 `LightBase.BxPpR0fb.css`（又一次部署） |

⚠️ **这是一份移动靶上的审计，两条都要记住：**

1. **生产在审计期间至少被重新部署 2 次**（CSS 指纹三变）。我在第二次之后重取全部 36 页并逐页 `cmp`：除 `/solutions/` 增加了 4 条卡片摘要文案外，**36 页可见文本零变化**，本报告所有诚实性结论已在新语料上复验通过。快照 C 我只取了 CSS，未重取 HTML —— 若在此之后又有内容改动，本报告不覆盖。
2. **本地工作树是共享的，Web 窗在审计期间一直在同一棵树上作业**：HEAD 前进了若干 commit，且出现了两个不属于我的未跟踪文件 —— `scripts/clean-product-marks.mjs`、`src/assets/photos/contact-support-hero-v11.png`。**前者的文件名指向 R2 所述的产品图角标清理，说明该问题可能已在处理中**；本报告描述的是我实测时刻的生产状态，不代表仓内此刻的意图。

**本次审计对仓库的唯一写入是本文件**（`docs/audit/` 为新建目录）。未改任何站点代码、未 `git add`、未 commit、未部署。

---

## 结论摘要

| 级别 | 条数 | 一句话 |
|---|---|---|
| 🔴 必须修 | 4 | 首页 Solutions 3/4 空白；被自家闸判死的 7 张图全在生产上；白牌承诺与产品图自相矛盾；结构化数据里有事实错误 |
| 🟡 应该修 | 8 | 数字断言无工厂确认；站内时效打架；字体 121 KB；图片黑边等 |
| ⚪ 建议 | 4 | sitemap 惯例、title/desc 长度、死 CSS、瓦片 alt |

**认证词红线：干净。** 我独立复扫，`FCC` / `CE` / `RoHS` / `UKCA` / `ISO` / `compliance` / `compliant` / `certificate` / `approved` / `accredited` / `ETL` / `EMC` / `LVD` 在 36 页可见文本中**全部 0 命中**。总工说的那条已删且删干净。剩余 8 处 `certification` 全是流程性表述（"Certification is scoped per programme and per model"），属立场声明，合规。

---

# 🔴 必须修

## R1 — 首页 Solutions 模块 4 个场景中 3 个没有图，白字对比度 1.16:1

**在哪**：`https://airsonde.com/` → 「For every environment」模块 → `Office` / `School` / `Industrial` 三个标签页（`Home` 标签正常）

**实测证据**（冷加载复现，两次独立跑，结果一致）：

1. 全新导航 → 把 `[data-as-scenes-stage]` 滚进视口，实测其占据 `y 198..702`，视口高 900 → **完全可见**
2. 依次点击 Office / School / Industrial，每次等待 2.5 s：

| 点击 | 面板 active | 面板 `display` | 图片盒子 | `img.complete` | `naturalWidth` | `currentSrc` |
|---|---|---|---|---|---|---|
| Office | scene 1 | block | 1192×504 @ y=198 | `false` | 0 | 空 |
| School | scene 2 | block | 1192×504 @ y=198 | `false` | 0 | 空 |
| Industrial | scene 3 | block | 1192×504 @ y=198 | `false` | 0 | 空 |

3. 整场会话 `performance.getEntriesByType('resource')` 里 `scene-*` 请求**只有 `scene-home` 一张**（两个变体，137,016 B + 197,656 B）。`scene-office` / `scene-school` / `scene-industrial` **一次都没有被请求**。
4. 图没加载时白字后面是什么 —— 逐层取 `backgroundColor`：

```
A.as-scenepanel.is-active   rgba(0,0,0,0)
DIV.as-scenestage           rgba(0,0,0,0)
DIV.as-container            rgba(0,0,0,0)
SECTION.as-section.as-band--alt  rgba(0,0,0,0)
MAIN                        rgba(0,0,0,0)
→ 首个不透明层 rgb(236,238,241)，相对亮度 0.8533
```
文字 `rgb(255,255,255)`，`text-shadow: none`，无 `::before`/`::after` 遮罩 → **对比度 1.16:1**（WCAG AA 小字要求 4.5，大字 3.0）。

**影响**：首页第二大模块的 3/4 渲染为空白灰底 + 肉眼不可见的白字。B2B 买家在 hero 之后看到的第一个"我们能覆盖哪些场景"展示位是坏的。这是本次审计**唯一一条纯视觉层面的重大对外可见缺陷**。

**建议改法**（定位归 Web 窗，我不动手）：症状与 `loading="lazy"` 的 `<img>` 处在 `display:none` 容器内一致 —— 隐藏子树不产生交集，浏览器不发起请求，切换回 `display:block` 后也未补发。方向：激活时显式 `img.loading='eager'` + `img.decode()`，或首屏就把 4 张全部预取，或改成 CSS 背景。修完请用本条的复现路径回归：**冷加载 → 滚进视口 → 点标签 → 断言 `naturalWidth > 0`**。

---

## R2 — 被 `asset-review.md` 判定为 disqualifying 的 7 张图，被一次批量发布全部推上生产

这条不是"图片不够干净"的观感问题。**站点自己写了闸，闸判了死刑，一次批量操作把它们全放行了。**

### 证据链（全部可复核，均来自本仓）

1. `docs/asset-review.md` §Disqualifying：
   - 第 1 条 —— 他人品牌标：*"Five of the first 38 carried an `ICANOW` logo in the top-left corner."*
   - 第 3 条 —— 无肖像授权的人：*"One photo showed two identifiable children in a living room… publishing an identifiable person — a child especially — without a model release is a legal exposure in exactly the markets we sell into."*
   - 第 5 条 —— 烤死的营销文案
   - 判罚写死：*"Disqualifying — set `status: \"draft\"` and say so in the report"*
2. `docs/photo-log.md` 第 50–51 行：*"the only lifestyle shot in the 38 shows unreleased children and **stays banned**."*
3. commit `04f82b0` — `admin: bulk status=published · 11 个产品 (joe@wanew.com)`，2026-08-12 17:12:11 +0800，commit body 注明「来源：admin.airsonde.com」
4. 该 commit 把 11 个产品从 `status:"draft"` 改为 `"published"`。**这 11 个里有 7 个的主图是上面三条判死的对象。**

### 我独立复扫 32 张产品图的结果

| 类别 | 我的计数 | 派单说的 | 文件 |
|---|---|---|---|
| ICANOW 角标 | **5** | "至少 6" | `co2-desktop-monitor` / `compact-9in1-desktop-monitor` / `mini-co2-desktop-monitor` / `wall-mount-co2-tvoc-monitor` / `wifi-9in1-desktop-monitor` |
| 烤死营销字 | **1** | 1 | `wbgt-heat-index-monitor`（红色 "IP65 waterproof and dustproof"） |
| 可辨识人像 | **1** | 1 | `7in-desktop-air-quality-monitor`（2 名可辨识儿童 + 犬，居家场景） |

⚠️ **ICANOW 我数出 5 张，不是 6 张。** 5 这个数与 `asset-review.md` 自己写的 "Five of the first 38" 吻合。派单里的"6"很可能是把 IP65 那张并进去算的总数（5+1=6 张不合格图）。

### 出现位置对账（这一项比派单预估的严重）

| 图 | 出现 URL 数 | 具体位置 |
|---|---|---|
| **儿童照** `7in-desktop-air-quality-monitor` | **16** | `/products/` 列表页 + 自己的详情页主图 + **其余 14 个 desktop 产品详情页的「相关推荐」卡** |
| `wall-mount-co2-tvoc-monitor`（ICANOW） | 3 | **首页**「Shop by form factor → Wall-mounted」瓦片 + `/products/` + 自己的详情页 |
| `co2-desktop-monitor`（ICANOW） | 2 | `/products/` + 自己的详情页 |
| `compact-9in1-desktop-monitor`（ICANOW） | 2 | 同上 |
| `mini-co2-desktop-monitor`（ICANOW） | 2 | 同上 |
| `wifi-9in1-desktop-monitor`（ICANOW） | 2 | 同上 |
| `wbgt-heat-index-monitor`（IP65） | 2 | 同上 |

**派单写的是"现在是产品详情页主图"—— 实测是 16 个 URL。** 相关推荐模块给每个 desktop 产品都挂了同样 3 张兄弟图，儿童照是其中之一，于是它扩散到了几乎每一个桌面型产品页。

**影响**：
- **法律暴露**：无 release 的可辨识儿童肖像，公开可访问，目标市场正是对肖像权执法最严的欧美。这一条是站上唯一有真实法律后果的项。
- ICANOW 是**供应商的品牌**出现在一个自称能给客户贴牌的厂商的产品图上（见 R3）。

**建议改法**：这 7 个产品退回 `draft`，或换掉主图。**注意退回后的连带**：儿童照退出后，14 个 desktop 详情页的「相关推荐」会少一张卡，需确认那个模块在只剩 2 张时的布局。派单说明 Joe 知情且是他本人批量上架的 —— 我不争论该不该上架，以上是现状与代价。

---

## R3 — "Nothing points back to us" 与产品图指向 ICANOW，自相矛盾

**在哪**：
- 首页 →「Why AirSonde → White-label ready」：*"Your brand on the housing, display, app and box. **Nothing points back to us.**"*
- `/about/` → FAQ *"Will AirSonde appear anywhere on our product?"* → *"Your name on housing, display, app and box. **Nothing points back to us.**"*
- 同一批页面上有 5 张产品图带 ICANOW 角标，其中一张就在**首页**。

**对 B2B 买家信任的具体影响判断**（派单点名要这一条）：

这不是"图没 P 干净"的观感问题，是**能力证明失效**。贴牌采购方对供应商的核心怀疑只有两条：*我的单子会不会和别人的混着做？我的货上会不会留下别人的痕迹？* 站上恰好同时摆出了这两句话的正反面 ——「我们不留痕」的承诺，和「别人的品牌留在我们自己官网的图上」的事实。

买家能推出的结论有两个，都很坏：
1. **他们不是在造这些东西，是在转手别人的**。ICANOW 的图 + ICANOW 的品牌 = 这是 ICANOW 的产品线，AirSonde 在中间转一手。对一个自称"背后是自有工厂"的供应商，这是最致命的一种怀疑。
2. **"不留痕"这句话没有执行力支撑**。连自己官网这几十张图都没清理干净的供应商，不会有人相信它能在量产 5,000 台时保证每个丝印、每张说明书、每个开机 logo 都是买家的。

对比之下，**认证栏空着反而是安全的** —— 空着传达的是"还没做到"，买家会接着问"什么时候能有"。而这条矛盾传达的是"说的和做的不一致"，买家不会问第二句，直接换供应商。这也是为什么 R2 的优先级应当高于任何 SEO / 性能项。

**建议改法**：R2 修完这条自动消解。若短期内无法换图，则「Nothing points back to us」这句在图清理干净前应当撤下 —— 留着承诺而拿不出执行力，比不写这句话更伤。

---

## R4 — Product JSON-LD 把 5 个非空气类产品描述成 "other indoor air quality monitor"

**在哪**：5 个 `category: "other"` 产品详情页的 `<script type="application/ld+json">` → `Product.description`

**实测证据**（生产 HTML 原文）：

```
Portable Geiger Counter (AS-X-RAD) — other indoor air quality monitor measuring radiation.
Pump-Type Breathalyser (AS-X-ALC1) — other indoor air quality monitor measuring alcohol.
Portable Breathalyser (AS-X-ALC2) — other indoor air quality monitor measuring alcohol.
App-Connected Breathalyser (AS-X-ALC3) — other indoor air quality monitor measuring alcohol.
WBGT Heat Index Monitor (AS-X-WBGT) — other indoor air quality monitor measuring WBGT, temperature, humidity.
```

两个问题叠在一句话里：
1. **事实错误**：盖革计数器测的是电离辐射，酒精测试仪测的是呼气酒精浓度 —— 都不是室内空气质量检测仪。模板把 `category` 无条件拼成 "…indoor air quality monitor"。
2. **枚举值泄漏**：内部分类值 `other` 被当成英文形容词直接输出（"other indoor air quality monitor"），语法不通。

**影响**：站的首要目的是 **AI/SEO 获客**，而 JSON-LD 正是喂给爬虫与 LLM 的那条通道。在这条通道上把产品类目说错，等于主动给检索侧灌错标签。人眼看不见（可见文本里的 meta description 措辞是对的：*"Portable Geiger Counter, model AS-X-RAD. radiation sensing."*），机器全看得见。

**同时确认（这条是好消息）**：23 个 Product JSON-LD **无 `offers` / `price` / `priceCurrency` / `aggregateRating` / `review` / `availability`** —— 派单点名的假报价红线守住了。`sku` / `mpn` 用的是内部型号（AS-D7 等），与 `src/content/products/*.json` 的 `model` 字段一致，不是编造。

**建议改法**：描述模板按 `category` 分支，`other` 类不套 "indoor air quality monitor" 这个中心词。

---

# 🟡 应该修

## Y1 — About 页六项数字断言：溯源可查，但对工厂的独立确认不存在

**在哪**：`/about/`（6 项）与首页（其中 4 项）

| 数字 | 标签 | 首页 | About |
|---|---|---|---|
| 15+ | Years of OEM / ODM manufacturing | ✓ | ✓ |
| 150+ | Production and engineering staff | ✓ | ✓ |
| 200+ | Patents and registrations | ✓ | ✓ |
| 5,000m² | Production facility | ✓ | ✓ |
| 600,000+ | Units per month capacity | — | ✓ |
| 130+ | Countries shipped to | — | ✓ |

**我做的复验**（比真源，不比字面量）：

1. `docs/photo-log.md` §"Factory photography on /about/" 声称六张工厂照 fork 自 wanew 仓、"also live on wanew.com/about"、Joe 授权。
2. 我拉了 `https://wanew.com/about/` —— **六个数字全部命中**，**六个工厂照文件名全部存在**。
3. 我逐张下载 wanew 的 6 张图与本仓 `src/assets/photos/factory/` 做 SHA-256 比对 —— **6/6 字节完全相同**。

**结论：出处记录属实，不是编造，我不把它列为 🔴。** photo-log 的溯源纪律做得比多数项目好。

**但仍是 🟡，理由是溯源链只走到了同一个所有者的另一个站**：这六个数字在 AirSonde 的证据是 wanew 写过，wanew 的证据是 wanew 自己写的。链条上没有工厂出具的任何东西。

**具体的刺**：`airsonde文件/给工厂的问题清单.md` 内部备注表第 56 行把「五 出口经验 / About 页信任背书」记为 **"空着"**，对应待问项是「有没有出过欧美的案例？」「有没有做过带 CE/FCC 认证的成品出口？」。而 `/about/` 现在写着 **"130+ Countries shipped to"**。

**我无法验证**工厂此后是否已回答过这两问 —— 该清单没有回执栏，我在仓里也找不到工厂回复的落盘记录。**需 Joe 或总工确认**：若工厂已确认，把回执落成文件，这条即可关闭；若未确认，"130+ Countries shipped to" 与 "600,000+ Units per month capacity"（产能，正是派单点名"工厂尚未确认"的一项）属于**来源/能力声明**，按派单判据不该以全称断言形式上站。

**其余能力主张的复核**（派单点名的几项）：
- 开模 —— 站上只有 `/about/` OEM 卡里的 "Tooling and production setup"，是流程名词，不是"我们能开 X 模、多少钱、多久"，✓ 未越界
- 认证 —— 全站 0 处实体认证声明，✓
- 技术方案（NDIR / 激光 / 电化学）—— 全站 **0 命中**，✓ 已按问题清单第 55 行删净
- 交期 —— 未见具体天数承诺，✓
- 来源声明（"我们的客户说 / N 家品牌选择"）—— **0 处**，✓ 零客户阶段没有编造客户

## Y2 — 响应时效站内自相矛盾

- `/contact/` →「Response time」→ **"Within 1 business day"**
- `/` →「Engineering support」→ **"An engineer replies, normally within two business days."**

全站仅此两处提及时效，两处不一致。买家两个页面都会看。**建议**：统一，并取保守的那个。

## Y3 — 首页「Wall-mounted **1 models**」单复数错误

**在哪**：首页「Shop by form factor」第 4 块瓦片。
**证据**：渲染原文 `Desktop 15 models` / `Other 5 models` / `Portable 2 models` / `Wall-mounted **1 models**`。
**顺带确认（对账通过）**：4 个类目计数与 `src/content/products/*.json` 完全一致 —— desktop 15、other 5、portable 2、wall-mounted 1，合计 23 ✓。

## Y4 — 4 个 solutions 子页标题层级跳级（h1 → h3）

**在哪**：`/solutions/home/`、`/solutions/office/`、`/solutions/school/`、`/solutions/industrial/`
**证据**：标题序列实测 `[1, 3, 3, 3, 2, 2, 2]` —— h1 之后直接是三个 h3，之后才回到 h2。
**其余 32 页层级正常。全站 36 页 h1 数量均为 1，无缺失无重复 ✓。**

## Y5 — 首页 `scene-home` 被取了两次，多花 334 KB

**证据**：单次冷加载的资源表里同时出现
`scene-home.BRgJehuU_ZcyzdF.webp 137,016 B` 与 `scene-home.BRgJehuU_2aamI3.webp 197,656 B`（1280w 与 1600w 两个变体）。
该图 `sizes="(min-width: 1200px) 1140px, 94vw"`。同一稳定视口下取两个变体 = srcset/sizes 求值发生了两次。
**注**：我在同一会话里做过视口切换，不能 100% 排除是我的操作诱发。**建议 Web 窗在纯净会话里复测一次**再定性。

## Y6 — 5 个字体文件 121 KB，占首屏总量的 41%

**实测**（1440 冷加载，未滚动）：

| 类别 | 字节 | 占比 |
|---|---|---|
| HTML | 5,722 | 1.8% |
| CSS | 8,670 | 2.7% |
| **字体** | **121,144** | **38.1%** |
| 图片 | 182,416 | 57.4% |
| **合计** | **317,952** | 请求数 10 |

五个 woff2 全量加载：`inter-latin-400/500/600/700/800`，每个约 23.7–24.5 KB。

**这是本站投入产出最高的一条优化。** 全站实际用到的字重可从 CSS 与渲染中核出，800 只用于 hero h1、700 用于卡片标题。**建议**：砍到 3 个字重（400/600/800 或 400/700），省约 48 KB，占首屏 15%；或对非首屏字重改 `font-display:optional`。

## Y7 — 首页 `scene-home` 标了 `loading="eager"`，但它在折下很远

**证据**：首页 20 张 `<img>` 中，`scene-home` 的属性是 `loading="eager"`，而它所在的「For every environment」模块实测起始于 `y=2528`（1440×900 视口，即约 2.8 屏之下）。它是首屏 10 个请求里第 1 大的资源（137 KB），比真正的 LCP 元素 hero（39.5 KB）大 3.5 倍。

**这是第二条高投入产出项**：改成 `lazy` 可从首屏移走 137 KB（占首屏 43%）。
⚠️ **与 R1 有耦合** —— 另外三张 scene 图正是因为 `lazy` + `display:none` 才不加载。**两条必须一起设计**，不要单独把 `scene-home` 也改成 lazy，否则四张全空。

## Y8 — 7 张产品图带烤死的黑边/黑底，在浅色站上是黑框

**实测**（取每张图最外 2% 边框像素，统计亮度 <40 的占比）：

| 文件 | 暗边占比 | 是否主图 |
|---|---|---|
| `compact-square-air-quality-monitor.webp` | **69.6%** | **是** |
| `9in1-desktop-air-quality-monitor-2.webp` | 64.1% | 否（gallery） |
| `compact-square-air-quality-monitor-2.webp` | 53.1% | 否（gallery） |
| `wifi-widescreen-air-quality-monitor.webp` | 21.7% | **是** |
| `handheld-air-quality-analyser.webp` | 21.5% | **是** |
| `16in1-large-display-monitor.webp` | 20.4% | **是** |
| `portrait-aqi-desktop-monitor.webp` / `-2.webp` | 19.3% | **是** / 否 |

站已按 Joe 定案改为浅色底，这些黑底图在白卡片上是可见的黑框。`16in1` 与 `handheld` 两张出现在**首页**产品卡。

**顺带发现的两组近似重复图**（平均像素差 <8，同尺寸）：
- `co2-tvoc-hcho-desktop-monitor-5.webp` ≈ `co2-tvoc-hcho-desktop-monitor.webp`（差 0.87 —— 该产品 gallery 里有一张与主图几乎相同）
- `portrait-aqi-desktop-monitor-2.webp` ≈ `portrait-aqi-desktop-monitor.webp`（差 6.87）

---

# ⚪ 建议

## W1 — `/sitemap.xml` 返回 404

`robots.txt` 指向的是 `https://airsonde.com/sitemap-index.xml`（实测 200，内含 `sitemap-0.xml`，36 条），**协议上完全正确**。但 `/sitemap.xml` 这个约定俗成的路径返回 404，部分工具与人工排查会先试它。建议加一条 301 到 `sitemap-index.xml`。

**sitemap 对账（派单要求报两个数字）**：

| | 数 |
|---|---|
| `sitemap-0.xml` 条目 | **36** |
| dist 实际可索引页 | **36** |
| dist HTML 总数 | 37（含 `/404.html`，带 `noindex, follow`，正确排除） |

两侧 `comm` 双向差集**均为空**。零漏、零多。✓

## W2 — 13 个 title 超 60 字符，14 个 meta description 超 160 字符

无重复、无空缺（36/36 唯一且非空 ✓）。最长 title 73 字符（`16in1-large-display-monitor`），最长 description 193 字符（同页）。超长部分在 SERP 会被截断，不影响索引。

## W3 — 未使用 CSS 约 18.7%

对 10 个代表页做选择器命中测试：402 条规则中 87 条未命中，约 7,760 / 41,535 规则字节。集中在 hero 改版遗留（`.as-hero--banner*`、`.as-hero__cta`、`.as-scene`、`.as-scene__label` 等）。
**字节层面不值得动**（整份 CSS 过线仅 8.7 KB brotli，18.7% ≈ 1.6 KB），但作为死代码建议随下次 hero 相关改动一并清理。

## W4 — form factor 瓦片的 alt 写的是类目名而非图片内容

首页 4 个瓦片：`alt="Desktop"` / `"Other"` / `"Portable"` / `"Wall-mounted"`，而图片内容是具体产品。
**全站 alt 总体质量良好**：250 个 `<img>`，**无 alt 属性 0 个、空 alt 0 个、alt 写成文件名 0 个** ✓。

---

# 通过项（复核后确认成立，不必再查）

| 项 | 实测结果 |
|---|---|
| 认证词红线 | 13 个词全站可见文本 **0 命中** |
| 来源声明 | "我们的客户 / N 家品牌"类 **0 处** |
| 技术方案全称断言 | NDIR / 激光 / 电化学 **0 命中** |
| JSON-LD 假报价 | `offers` / `price` / `aggregateRating` / `review` **0 处** |
| JSON-LD 合法性 | 36 页全部 `JSON.parse` 通过，**0 处解析失败** |
| canonical | 36/36 正确，零缺失、零自相矛盾 |
| robots meta | 36 个可索引页均无 `noindex`；404 页有 `noindex, follow` |
| `lang` | 36/36 = `en` |
| H1 | 36/36 恰好 1 个 |
| 孤儿页 | **无**（每页站内入链 ≥1） |
| 死链 | 站内链接全部指向 sitemap 内路径，**0 死链** |
| 外链 rel | 2 条外链（WhatsApp、Google Maps），均带 `rel="noopener"` |
| `/capabilities` 301 | `/capabilities` 与 `/capabilities/` 均 301 → `/about/` ✓ |
| **响应式 1440 / 768 / 375** | 6 个代表页 × 3 档 = 18 组，**零横向滚动、零溢出、零卡片重叠** |
| CLS | 1440 冷加载实测 **0**（0 次 layout shift） |
| 表单 label | 6 个控件全部包裹式关联 ✓；`aria-live="polite"` 状态区；蜜罐 `aria-hidden` + `tabindex="-1"`；`maxlength` / `autocomplete` 齐全 |
| focus 指示器 | 全局 `:focus-visible{outline:2px solid #0C7A6B; outline-offset:3px}`，对白底 5.23:1、对 #ECEEF1 4.5:1，均过 SC 1.4.11 的 3:1 |
| `prefers-reduced-motion` | 已处理 |
| 汉堡菜单 | 真 `<button type="button">`；`aria-label="Menu"`；`aria-expanded` 实测 false→true→false；`aria-controls="as-nav"` 指向真元素；关闭时 `display:none`（内容不可聚焦）；**Esc 能关** |
| 正文对比度 | `rgb(77,87,98)` on 白 = **7.35**（≥7 ✓）；hero h1 = **15.91** |
| 品牌绿导航 | `#0C7A6B` on `#ECEEF1` = **4.50**（恰好卡在 AA 线上）；产品卡 meta on `#F4F5F7` = **4.80** |
| 产品数据一致性 | 23 个产品的 `name` / `model` / `sensors` / `highlights` / `specs` 逐字段核对页面渲染，**0 处不一致** |
| MOQ 不上站 | ✓ 仍成立 —— 1 个产品 JSON 有 `moq` 值，生产 HTML **0 泄漏**；`supplierRef` 同样 0 泄漏 |
| Contact 信息 | 地址两处一致；`sales@airsonde.com` 全站一致；电话 `tel:+8618681160111` 可点；WhatsApp `wa.me/8618681160111` 与显示号码一致；微信 ID `18681160111` 与电话一致 |
| 外部 JS | **0 个** `.js` 文件；仅 2 段内联 module（首页 2,161 B） |
| LCP 元素身份 | `IMG.as-heroover__img` = `hero-workspace-v2.webp`，1440 视口取 39,496 B 变体（`loading=eager` + `fetchpriority=high`，配置正确） |
| hero 肖像 | 已知项复核**仍成立**：`hero-workspace-v2.webp` 是 Joe 提供的供应商营销图，含可辨识真人，`docs/photo-log.md` 第 103 行记录"no release on file" |
| 认证栏空缺 | 已知项复核**仍成立**，是等证书不是遗漏 |

---

# 砍了什么 / 没查动（派单要求明确列出）

| 维度 | 状态 | 原因 |
|---|---|---|
| **键盘实操**（Tab 序、真实回车/空格激活、焦点是否移入面板、关闭后是否还原） | **未验证** | 环境所限：Browser pane 未显示、页面不合成帧 → 截图通道报错，**合成按键事件也到不了页面**（我在按钮上挂了 `keydown`/`click` 监听后按真实 Return，事件日志为空）。汉堡菜单的 `aria-expanded` / Esc / `display` 门控是用程序化 `.click()` 验的，那验不出焦点行为。**这一项需要在能正常合成帧的环境里重跑。** |
| Office / School / Industrial 三个场景**图上文字**的对比度 | **无法测量** | 图根本不加载（见 R1）。已按"无图"实况给出对页面底色的 1.16:1。图修好后需重测这三张。 |
| **LCP 毫秒数** | **未测得** | 该浏览器上下文不产出 paint timing / LCP entry（`getEntriesByType('paint')` 返回空，LCP observer 无 entry）。只确认了 LCP 元素身份与其字节数。TTFB 222 ms、DCL 432 ms、load 454 ms 为实测值。 |
| 页面截图 / 视觉比对口径 | **无** | 同上，截图通道不可用。本报告所有几何与颜色结论均来自 DOM 度量与像素采样，**无一条依据"看着不对"**。 |
| 快照 C 之后的内容变动 | **不覆盖** | 收尾时发现 CSS 指纹第三次变化，我只重取了 CSS，未再次重取 36 页 HTML。 |
| 图片对比度测量的一次自相矛盾 | **已废弃错误读数** | 我对 scene 面板文字先后跑了两套量法，scene-home 标题行得到 9.76 与 2.36 两个结果。第二套把 active 面板的字形几何搬到其他面板上，映射有误，**已作废**。报告采用第一套（每个面板只用自己的图与自己的字形 rect）：eyebrow 2.98、标题 9.76、Read more 16.32。 |

---

# 修复优先级建议

1. **R2**（图片合规）—— 唯一带法律后果的一项，且 R3 随之消解
2. **R1**（Solutions 3/4 空白）—— 唯一的重大可见功能缺陷
3. **Y6 + Y7 一起做**（字体砍字重 + scene-home 改 lazy）—— 两条合计可从首屏移走约 185 KB，占 317 KB 的 58%；⚠️ Y7 必须与 R1 同批设计
4. **R4**（JSON-LD 事实错误）—— 直接影响站的首要目的（AI/SEO 获客）
5. Y1 需要的是**一次工厂确认**，不是一次改稿 —— 建议把 `给工厂的问题清单.md` 的回执落盘，再决定这六个数字的去留

---

*本报告全部结论基于生产站实测。凡我未能验证的，已在上表明确列出，未以断言语气写入。*
