# AirSonde DESIGN overlay — light theme (W4 homepage sample)

> **继承声明**:结构层与浅色令牌继承 `C:\开发\wanew\DESIGN.md` v1(编译产物
> `wanew/skin/css/w3.css` @ 747d4e95d)。十档字阶(含 ≤1023 / ≤767 两级同步跳档)、
> 8px 间距网格、容器 1240px、section 96px 节奏、圆角 16/10、唯一缓动
> `cubic-bezier(.22,.61,.24,1)`、hover/focus 纪律、照片 hero 纪律(§3.2d)、
> 白图进浅色图台(§6.3)、板块分隔靠空间+色调交替(§3.2c,⛔细线) —— 逐字继承,
> 本文件只记 AirSonde 的差异。实现载体:`src/styles/light.css`(目前仅首页样板消费)。

## 浅色定案出处

Joe 2026-08-11(经总工转述,项目规则 v1.1 变更记录):
「airsonde.com 用浅色底 —— 空气检测仪是居家场景,深色显沉闷;wanew 深色是对标
starlink.com,理由不迁移。」

## AirSonde 差异表

| 项 | wanew W3 | AirSonde light | 依据 |
|---|---|---|---|
| 页面基底 | `#0a0c0f` 深空 | `#fff` | Joe 定案 |
| 二级底/图台/交替带 | `--w3-tile #f4f5f7`(仅图台) | `--as-tile #f4f5f7`(图台 + section 交替 + CTA/页脚底) | W3 自有浅色令牌,扩大用途 |
| 标题墨 | `--w3-text #eef1f4` | `--as-ink #101418`(= W3 白色面板标题墨) | W3 §2.1 白色面板系 |
| 正文墨 | `--w3-text2 #a9b2bb` | `--as-ink2 #4d5762` | W3 §3.7,白底实测 **7.35**(总工线 ≥7) |
| 发丝线 | `rgba(255,255,255,.08)` | `--as-line #e6e9ed`;hover 强线 `--as-line2 #c9d2da`(新令牌) | W3 白色面板表线;line2 为浅色系补位 |
| accent | `--w3-accent #7db1ff` / 浅底 `#1d63d6` | **`--as-accent #0c7a6b`**(品牌青绿 `#12b39f` 加深) | 实测:白底 **5.23**、tile 上 **4.80**,均 ≥4.5;唯一强调色纪律照 §2.1 |
| 主按钮 | 白底黑字胶囊 | **深墨底(`#101418`)白字胶囊**,高 48 圆角 999;hover `#2a323c` + 上浮 1px | §3.1 镜像;白字对比 18.50 / hover 12.96。⛔ 彩色大按钮 |
| 头部 | 透明→深色玻璃 | 透明浮 hero 上→滚动 >12px 落**白玻璃**(`rgba(255,255,255,.85)` blur 14px + 下发丝线) | §3.3 镜像 |
| hero scrim | `rgba(10,12,15,α)` 系收敛进深底 | **白 wash** `rgba(255,255,255,α)` 系收敛进 `#fff` 页底,文字用墨色 | §2.1 scrim 规则的浅色镜像 |
| 摄影题材 | 星空/越野/屋顶(Starlink 语境) | **居家/办公/教室/仓储室内**(产品的实际使用场景) | 定位不同;留档见 `docs/photo-log.md` |

## Logo(方案A「声波环」,Joe 定稿 2026-08-11,几何由总工冻结 —— 照抄,不重设计)

- **几何**(viewBox 0 0 64 64,两版都是):
  - 标准 mark(≥40px):点 r7.5;内环 r17 sw4.6 dash`89 18`;外环 r27 sw4.6 dash`141 29` opacity.55;两环 `rotate(-56)`(开口朝右上 = 空气流入,且避免像 Wi-Fi 图标)
  - **降级版(≤32px,favicon)**:砍外环加粗 —— 点 r9;单环 r22 sw7 dash`115 24` rotate(-56)
- **颜色**:浅底 = `--as-accent #0C7A6B`(**logo 与站点 accent 同一个变量,不许两个值**);深底 = `#5DCAA5`
- **字标**:Inter,`Air` 400 + `Sonde` 500,墨 `#101418`,字距 -0.5px;mark 与字标间距 ≈ 0.35 × mark 高
- **文件**:`src/assets/brand/logo-mark.svg` / `logo-lockup.svg`(字形已转 path,外发不依赖字体;重生成 `node scripts/build-brand.mjs`)/ `logo-dark.svg`;`public/favicon.svg` + `favicon-{16,32,48}.png` + `apple-touch-icon.png`
- 站内消费:header/footer 内联 mark(`currentColor` 取 `--as-accent`)+ HTML 字标(Inter 已自托管)

