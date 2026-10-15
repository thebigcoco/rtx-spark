const reportState={sales:[],inventory:[],receiving:[],meta:{}};
const reportUrls={
  sales:'demo-data/sales-report-2026-10.csv',
  inventory:'demo-data/inventory-report-2026-10-15.csv',
  receiving:'demo-data/receiving-report-2026-10.csv'
};
const requiredHeaders={
  sales:['report_date','branch','product','order_count','cups','net_sales','avg_wait_minutes'],
  inventory:['as_of_date','branch','ingredient','batch','quantity','safety_stock','expiry_date','supplier'],
  receiving:['receipt_date','receipt_id','branch','supplier','ordered_qty','received_qty','expiry_days_at_receipt','minimum_expiry_days','quality_status','status']
};
const numericFields=new Set(['order_count','cups','unit_price','gross_sales','discount','refund','net_sales','avg_wait_minutes','quantity','safety_stock','unit_cost','ordered_qty','received_qty','expiry_days_at_receipt','minimum_expiry_days']);
const branchOrder=['站前店','市場店','學府店','商辦店','社區店','夜市店','百貨店','醫院店','科技園區店','河岸店'];
const money=new Intl.NumberFormat('zh-TW',{style:'currency',currency:'TWD',maximumFractionDigits:0});
const number=new Intl.NumberFormat('zh-TW',{maximumFractionDigits:1});
const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];

function showToast(message){const toast=$('#toast');toast.textContent=message;toast.classList.add('show');clearTimeout(window.reportToastTimer);window.reportToastTimer=setTimeout(()=>toast.classList.remove('show'),2600)}
function sum(rows,key){return rows.reduce((total,row)=>total+(Number(row[key])||0),0)}
function group(rows,key){return rows.reduce((map,row)=>{const value=row[key]||'未分類';(map[value]??=[]).push(row);return map},{})}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function formatDate(dateText){if(!dateText)return'—';const date=new Date(`${dateText}T00:00:00`);return Number.isNaN(date.getTime())?dateText:`${date.getMonth()+1}/${date.getDate()}`}
function daysBetween(from,to){const start=new Date(`${from}T00:00:00`),end=new Date(`${to}T00:00:00`);return Math.ceil((end-start)/86400000)}

function parseCsv(text){
  const rows=[];let row=[],field='',quoted=false;
  const source=text.replace(/^\uFEFF/,'');
  for(let i=0;i<source.length;i+=1){
    const char=source[i],next=source[i+1];
    if(char==='"'&&quoted&&next==='"'){field+='"';i+=1}
    else if(char==='"'){quoted=!quoted}
    else if(char===','&&!quoted){row.push(field);field=''}
    else if((char==='\n'||char==='\r')&&!quoted){if(char==='\r'&&next==='\n')i+=1;row.push(field);if(row.some(cell=>cell!==''))rows.push(row);row=[];field=''}
    else field+=char;
  }
  row.push(field);if(row.some(cell=>cell!==''))rows.push(row);
  if(rows.length<2)throw new Error('CSV 沒有資料列');
  const headers=rows[0].map(value=>value.trim());
  return{headers,records:rows.slice(1).map(values=>Object.fromEntries(headers.map((header,index)=>[header,numericFields.has(header)?Number(values[index]||0):(values[index]??'').trim()]))) };
}

function detectReport(headers){
  return Object.entries(requiredHeaders).find(([,required])=>required.every(header=>headers.includes(header)))?.[0]||null;
}

function updateReport(type,records,fileName){
  reportState[type]=records;
  reportState.meta[type]={fileName,rows:records.length,loadedAt:new Date()};
}

async function loadSamples(){
  $('#importMessage').classList.remove('error');
  $('#importMessage').textContent='正在載入三份示範報表。';
  try{
    const entries=await Promise.all(Object.entries(reportUrls).map(async([type,url])=>{
      const response=await fetch(`${url}?v=20261015-1`,{cache:'no-store'});if(!response.ok)throw new Error(`${url} 載入失敗`);
      const parsed=parseCsv(await response.text());return[type,parsed.records,url.split('/').pop()];
    }));
    entries.forEach(([type,records,fileName])=>updateReport(type,records,fileName));
    recomputeAndRender('示範報表已載入');
  }catch(error){
    $('#importMessage').classList.add('error');$('#importMessage').textContent=`示範報表載入失敗：${error.message}`;
  }
}

