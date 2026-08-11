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

## 对比度实测(2026-08-11,WCAG 2.x,脚本算值)

| 前景 | 白底 #fff | tile #f4f5f7 |
|---|---|---|
| `--as-ink #101418`(标题) | 18.50 | 16.96 |
| `--as-ink2 #4d5762`(正文) | **7.35** | 6.74 |
| `--as-accent #0c7a6b`(眉题/链接/箭头) | **5.23** | **4.80** |
| 白字 on 主按钮 `#101418` | 18.50 | — |
| 白字 on 按钮 hover `#2a323c` | 12.96 | — |

⚠️ 每个前景取**最不利背景**读数(wanew §8.15):accent 的判定值是 4.80(tile 面),不是 5.23。

## 新组件登记(首页样板)

`as-header / as-hero(__wash/__eyebrow) / as-chips / as-pcard+as-stage / as-form-tile /
as-scene / as-panelcard / as-cap / as-cta / as-footer / as-btn(--primary/--ghost) /
as-link-arrow / as-eyebrow / as-sechead / [data-as-reveal]` —— 全部只在 `light.css` 定义,
禁止页面内联样式发明第二种写法。新组件/新令牌照本文件头部规则:**同 commit 登记**。

## 照片留档

见 [docs/photo-log.md](docs/photo-log.md) —— 每张:来源 URL、许可、用途、焦点值。
制造/质量类主张**绝不用概念摄影**撑(wanew About v8 纪律);当前五张全部用于
场景氛围,不背书任何工厂/认证事实。