## 新令牌:浮层投影

`--as-elev-card`:`0 24px 48px -16px rgba(16,20,24,.22), 0 6px 16px -6px rgba(16,20,24,.10)`
—— wanew §2.6 `--w3-elev-card` 的浅色镜像。**只用于浮层**(hero 产品卡);普通卡片仍靠边框+底色,照 §2.4。

## Hero 产品合成(改令三,Joe:「hero 图里应该有我们的产品」)

38 张供应商图无一张合格的实景照(唯一生活场景照含无授权儿童,asset-review 禁用)⇒ 走批准的
第二条路:场景照片为底 + 产品放**浅色图台浮层卡**(白底卡 + `--as-elev-card`)浮于其上。
⛔ 白底产品图**裸叠**在照片上 = 露拼接痕,禁。卡上文字只放型号(不加关键词噪音)。

## 对比度实测(2026-08-11,WCAG 2.x,脚本算值)

| 前景 | 白底 #fff | tile #f4f5f7 |
|---|---|---|
| `--as-ink #101418`(标题) | 18.50 | 16.96 |
| `--as-ink2 #4d5762`(正文) | **7.35** | 6.74 |
| `--as-accent #0c7a6b`(眉题/链接/箭头) | **5.23** | **4.80** |
| 白字 on 主按钮 `#101418` | 18.50 | — |
| 白字 on 按钮 hover `#2a323c` | 12.96 | — |

⚠️ 每个前景取**最不利背景**读数(wanew §8.15):accent 的判定值是 4.80(tile 面),不是 5.23。

⚠️ **`#4d5762` 在 tile 面上 = 6.74 是【已知值,不是缺陷】**(总工裁定 2026-08-11):
≥7 那条线是 wanew 给**白卡正文**定的;tile 是另一个面,wanew 自己在同组合上出的就是 6.74,
≥4.5 合规。**与 wanew 逐值一致 > 单点加严** —— 别当缺陷修。

## 改版批次的标准判据(总工升格 2026-08-11)

**「分支产物 vs 主干干净构建逐字节 diff」是每个改版批次的必跑仪器**,理由是两条肉眼永远看不见的缺陷:
1. **Tailwind 把项目里所有文件的英文单词当候选类名扫描 —— markdown 文档和代码注释也在内。**
   文档里写个 "blur 14px",共享样式表就多一个 `.blur`,hash 变,**16 个没动过的页面 `<link>` 全变**。
   防御:纯文档用 `@source not` 排除(global.css);代码注释措辞避开工具类单词(legacy-home-classes.ts 文件头)。
2. **基线必须来自干净构建**(worktree + 全新 install),增量 dist 的陈旧产物当基线会报出成批假差异 ——
   仪器先校准,读数才算数。

## 新组件登记(首页样板)

`as-header / as-hero(__wash/__eyebrow/__product) / as-chips / as-pcard+as-stage /
as-form-tile / as-scene / as-panelcard(__points) / as-cap / as-cta / as-footer /
as-btn(--primary/--ghost) / as-link-arrow / as-eyebrow / as-sechead / as-brand(__mark/__word) /
[data-as-reveal]` —— 全部只在 `light.css` 定义,
禁止页面内联样式发明第二种写法。新组件/新令牌照本文件头部规则:**同 commit 登记**。

About 页新增(2026-08-11):`as-hero--page`(信息页矮版照片 hero,clamp(400px,46vh,560px) 照 §3.2d)/
`as-stats+as-stat`(1px 发丝网格拼接数据格,W3 §3.6 .w3-stats 的浅色版)/
`as-gallery`(6 列非对称工厂影像墙,前两张跨 3、其余跨 2,≤719px 单列 —— .about-facwall 的浅色版)/
`as-steps+as-step`(编号卡:质检五步与流程四步共用一套 —— 编号领起,⛔图标堆砌,照 review#1)/
`as-certstrip+as-certbadge`(slim 药丸认证条,.about-certstrip 浅色版;**只承载公司级合规能力,
不承载产品级证书**)/ `as-checklist`。

## 照片留档

见 [docs/photo-log.md](docs/photo-log.md) —— 每张:来源 URL、许可、用途、焦点值。
制造/质量类主张**绝不用概念摄影**撑(wanew About v8 纪律);当前五张全部用于
场景氛围,不背书任何工厂/认证事实。