function salesModel(rows=reportState.sales){
  const dates=rows.map(row=>row.report_date).filter(Boolean).sort();
  const orders=sum(rows,'order_count'),cups=sum(rows,'cups'),net=sum(rows,'net_sales');
  const waitWeight=rows.reduce((total,row)=>total+(row.avg_wait_minutes||0)*(row.order_count||0),0);
  const branchGroups=group(rows,'branch');
  const branches=Object.entries(branchGroups).map(([name,items])=>{
    const productGroups=group(items,'product');
    const topProduct=Object.entries(productGroups).map(([product,records])=>({product,cups:sum(records,'cups')})).sort((a,b)=>b.cups-a.cups)[0];
    const branchOrders=sum(items,'order_count');
    return{name,orders:branchOrders,cups:sum(items,'cups'),net:sum(items,'net_sales'),wait:branchOrders?items.reduce((total,row)=>total+row.avg_wait_minutes*row.order_count,0)/branchOrders:0,topProduct:topProduct?.product||'—'};
  }).sort((a,b)=>branchOrder.indexOf(a.name)-branchOrder.indexOf(b.name));
  const products=Object.entries(group(rows,'product')).map(([name,items])=>({name,cups:sum(items,'cups'),net:sum(items,'net_sales')})).sort((a,b)=>b.cups-a.cups);
  const combos=Object.entries(rows.reduce((map,row)=>{const key=`${row.tea_base||'無茶底'}＋${row.topping||'無加料'}`;(map[key]??=[]).push(row);return map},{})).map(([name,items])=>({name,cups:sum(items,'cups'),net:sum(items,'net_sales')})).sort((a,b)=>b.cups-a.cups);
  const channels=Object.entries(group(rows,'channel')).map(([name,items])=>({name,cups:sum(items,'cups')})).sort((a,b)=>b.cups-a.cups);
  const hotCups=sum(rows.filter(row=>row.temperature==='熱飲'||row.temperature==='溫飲'),'cups');
  return{from:dates[0],to:dates.at(-1),orders,cups,net,wait:orders?waitWeight/orders:0,branches,products,combos,channels,hotShare:cups?hotCups/cups:0};
}

function inventoryModel(rows=reportState.inventory){
  const asOf=rows.map(row=>row.as_of_date).filter(Boolean).sort().at(-1)||'';
  const enriched=rows.map(row=>({...row,daysToExpiry:daysBetween(asOf,row.expiry_date),stockRatio:row.safety_stock?row.quantity/row.safety_stock:0,value:row.quantity*row.unit_cost}));
  const issues=enriched.filter(row=>row.quantity<row.safety_stock||row.daysToExpiry<=3).sort((a,b)=>Math.min(a.stockRatio,a.daysToExpiry/3)-Math.min(b.stockRatio,b.daysToExpiry/3));
  return{asOf,rows:enriched,low:enriched.filter(row=>row.quantity<row.safety_stock),expiring:enriched.filter(row=>row.daysToExpiry<=3),issues,value:enriched.reduce((total,row)=>total+row.value,0)};
}

function receivingModel(rows=reportState.receiving){
  const enriched=rows.map(row=>({...row,issue:row.received_qty<row.ordered_qty||row.expiry_days_at_receipt<row.minimum_expiry_days||row.quality_status!=='正常'||row.status==='異常'}));
  const suppliers=Object.entries(group(enriched,'supplier')).map(([name,items])=>{const issues=items.filter(row=>row.issue);return{name,total:items.length,issues:issues.length,short:issues.filter(row=>row.received_qty<row.ordered_qty).length,expiry:issues.filter(row=>row.expiry_days_at_receipt<row.minimum_expiry_days).length,quality:issues.filter(row=>row.quality_status!=='正常').length,rate:items.length?issues.length/items.length:0}}).sort((a,b)=>b.rate-a.rate||b.issues-a.issues);
  return{rows:enriched,issues:enriched.filter(row=>row.issue),suppliers};
}

function currentModel(){return{sales:salesModel(),inventory:inventoryModel(),receiving:receivingModel()}}

function renderStatus(model,message){
  const labels={sales:'銷售',inventory:'庫存',receiving:'到貨驗收'};
  Object.keys(labels).forEach(type=>{
    const card=$(`[data-report-status="${type}"]`),meta=reportState.meta[type];
    card.classList.toggle('loaded',Boolean(meta));card.querySelector('strong').textContent=meta?`${number.format(meta.rows)} 列・${meta.fileName}`:'尚未匯入';
  });
  const loaded=Object.keys(requiredHeaders).filter(type=>reportState[type].length).length;
  $('#importStatusTitle').textContent=loaded===3?'三份報表已載入':`已載入 ${loaded}/3 份報表`;
  $('#lastUpdated').textContent=`更新：${new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',hour12:false})}`;
  $('#importMessage').classList.remove('error');$('#importMessage').textContent=message;
  $('#dataCompleteness').textContent=loaded===3?'資料完整':'資料不完整';
  $('#reportPeriod').textContent=model.sales.from?`${model.sales.from} 至 ${model.sales.to}`:'尚無銷售期間';
}

