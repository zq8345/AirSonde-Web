# Hero image prompts — Solutions & Guides

写给 codex 生成用。两张都按站上现有 hero 的规格与视觉语言来：**1672×941 起步
（越大越好，2400×1350 最佳）、横构图、明亮日光、真实摄影质感（不是插画/3D 玩具
风）、左侧留出大片安静区域给我们的标题文字**。

## 站上已成立的视觉语言（三张已用的图共同点，务必延续）

- 明亮、干净、低饱和的现代空间；自然光为主，无强烈色偏
- 浅色墙面 / 浅木 / 白灰地面；绿植点缀
- 品牌绿 `#0C7A6B` 只出现在标识牌等小面积处，不做整体色调
- **画面左侧 35–45% 必须是安静区**（空墙、空地、虚化背景），我们的 H1 与副题
  会压在那里；主体（人物、设备、场景重点）放在右侧 55–65%
- 不要在图里烤任何英文标题、营销语、参数（我们自己的文字层会叠上去）

## 🔴 硬约束（红线，违反就不能用）

1. **不出现任何认证标志或字样**：FCC / CE / RoHS / ISO / UL / 3C / TUV 等一律不许
   出现在墙上、证书框、包装、地贴上——本站零认证主张
2. **不出现第三方品牌**：别的厂牌 logo、Starlink、任何真实公司名
3. **不出现具体数字断言**：产能牌、"15 years"、良率看板、订单量屏幕
4. 屏幕上的读数可以有（CO₂ / PM2.5 / 温湿度），但**不要出现精确的、看起来像
   官方标定的数值**（例如不要 "±1ppm accuracy" 这类字样）
5. 人物：可以有，但**不要面部特写**；侧身、半身、背身为宜（本站已记录这批图为
   AI 生成人物，非真人模特）

---

## Solutions 页 hero

**这页在讲什么**：同一套传感核心，装进不同的房间——家庭、办公室、学校、工业。
访客是想给自己市场选平台的品牌方/进口商，他们要看到"这东西装在真实空间里是
什么样"。

**提示词**：

> A bright, calm modern interior photographed in natural daylight, wide
> cinematic composition. The left 40% of the frame is an uncluttered pale
> plaster wall with soft window light falling across it — deliberately empty,
> no furniture, no signage. The right side shows a lived-in open-plan space
> that reads as several environments at once: a light-wood meeting table with
> a few chairs, a low shelf with plants, a glass partition beyond which a
> quieter room is visible. A small white indoor air quality monitor with a
> colour display sits on the table, screen facing the camera, showing simple
> CO₂ and PM2.5 readings. Neutral palette — warm white walls, pale oak, soft
> grey floor, muted green plants. Photographic realism, 35mm look, shallow but
> not extreme depth of field, no text or logos anywhere in the frame,
> no certification marks, no brand names. 2400×1350.

**焦点提示**：主体（桌面与设备）落在画面 60–75% 处，我会用 `--hero-focus` 把
375 窄屏裁到主体上。

---

## Guides 页 hero

**这页在讲什么**：写给采购与产品经理看的选型笔记——怎么定传感组合、怎么按房间
选形态、认证路线怎么排。是"工作台"气质，不是"营销"气质。

**提示词**：

> A quiet workbench scene in soft natural daylight, wide cinematic
> composition, photographic realism. The left 40% of the frame is calm empty
> surface — a pale desk top and plain wall behind it, nothing on it. On the
> right sits a working setup: two or three white indoor air quality monitors
> of different form factors placed side by side (one desktop unit with a
> colour screen, one compact square unit, one handheld), an open notebook with
> plain handwritten-looking marks (no legible words), a pencil, and a laptop
> turned slightly away so its screen is not readable. Muted, neutral palette:
> warm white, pale oak, soft grey, one small green plant. Even, diffuse light;
> gentle shadows. No text, no logos, no certification marks, no brand names,
> no numbers that read as specifications. 2400×1350.

**焦点提示**：设备组落在 60–80% 处。

---

## 交回来之后我做什么

转 WebP（放大到 2400 + 轻锐化）、响应式 srcset、控制在首屏加载档 ≤150KB；
两档实测叠字对比度 ≥4.5；photo-log 如实记为渲染/AI 生成概念图。
