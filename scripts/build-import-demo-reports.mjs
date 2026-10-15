import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const repoRoot = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(repoRoot, "dist", "demo-data");
const previewDir = path.join(repoRoot, ".artifact-preview");
const fontFamily = "Arial";

const branches = [
  "站前店", "市場店", "學府店", "商辦店", "社區店",
  "夜市店", "百貨店", "醫院店", "科技園區店", "河岸店",
];

const products = [
  { name: "四季春青茶", category: "純茶", teaBase: "四季春", topping: "無加料", temperature: "冷飲", price: 45 },
  { name: "桂花烏龍", category: "純茶", teaBase: "烏龍", topping: "無加料", temperature: "冷飲", price: 65 },
  { name: "珍珠奶茶", category: "奶茶", teaBase: "紅茶", topping: "珍珠", temperature: "冷飲", price: 70 },
  { name: "焙茶燕麥拿鐵", category: "茶拿鐵", teaBase: "焙茶", topping: "燕麥奶", temperature: "溫飲", price: 85 },
  { name: "白桃青茶", category: "果茶", teaBase: "青茶", topping: "椰果", temperature: "冷飲", price: 75 },
  { name: "黑糖薑奶", category: "熱飲", teaBase: "無茶底", topping: "珍珠", temperature: "熱飲", price: 80 },
  { name: "柚香四季春", category: "果茶", teaBase: "四季春", topping: "蘆薈", temperature: "冷飲", price: 75 },
  { name: "燕麥可可脆脆", category: "特調", teaBase: "可可", topping: "脆片", temperature: "冷飲", price: 90 },
  { name: "檸檬青茶", category: "果茶", teaBase: "青茶", topping: "愛玉", temperature: "冷飲", price: 70 },
  { name: "蜜香紅茶拿鐵", category: "茶拿鐵", teaBase: "紅茶", topping: "布丁", temperature: "溫飲", price: 80 },
];

const suppliers = {
  "珍珠": "Q 彈配料", "椰果": "Q 彈配料", "蘆薈": "Q 彈配料", "愛玉": "Q 彈配料", "布丁": "Q 彈配料",
  "鮮奶": "牧場直送", "燕麥奶": "牧場直送",
  "四季春茶葉": "山嶺茶業", "烏龍茶葉": "山嶺茶業", "紅茶茶葉": "山嶺茶業", "青茶茶葉": "山嶺茶業",
  "檸檬": "鮮果聯盟", "白桃果露": "果香食品", "黑糖薑汁": "島嶼糖業",
};

const ingredients = [
  { name: "珍珠", category: "加料", unit: "公斤", safety: 8, cost: 95, days: 5 },
  { name: "椰果", category: "加料", unit: "公斤", safety: 6, cost: 88, days: 18 },
  { name: "蘆薈", category: "加料", unit: "公斤", safety: 5, cost: 105, days: 12 },
  { name: "愛玉", category: "加料", unit: "盒", safety: 12, cost: 42, days: 7 },
  { name: "布丁", category: "加料", unit: "盒", safety: 18, cost: 28, days: 8 },
  { name: "鮮奶", category: "乳品", unit: "瓶", safety: 24, cost: 82, days: 4 },
  { name: "燕麥奶", category: "乳品", unit: "瓶", safety: 12, cost: 98, days: 16 },
  { name: "四季春茶葉", category: "茶葉", unit: "公斤", safety: 5, cost: 520, days: 90 },
  { name: "烏龍茶葉", category: "茶葉", unit: "公斤", safety: 5, cost: 560, days: 90 },
  { name: "紅茶茶葉", category: "茶葉", unit: "公斤", safety: 5, cost: 480, days: 90 },
  { name: "青茶茶葉", category: "茶葉", unit: "公斤", safety: 5, cost: 500, days: 90 },
  { name: "檸檬", category: "水果", unit: "顆", safety: 30, cost: 12, days: 6 },
  { name: "白桃果露", category: "果露", unit: "公斤", safety: 4, cost: 240, days: 30 },
  { name: "黑糖薑汁", category: "糖漿", unit: "公斤", safety: 4, cost: 220, days: 25 },
];