function renderOverview(model){
  const {sales,inventory,receiving}=model;
  $('#kpiSales').textContent=money.format(sales.net);$('#kpiOrders').textContent=number.format(sales.orders);$('#kpiCups').textContent=number.format(sales.cups);$('#kpiWait').textContent=number.format(sales.wait);$('#kpiLowStock').textContent=number.format(inventory.low.length);$('#kpiExpiry').textContent=number.format(inventory.expiring.length);
  const maxNet=Math.max(...sales.branches.map(branch=>branch.net),1);
  $('#branchBars').innerHTML=sales.branches.map(branch=>`<div class="bar-row"><span>${escapeHtml(branch.name)}</span><div class="bar-track"><i style="width:${Math.max(4,branch.net/maxNet*100).toFixed(1)}%"></i></div><b>${money.format(branch.net)}・${number.format(branch.cups)} 杯</b></div>`).join('')||'<p>尚無銷售資料</p>';
  const longest=[...sales.branches].sort((a,b)=>b.wait-a.wait)[0],topSupplier=receiving.suppliers[0];
  const attentions=[];
  if(longest&&longest.wait>=8)attentions.push({title:`${longest.name}平均等待 ${longest.wait.toFixed(1)} 分鐘`,detail:`高於 8 分鐘目標，報表期間共 ${number.format(longest.orders)} 筆訂單。`});
  if(inventory.low.length)attentions.push({title:`${inventory.low.length} 批低於安全庫存`,detail:`最優先：${inventory.issues[0]?.branch||'—'} ${inventory.issues[0]?.ingredient||'—'}。`});
  if(inventory.expiring.length)attentions.push({title:`${inventory.expiring.length} 批在 3 日內到期`,detail:`需安排優先使用、調撥或報廢確認。`});
  if(topSupplier?.issues)attentions.push({title:`${topSupplier.name}到貨異常率 ${(topSupplier.rate*100).toFixed(1)}%`,detail:`${topSupplier.issues} 批異常，含短缺 ${topSupplier.short}、效期 ${topSupplier.expiry}、品質 ${topSupplier.quality}。`});
  $('#attentionCount').textContent=`${attentions.length} 項`;
  $('#attentionList').innerHTML=attentions.map((item,index)=>`<div class="attention-item"><span>${index+1}</span><div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></div></div>`).join('')||'<p>目前沒有需要處理的項目。</p>';
}

function populateBranchFilters(){
  const branches=[...new Set([...reportState.sales.map(row=>row.branch),...reportState.inventory.map(row=>row.branch)])].sort((a,b)=>branchOrder.indexOf(a)-branchOrder.indexOf(b));
  ['#salesBranchFilter','#inventoryBranchFilter'].forEach(selector=>{const select=$(selector),current=select.value;select.innerHTML='<option value="all">全部分店</option>'+branches.map(branch=>`<option value="${escapeHtml(branch)}">${escapeHtml(branch)}</option>`).join('');select.value=branches.includes(current)?current:'all'});
}

function renderSales(){
  const branch=$('#salesBranchFilter').value,rows=branch==='all'?reportState.sales:reportState.sales.filter(row=>row.branch===branch),sales=salesModel(rows);
  $('#salesSummary').innerHTML=[['實收營業額',money.format(sales.net)],['訂單',`${number.format(sales.orders)} 筆`],['杯數',`${number.format(sales.cups)} 杯`],['平均等待',`${number.format(sales.wait)} 分鐘`]].map(([label,value])=>`<article><small>${label}</small><strong>${value}</strong></article>`).join('');
  $('#productRanking').innerHTML=sales.products.slice(0,6).map((item,index)=>`<div class="rank-row"><span>${index+1}</span><div><strong>${escapeHtml(item.name)}</strong><small>${money.format(item.net)}</small></div><b>${number.format(item.cups)} 杯</b></div>`).join('')||'<p>尚無銷售資料</p>';
  $('#comboRanking').innerHTML=sales.combos.slice(0,6).map((item,index)=>`<div class="rank-row"><span>${index+1}</span><div><strong>${escapeHtml(item.name)}</strong><small>占篩選杯數 ${sales.cups?(item.cups/sales.cups*100).toFixed(1):0}%</small></div><b>${number.format(item.cups)} 杯</b></div>`).join('')||'<p>尚無組合資料</p>';
  const all=salesModel(reportState.sales);
  $('#branchSalesRows').innerHTML=all.branches.map(item=>`<tr><td><strong>${escapeHtml(item.name)}</strong></td><td>${number.format(item.orders)}</td><td>${number.format(item.cups)}</td><td>${money.format(item.net)}</td><td>${item.wait.toFixed(1)} 分</td><td>${escapeHtml(item.topProduct)}</td></tr>`).join('');
}

