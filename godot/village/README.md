# 問鼎書院 Godot 村莊試點

以 Godot 4.7.2、Compatibility 渲染器、GDScript 製作，匯出單執行緒 WebAssembly 網頁版。學生不必安裝 Godot。

## 開啟與建置

使用 Godot 開啟本目錄的 `project.godot`。`assets/` 的五個 GLB 沿用專案角色與 Blender 場景，素材授權見主專案 `art/anime/LICENSES.md`。匯入時 Godot 會產生 `.godot/`、貼圖與匯入快取，不需手動編輯。

在主專案執行 `python3 scripts/export-godot.py --godot /path/to/Godot --template /path/to/web_nothreads_release.zip`，會產生固定版本的 `public/godot/village-*/` 與 `release.json`。再執行原網站建置。一般網站 CI 使用已核對的匯出檔，不需另安裝 Godot。

可用 `Godot --headless --path godot/village --script res://test_village.gd` 執行場景測試，包含真正的物理角色移動、路徑、進館、接近展櫃、跳躍、暫停及男女換裝。

## 系統接線

Godot 在 GitHub Pages 的獨立 iframe 執行。外層沿用原 GAS 頁面，透過固定來源、視窗與每次開啟的新通道交換訊息。Godot 只收到五項外觀選擇；不接收姓名、帳號、學生資料或試算表識別資料。

選課與保存外觀由原網頁執行，保留可玩條件、學校帳號驗證與外觀修訂檢查。逛館與走動不計作課文完成或學習成績。

## 操作

點地面走動，拖曳旋轉鏡頭，滾輪／雙指縮放。方向鍵或 WASD 移動，Shift 奔跑，空白鍵跳躍，E 互動。手機使用畫面方向按鈕。六館按鈕可帶路；抵達館門後按互動進館，走近展櫃可看導讀並開啟課程。原村莊入口保留，可從體驗版切換比較。

Godot 設定 `Engine.max_fps=0`；物理仍以固定步長運算，不代表限制畫面幀率。畫面不使用動態陰影，場景美術沿用暖色水彩，角色為真實 3D 蒙皮與動畫。

## 授權

Godot 引擎依 MIT 授權使用；官方引擎與第三方元件授權文件隨網站置於 `public/godot/LICENSE.txt`、`COPYRIGHT.txt`。官方版本資訊與匯出資源雜湊保存在 `qa/godot-build.json`。