const isoDate = (year, month, day) => `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
const round1 = value => Math.round(value * 10) / 10;

const salesRows = [];
for (let day = 1; day <= 15; day += 1) {
  branches.forEach((branch, branchIndex) => {
    products.forEach((product, productIndex) => {
      const weekendFactor = [4, 5, 11, 12].includes(day) ? 1.14 : 1;
      const branchFactor = 0.86 + branchIndex * 0.035;
      const productFactor = 0.82 + ((productIndex * 7 + branchIndex * 3) % 9) * 0.055;
      const cups = Math.max(4, Math.round((8 + ((day * 5 + branchIndex * 7 + productIndex * 11) % 18)) * weekendFactor * branchFactor * productFactor));
      const orderCount = Math.max(3, Math.round(cups / (1.05 + ((branchIndex + productIndex) % 4) * 0.08)));
      const grossSales = cups * product.price;
      const discount = ((day + branchIndex + productIndex) % 5 === 0) ? Math.round(grossSales * 0.05) : 0;
      const refund = ((day * 3 + branchIndex + productIndex) % 37 === 0) ? product.price : 0;
      const channel = ["現場平板", "網路點單", "POS 櫃台"][(day + branchIndex + productIndex) % 3];
      const wait = round1(4.2 + ((day + branchIndex * 2 + productIndex) % 9) * 0.45 + (branch === "夜市店" ? 1.5 : 0));
      salesRows.push([
        isoDate(2026, 10, day), branch, channel, product.name, product.category,
        product.teaBase, product.topping, product.temperature, orderCount, cups,
        product.price, grossSales, discount, refund, grossSales - discount - refund, wait,
      ]);
    });
  });
}

const inventoryRows = [];
branches.forEach((branch, branchIndex) => {
  ingredients.forEach((ingredient, ingredientIndex) => {
    const quantityBase = ingredient.safety * (0.55 + ((branchIndex * 5 + ingredientIndex * 3) % 15) / 10);
    const quantity = round1(quantityBase);
    let daysToExpiry = ingredient.days - ((branchIndex * 2 + ingredientIndex * 3) % Math.max(3, Math.floor(ingredient.days / 2)));
    if (branch === "站前店" && ingredient.name === "鮮奶") daysToExpiry = 0;
    if (branch === "學府店" && ingredient.name === "燕麥奶") daysToExpiry = 3;
    if (branch === "市場店" && ingredient.name === "白桃果露") daysToExpiry = 2;
    const expiry = new Date(Date.UTC(2026, 9, 15 + daysToExpiry));
    const expiryIso = expiry.toISOString().slice(0, 10);
    inventoryRows.push([
      "2026-10-15", branch, ingredient.name, ingredient.category,
      `${ingredient.name.slice(0, 2).toUpperCase()}-${String(branchIndex + 1).padStart(2, "0")}${String(ingredientIndex + 1).padStart(2, "0")}`,
      quantity, ingredient.unit, ingredient.safety, ingredient.cost, expiryIso, suppliers[ingredient.name] || "其他供應商",
    ]);
  });
});

const receivingRows = [];
let receiptNumber = 1001;
for (let day = 1; day <= 15; day += 1) {
  branches.forEach((branch, branchIndex) => {
    const ingredient = ingredients[(day * 3 + branchIndex * 2) % ingredients.length];
    const ordered = Math.max(6, Math.round(ingredient.safety * 1.6));
    const shortFlag = (day + branchIndex) % 11 === 0;
    const expiryFlag = (day * 2 + branchIndex) % 13 === 0;
    const qualityFlag = (day + branchIndex * 3) % 29 === 0;
    const received = shortFlag ? ordered - 2 : ordered;
    const expiryDays = expiryFlag ? 3 : Math.max(7, Math.min(60, ingredient.days));
    const minDays = ingredient.category === "乳品" ? 5 : ingredient.category === "水果" ? 4 : 7;
    const status = shortFlag || expiryDays < minDays || qualityFlag ? "異常" : "完成";
    receivingRows.push([
      isoDate(2026, 10, day), `RC-${receiptNumber++}`, branch, suppliers[ingredient.name] || "其他供應商", ingredient.name,
      ordered, received, ingredient.unit, expiryDays, minDays, qualityFlag ? "包裝破損" : "正常", status,
    ]);
  });
}

const headers = {
  sales: ["report_date", "branch", "channel", "product", "category", "tea_base", "topping", "temperature", "order_count", "cups", "unit_price", "gross_sales", "discount", "refund", "net_sales", "avg_wait_minutes"],
  inventory: ["as_of_date", "branch", "ingredient", "category", "batch", "quantity", "unit", "safety_stock", "unit_cost", "expiry_date", "supplier"],
  receiving: ["receipt_date", "receipt_id", "branch", "supplier", "ingredient", "ordered_qty", "received_qty", "unit", "expiry_days_at_receipt", "minimum_expiry_days", "quality_status", "status"],
};

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function toCsv(header, rows) {
  return `\uFEFF${[header, ...rows].map(row => row.map(csvEscape).join(",")).join("\r\n")}`;
}

function writeTableSheet(workbook, name, title, note, header, rows, tableName, widths) {
  const sheet = workbook.worksheets.add(name);
  sheet.showGridLines = false;
  sheet.getRange("A1:P1").format.font = { name: fontFamily, size: 11 };
  sheet.getRange("A2:P2").format.font = { name: fontFamily, size: 11 };
  sheet.getRange("A1").values = [[title]];
  sheet.getRange("A1").format.font = { name: fontFamily, size: 15, bold: true, color: "#173F35" };
  sheet.getRange("A2").values = [[note]];
  sheet.getRange("A2").format.font = { name: fontFamily, size: 10, italic: true, color: "#52665F" };
  const matrix = [header, ...rows];
  sheet.getRange("A4").write(matrix);
  const lastCol = String.fromCharCode(64 + header.length);
  const table = sheet.tables.add(`A4:${lastCol}${rows.length + 4}`, true, tableName);
  table.style = "TableStyleMedium4";
  sheet.getRange(`A4:${lastCol}4`).format = {
    fill: "#173F35",
    font: { name: fontFamily, size: 10, bold: true, color: "#FFFFFF" },
    verticalAlignment: "center",
  };
  sheet.getRange(`A5:${lastCol}${rows.length + 4}`).format.font = { name: fontFamily, size: 10, color: "#23322E" };
  sheet.getRange(`A4:${lastCol}${rows.length + 4}`).format.verticalAlignment = "center";
  widths.forEach((width, index) => sheet.getRangeByIndexes(0, index, rows.length + 4, 1).format.columnWidth = width);
  sheet.freezePanes.freezeRows(4);
  return sheet;
}

await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

await Promise.all([
  fs.writeFile(path.join(outputDir, "sales-report-2026-10.csv"), toCsv(headers.sales, salesRows), "utf8"),
  fs.writeFile(path.join(outputDir, "inventory-report-2026-10-15.csv"), toCsv(headers.inventory, inventoryRows), "utf8"),
  fs.writeFile(path.join(outputDir, "receiving-report-2026-10.csv"), toCsv(headers.receiving, receivingRows), "utf8"),
]);

const workbook = Workbook.create();
const guide = workbook.worksheets.add("匯入說明");
guide.showGridLines = false;
guide.getRange("A2:F2").values = [["DrinkFlow 報表匯入試作資料", null, null, null, null, null]];
guide.getRange("A2:F2").format.font = { name: fontFamily, size: 16, bold: true, color: "#173F35" };
guide.getRange("A4:B9").values = [
  ["檔案", "用途"],
  ["銷售報表", "營收、訂單、杯數、分店、品項、茶底、加料、通路與等待時間"],
  ["庫存報表", "目前存量、安全水位、批次、效期、成本與供應商"],
  ["到貨驗收", "短缺、效期不足、品質異常與供應商異常率"],
  ["系統匯入格式", "請使用同資料夾內的三個 CSV 檔，可一次多選匯入"],
  ["資料性質", "2026 年 10 月示範資料，僅供流程測試"],
];
guide.getRange("A4:B4").format = { fill: "#173F35", font: { name: fontFamily, size: 10, bold: true, color: "#FFFFFF" } };
guide.getRange("A5:B9").format.font = { name: fontFamily, size: 10, color: "#23322E" };
guide.getRange("A4:B9").format.borders = { preset: "outside", style: "thin", color: "#CBD8D2" };
guide.getRange("A:A").format.columnWidth = 24;
guide.getRange("B:B").format.columnWidth = 76;
guide.getRange("B5:B9").format.wrapText = true;
guide.getRange("A4:B9").format.autofitRows();
guide.tabColor = "#173F35";

const salesSheet = writeTableSheet(
  workbook, "銷售報表", "銷售報表", "2026-10-01 至 2026-10-15，十家分店彙總明細", headers.sales, salesRows, "SalesReportTable",
  [14, 14, 14, 22, 12, 14, 14, 12, 12, 10, 12, 14, 12, 10, 14, 16],
);
salesSheet.getRange(`I5:O${salesRows.length + 4}`).format.numberFormat = "#,##0";
salesSheet.getRange(`P5:P${salesRows.length + 4}`).format.numberFormat = "0.0";
salesSheet.tabColor = "#2D7B68";

const inventorySheet = writeTableSheet(
  workbook, "庫存報表", "庫存報表", "資料時間：2026-10-15 09:00，包含批次與有效期限", headers.inventory, inventoryRows, "InventoryReportTable",
  [14, 14, 18, 12, 18, 12, 10, 14, 12, 16, 18],
);
inventorySheet.getRange(`F5:I${inventoryRows.length + 4}`).format.numberFormat = "#,##0.0";
inventorySheet.tabColor = "#D99536";

const receivingSheet = writeTableSheet(
  workbook, "到貨驗收", "到貨驗收報表", "2026-10-01 至 2026-10-15，包含短缺、效期與品質結果", headers.receiving, receivingRows, "ReceivingReportTable",
  [14, 16, 14, 18, 18, 14, 14, 10, 20, 20, 16, 12],
);
receivingSheet.getRange(`F5:J${receivingRows.length + 4}`).format.numberFormat = "#,##0";
receivingSheet.tabColor = "#B85C5C";

workbook.recalculate();

const inspection = await workbook.inspect({
  kind: "workbook,sheet,table",
  maxChars: 8000,
  tableMaxRows: 5,
  tableMaxCols: 8,
});
console.log(inspection.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

for (const item of [
  ["匯入說明", "A1:F12", "guide.png"],
  ["銷售報表", "A1:P22", "sales.png"],
  ["庫存報表", "A1:K22", "inventory.png"],
  ["到貨驗收", "A1:L22", "receiving.png"],
]) {
  const preview = await workbook.render({ sheetName: item[0], range: item[1], scale: 1, format: "png" });
  await fs.writeFile(path.join(previewDir, item[2]), new Uint8Array(await preview.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(outputDir, "DrinkFlow-import-sample.xlsx"));

console.log(JSON.stringify({
  salesRows: salesRows.length,
  inventoryRows: inventoryRows.length,
  receivingRows: receivingRows.length,
  outputDir,
}, null, 2));