function issueStatus(row){if(row.daysToExpiry<=0)return['今日到期','danger'];if(row.daysToExpiry<=3)return[`${row.daysToExpiry} 日內到期`,'warn'];if(row.quantity<row.safety_stock)return['低庫存','warn'];return['正常','ok']}
function renderInventory(model){
  const branch=$('#inventoryBranchFilter').value,rows=branch==='all'?model.inventory.rows:model.inventory.rows.filter(row=>row.branch===branch),inventory=inventoryModel(rows),receivingRows=branch==='all'?reportState.receiving:reportState.receiving.filter(row=>row.branch===branch),receiving=receivingModel(receivingRows);
  $('#inventorySummary').innerHTML=[['庫存金額',money.format(inventory.value)],['低於安全水位',`${inventory.low.length} 批`],['3 日內到期',`${inventory.expiring.length} 批`],['到貨異常',`${receiving.issues.length} 批`]].map(([label,value])=>`<article><small>${label}</small><strong>${value}</strong></article>`).join('');
  $('#inventoryRows').innerHTML=inventory.issues.slice(0,40).map(row=>{const status=issueStatus(row);return`<tr><td>${escapeHtml(row.branch)}</td><td><strong>${escapeHtml(row.ingredient)}</strong></td><td>${escapeHtml(row.batch)}</td><td>${number.format(row.quantity)} ${escapeHtml(row.unit)}</td><td>${number.format(row.safety_stock)} ${escapeHtml(row.unit)}</td><td>${formatDate(row.expiry_date)}</td><td><span class="status ${status[1]}">${status[0]}</span></td></tr>`}).join('')||'<tr><td colspan="7">目前沒有庫存警示。</td></tr>';
  $('#supplierRanking').innerHTML=receiving.suppliers.map((item,index)=>`<div class="rank-row"><span>${index+1}</span><div><strong>${escapeHtml(item.name)}</strong><small>異常 ${item.issues}/${item.total} 批・短缺 ${item.short}・效期 ${item.expiry}・品質 ${item.quality}</small></div><b>${(item.rate*100).toFixed(1)}%</b></div>`).join('')||'<p>尚無到貨驗收資料</p>';
}

function buildAnalysis(model){
  const {sales,inventory,receiving}=model,topBranch=[...sales.branches].sort((a,b)=>b.net-a.net)[0],topProduct=sales.products[0],topCombo=sales.combos[0],topSupplier=receiving.suppliers[0],topLow=inventory.low.sort((a,b)=>a.stockRatio-b.stockRatio)[0],longest=[...sales.branches].sort((a,b)=>b.wait-a.wait)[0];
  return[
    {tag:'銷售',title:topBranch?`${topBranch.name}營業額最高`:'缺少銷售資料',evidence:topBranch?`${money.format(topBranch.net)}，售出 ${number.format(topBranch.cups)} 杯；${topProduct?.name||'—'}為全店銷量第一。`:'請匯入銷售報表。',action:topBranch?`先比對${topBranch.name}的通路與品項組合，作為其他分店測試基準。`:'等待資料',source:'銷售報表'},
    {tag:'製作',title:longest?`${longest.name}平均等待最久`:'缺少等待資料',evidence:longest?`平均 ${longest.wait.toFixed(1)} 分鐘，共 ${number.format(longest.orders)} 筆訂單。`:'請匯入銷售報表。',action:longest&&longest.wait>=8?'檢查尖峰時段、熱飲比例與製作人力。':'目前在 8 分鐘目標內。',source:'銷售報表'},
    {tag:'庫存',title:topLow?`${topLow.branch}${topLow.ingredient}低於安全水位`:'目前無低庫存',evidence:topLow?`現有 ${number.format(topLow.quantity)} ${topLow.unit}，安全水位 ${number.format(topLow.safety_stock)} ${topLow.unit}。`:`庫存報表共 ${inventory.rows.length} 批。`,action:topLow?'先確認跨店調撥，再決定是否採購。':'維持目前補貨規則。',source:'庫存報表'},
    {tag:'到貨',title:topSupplier?`${topSupplier.name}異常率 ${(topSupplier.rate*100).toFixed(1)}%`:'缺少到貨資料',evidence:topSupplier?`${topSupplier.issues}/${topSupplier.total} 批異常；短缺 ${topSupplier.short}、效期 ${topSupplier.expiry}、品質 ${topSupplier.quality}。`:'請匯入到貨驗收報表。',action:topSupplier?.issues?'抽查異常入庫單，確認補送與效期驗收紀錄。':'目前無供應商異常。',source:'到貨驗收'},
    {tag:'商品',title:topCombo?`${topCombo.name}為主要組合`:'缺少組合資料',evidence:topCombo?`${number.format(topCombo.cups)} 杯，占報表杯數 ${(topCombo.cups/Math.max(sales.cups,1)*100).toFixed(1)}%；溫熱飲占 ${(sales.hotShare*100).toFixed(1)}%。`:'請匯入銷售報表。',action:sales.hotShare>=.2?'熱飲占比達 20%，檢查乳品與薑汁庫存。':'先維持冷飲備料，持續觀察氣溫變化。',source:'銷售報表＋庫存報表'}
  ];
}

