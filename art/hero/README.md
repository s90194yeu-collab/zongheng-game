# 原創策士：三套衣裝

此資料夾包含 AI 設計參考、原始模型資料、可編輯 Blender 檔與實際模型渲染。

- `images/`：內建 ImageGen 產生的原創成年男策士三視圖、臉部和織錦參考。完整提示詞在 `prompts.json`。
- `source/`：MakeHuman／MPFB 官方 CC0 核心人體、亞洲成年男性形變、骨架與權重資料。來源固定至提交 `6ff1eb358f6c1959ced77e79e6dd2406d9a71f49`，逐檔來源及雜湊在 `sources.json`；授權在 `LICENSE.ASSETS.md`。
- `create_hero.py`：原創服裝、束髮、玉簪、衣甲、蒙皮、臉部 UV 烘焙及四段動作的 Blender 建置程式。未使用 MPFB 外掛程式碼。
- `hero-scholar.blend`：精緻版可編輯來源。集合 `00` 保持開啟，集合 `01`～`03` 每次開啟一套衣裝。預設書院服，動作可在 Action Editor 切換 `Idle`、`Walk`、`Run`、`Bow`。
- `model-*.png`、`motion-*.png`：實際模型渲染，與 AI 設計圖分開保存。
- `../../public/models/hero-scholar.glb` 與 `hero-scholar-mobile.glb`：精緻／輕量執行檔。

以 Blender 4.5 LTS 執行（先建立輸出資料夾）：

```sh
blender --background --factory-startup --python-exit-code 1 --python art/hero/create_hero.py -- --output public/models/hero-scholar.glb --low public/models/hero-scholar-mobile.glb --blend art/hero/hero-scholar.blend --report art/hero/model-report.json
blender --background --factory-startup --python-exit-code 1 --python art/hero/render_hero.py
blender --background --factory-startup --python-exit-code 1 --python art/hero/prepare_blend.py
```

圖片是造型與材質參考，沒有呼叫外部付費圖片轉 3D 服務。人體採現有可合法再利用的解剖網格，服裝、髮型、裝飾與動畫由建置程式建立。首版固定成年男性和束髮；可切三套衣裝、八種衣色、六種髮色和四種膚色。新樣式尚未提供換臉、女性體型或其他髮型與配件；原有紙娃娃選項繼續保留。
