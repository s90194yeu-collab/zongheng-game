# 日系動漫角色素材與授權

人物臉部、原始身形、臉部貼圖與分層頭髮，改作自 VRoid Studio 歷史 beta 範例 **Sakurada Fumiriya** 與 **Sendagaya Shino**。這兩個歷史版本標示 CC0；此說明不適用於其他 VRoid 素材或新版預設人物。

官方授權說明：

- https://vroid.pixiv.help/hc/en-us/articles/360014788554-Sakurada-Fumiriya
- https://vroid.pixiv.help/hc/en-us/articles/360013482714-Sendagaya-Shino
- https://vroid.pixiv.help/hc/en-us/articles/4402614652569-Do-VRoid-Studio-s-sample-models-come-with-conditions-of-use

固定來源版本、下載位置、SHA-256、內嵌 CC0 資訊見 `source/sources.json`。`fetch_sources.py` 重新取得相同原始資料並核對雜湊。原始大型模型不重複放入版本庫。

本專案以 Blender 4.5 LTS 調整頭身比例、建立漢風書院服／行旅服／輕甲、玉飾、短披肩、背包、靴筒、綁定與四段動作；瀏覽器加入分階陰影、輪廓與眼瞼變形。這是授權素材改作，並非完全原創或專屬的人體與髮型網格。

`images/` 是使用內建 ImageGen 產生的原創造型參考，提示詞記錄於 `prompts.json`。設定圖用於美術方向；實際 3D 模型在 Blender 建立與調整，並非將圖片自動轉成等同細節的模型。`model-*.png` 為實際模型的 Blender 渲染圖。

修改 `create_anime.py` 後，先執行 `fetch_sources.py`，再分別以 Blender 執行男女模型建置。輸出完成後執行 `prepare_blend.py`，整理可編輯檔案的衣裝集合。`render_anime.py` 可獨立輸出實際模型預覽。