function renderAnalysis(model){
  const analyses=buildAnalysis(model);
  $('#analysisCards').innerHTML=analyses.map(item=>`<article class="analysis-card"><span>${escapeHtml(item.tag)}</span><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.evidence)}</p><dl><dt>處理建議</dt><dd>${escapeHtml(item.action)}</dd><dt>資料來源</dt><dd>${escapeHtml(item.source)}</dd></dl></article>`).join('');
  $('#analysisSources').innerHTML=Object.entries(reportState.meta).map(([type,meta])=>`<div class="source-chip"><strong>${escapeHtml(meta.fileName)}</strong><small>${number.format(meta.rows)} 列・${type==='sales'?'銷售':type==='inventory'?'庫存':'到貨驗收'}</small></div>`).join('');
  $('#analysisStamp').textContent=`重新分析：${new Date().toLocaleTimeString('zh-TW',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false})}`;
}

function recomputeAndRender(message){
  const model=currentModel();populateBranchFilters();renderStatus(model,message);renderOverview(model);renderSales();renderInventory(model);renderAnalysis(model);
}

async function importFiles(files){
  if(!files.length)throw new Error('請先選擇 CSV 檔案');
  const imported=[];
  for(const file of files){
    const parsed=parseCsv(await file.text()),type=detectReport(parsed.headers);
    if(!type)throw new Error(`${file.name} 欄位不符合銷售、庫存或到貨驗收格式`);
    updateReport(type,parsed.records,file.name);imported.push(`${type==='sales'?'銷售':type==='inventory'?'庫存':'到貨驗收'} ${number.format(parsed.records.length)} 列`);
  }
  recomputeAndRender(`已匯入：${imported.join('、')}。所有數字與分析已重新計算。`);
}

$$('[data-view-button]').forEach(button=>button.addEventListener('click',()=>{$$('[data-view-button]').forEach(item=>item.classList.toggle('active',item===button));$$('[data-view]').forEach(view=>view.classList.toggle('active',view.dataset.view===button.dataset.viewButton));window.scrollTo({top:0,behavior:'smooth'})}));
$('#salesBranchFilter').addEventListener('change',renderSales);
$('#inventoryBranchFilter').addEventListener('change',()=>renderInventory(currentModel()));
$('#reloadSample').addEventListener('click',()=>{loadSamples();showToast('正在重載示範報表')});
$('#openImport').addEventListener('click',()=>{$('#dialogReportFiles').value='';$('#selectedFiles').textContent='尚未選擇檔案';$('#importDialog').showModal()});
$('#dialogReportFiles').addEventListener('change',event=>{$('#selectedFiles').textContent=event.target.files.length?[...event.target.files].map(file=>file.name).join('、'):'尚未選擇檔案'});
$('#confirmImport').addEventListener('click',async()=>{try{await importFiles([...$('#dialogReportFiles').files]);$('#importDialog').close();showToast('報表已匯入，頁面與 AI 分析已更新')}catch(error){showToast(error.message);$('#selectedFiles').textContent=`匯入失敗：${error.message}`}});

loadSamples();
