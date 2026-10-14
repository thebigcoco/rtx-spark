# DrinkFlow AI｜RTX Spark Local AI POC

適用於十家分店地區型手搖飲店的展示系統，包含顧客點單、飲料製作、庫存與到期警示、市場洞察、AI 營運中心與 Local LLM POC。

## 線上展示

- [Demo Kit（預設首頁）](https://thebigcoco.github.io/rtx-spark/)
- [內部營運系統](https://thebigcoco.github.io/rtx-spark/internal-system.html)
- [網路點單](https://thebigcoco.github.io/rtx-spark/customer-order.html?channel=online)（逐杯甜度、冰量與加料客製）
- [現場平板點單](https://thebigcoco.github.io/rtx-spark/customer-order.html?channel=tablet)（逐杯甜度、冰量與加料客製）

## 本機預覽

```powershell
node .\serve.mjs
```

開啟 `http://127.0.0.1:4173/`。

## 發布方式

推送到 `main` 後，GitHub Actions 會把 `dist/` 發布到 GitHub Pages。
