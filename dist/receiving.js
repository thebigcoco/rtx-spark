const receivingOrders=[
  {id:'RC-1024',supplier:'圓山茶行',branch:'站前店',eta:'09:30',arrival:'已到店',storage:'常溫',items:[{name:'桂花烏龍茶葉',unit:'公斤',ordered:12,received:12,batch:'OT-1015A',expiry:'2027-04-15',minDays:90,quality:'合格'}]},
  {id:'RC-1025',supplier:'東港農產',branch:'站前店',eta:'10:10',arrival:'已到店',storage:'冷藏',items:[{name:'百香果原汁',unit:'瓶',ordered:18,received:18,batch:'PF-1014B',expiry:'2026-11-30',minDays:21,quality:'合格'},{name:'白桃果露',unit:'瓶',ordered:12,received:12,batch:'PE-1013C',expiry:'2027-02-28',minDays:60,quality:'合格'}]},
  {id:'RC-1026',supplier:'牧場直送',branch:'站前店',eta:'11:00',arrival:'已到店',storage:'冷藏・需驗溫',items:[{name:'鮮奶',unit:'瓶',ordered:24,received:22,batch:'MK-1015C',expiry:'2026-10-18',minDays:5,quality:'合格'}]},
  {id:'RC-1027',supplier:'Q 彈配料',branch:'站前店',eta:'13:30',arrival:'運送中',storage:'常溫',items:[{name:'黑糖珍珠',unit:'包',ordered:30,received:30,batch:'',expiry:'',minDays:30,quality:'合格'},{name:'椰果',unit:'盒',ordered:18,received:18,batch:'',expiry:'',minDays:30,quality:'合格'}]}
];

const receivingRecords=[
  {id:'RC-1023',date:'10/14 16:42',branch:'站前店',supplier:'島嶼糖業',items:'黑糖 20 包',result:'無差異',approval:'已完成入庫',receiver:'陳怡君'},
  {id:'RC-1022',date:'10/14 11:18',branch:'站前店',supplier:'Q 彈配料',items:'寒天晶球 16 盒',result:'短少 2 盒',approval:'店長已核准',receiver:'王俊傑'},
  {id:'RC-1021',date:'10/13 15:06',branch:'站前店',supplier:'牧場直送',items:'燕麥奶 24 瓶',result:'無差異',approval:'已完成入庫',receiver:'林雅婷'},
  {id:'RC-1020',date:'10/13 09:35',branch:'站前店',supplier:'圓山茶行',items:'四季春茶葉 10 公斤',result:'效期不足',approval:'退貨完成',receiver:'陳怡君'}
];

let activeReceivingId='RC-1024';
const receivingBaseDate=new Date('2026-10-15T00:00:00');

function switchInventoryMode(mode){
  document.querySelectorAll('[data-inventory-mode]').forEach(button=>{const active=button.dataset.inventoryMode===mode;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active))});
  document.querySelectorAll('[data-inventory-pane]').forEach(pane=>pane.classList.toggle('active',pane.dataset.inventoryPane===mode));
}

function receiptExpiryState(item){
  if(!item.expiry)return{issue:true,label:'尚未填寫'};
  const days=Math.ceil((new Date(`${item.expiry}T00:00:00`)-receivingBaseDate)/86400000);
  if(days<item.minDays)return{issue:true,label:`剩 ${days} 天，低於收貨標準 ${item.minDays} 天`};
  return{issue:false,label:''};
}

function receiptIssues(order){
  return order.items.flatMap(item=>{
    const issues=[];
    const difference=Number(item.received)-Number(item.ordered);
    if(difference!==0)issues.push(`${item.name}${difference>0?'多收':'短少'} ${Math.abs(difference)} ${item.unit}`);
    if(item.quality!=='合格')issues.push(`${item.name}：${item.quality}`);
    const expiry=receiptExpiryState(item);if(expiry.issue)issues.push(`${item.name}：${expiry.label}`);
    if(!item.batch.trim())issues.push(`${item.name}：缺少批號`);
    return issues;
  });
}

function renderReceivingQueue(){
  const queue=document.querySelector('#receivingQueue');if(!queue)return;
  queue.innerHTML=receivingOrders.length?receivingOrders.map(order=>`<article class="receiving-card"><div><div class="receiving-card-head"><strong>${order.id}</strong><b class="${order.arrival==='運送中'?'transit':''}">${order.arrival}</b></div><p>${order.supplier}・${order.eta}</p><small>${order.items.map(item=>`${item.name} ${item.ordered} ${item.unit}`).join('、')}</small><small>${order.storage}・${order.branch}</small></div><button data-start-receiving="${order.id}" ${order.arrival==='運送中'?'disabled':''}>${order.arrival==='運送中'?'等待到貨':'開始清點'}</button></article>`).join(''):'<div class="empty-state">今日到貨已全部完成清點</div>';
  document.querySelector('#receiptPendingCount').textContent=receivingOrders.length;
  document.querySelector('#receiptArrivedCount').textContent=`${receivingOrders.filter(order=>order.arrival==='已到店').length} 批`;
  document.querySelector('#receiptExceptionCount').textContent=`${receivingOrders.filter(order=>order.arrival==='已到店'&&receiptIssues(order).length>0).length} 批`;
}

function renderReceivingForm(){
  const order=receivingOrders.find(item=>item.id===activeReceivingId)||receivingOrders[0];
  const rows=document.querySelector('#receivingItemRows');if(!rows)return;
  if(!order){document.querySelector('#receivingOrderMeta').textContent='目前沒有待清點的到貨單';rows.innerHTML='<tr><td colspan="7">今日到貨已全部完成清點</td></tr>';document.querySelector('#confirmReceiving').disabled=true;return}
  activeReceivingId=order.id;
  document.querySelector('#confirmReceiving').disabled=false;
  document.querySelector('#receivingOrderMeta').textContent=`${order.id}・${order.supplier}・${order.branch}・預計 ${order.eta}`;
  rows.innerHTML=order.items.map((item,index)=>{const difference=Number(item.received)-Number(item.ordered);const expiry=receiptExpiryState(item);return`<tr data-receiving-item="${index}"><td><strong>${item.name}</strong><small>${order.storage}</small></td><td>${item.ordered} ${item.unit}</td><td><input type="number" min="0" step="1" value="${item.received}" data-receiving-field="received" aria-label="${item.name}實收數量"></td><td><span class="receiving-diff ${difference!==0?'warn':''}" data-receiving-diff>${difference===0?'相符':`${difference>0?'+':''}${difference} ${item.unit}`}</span></td><td><input type="text" value="${item.batch}" data-receiving-field="batch" placeholder="輸入批號" aria-label="${item.name}批號"></td><td><input type="date" min="2026-10-15" value="${item.expiry}" data-receiving-field="expiry" aria-label="${item.name}有效期限"><small class="receiving-expiry-note" data-expiry-note>${expiry.issue?expiry.label:''}</small></td><td><select data-receiving-field="quality" aria-label="${item.name}品質"><option ${item.quality==='合格'?'selected':''}>合格</option><option ${item.quality==='包裝破損'?'selected':''}>包裝破損</option><option ${item.quality==='溫度異常'?'selected':''}>溫度異常</option><option ${item.quality==='品項錯誤'?'selected':''}>品項錯誤</option></select></td></tr>`}).join('');
  updateReceivingApproval();
}

function updateReceivingApproval(){
  const order=receivingOrders.find(item=>item.id===activeReceivingId);if(!order)return;
  const issues=receiptIssues(order),box=document.querySelector('#receivingApproval'),button=document.querySelector('#confirmReceiving');
  box.classList.toggle('warn',issues.length>0);box.querySelector('span').textContent=issues.length?'!':'✓';box.querySelector('strong').textContent=issues.length?'發現差異，需店長核准':'目前沒有異常';box.querySelector('small').textContent=issues.length?issues.join('；'):'確認後可直接完成入庫並建立批次。';button.textContent=issues.length?'確認清點並送店長核准':'確認清點並入庫';
}

function renderReceivingRecords(){
  const tbody=document.querySelector('#receivingRecordRows');if(!tbody)return;
  tbody.innerHTML=receivingRecords.map(record=>`<tr><td><strong>${record.id}</strong></td><td>${record.date}<br><small>${record.branch}</small></td><td>${record.supplier}</td><td>${record.items}</td><td><span class="record-result ${record.result==='無差異'?'':'warn'}">${record.result}</span></td><td><span class="record-status ${record.approval.includes('待')?'pending':''}">${record.approval}</span></td><td>${record.receiver}</td></tr>`).join('');
}

document.querySelectorAll('[data-inventory-mode]').forEach(button=>button.addEventListener('click',()=>switchInventoryMode(button.dataset.inventoryMode)));
document.querySelector('#receivingQueue')?.addEventListener('click',event=>{const button=event.target.closest('[data-start-receiving]');if(!button)return;activeReceivingId=button.dataset.startReceiving;renderReceivingForm();switchInventoryMode('check')});
document.querySelector('#receivingItemRows')?.addEventListener('input',event=>{const field=event.target.dataset.receivingField;if(!field)return;const order=receivingOrders.find(item=>item.id===activeReceivingId),row=event.target.closest('[data-receiving-item]'),item=order.items[Number(row.dataset.receivingItem)];item[field]=field==='received'?Number(event.target.value):event.target.value;const difference=Number(item.received)-Number(item.ordered),diff=row.querySelector('[data-receiving-diff]');diff.textContent=difference===0?'相符':`${difference>0?'+':''}${difference} ${item.unit}`;diff.classList.toggle('warn',difference!==0);const expiry=receiptExpiryState(item);row.querySelector('[data-expiry-note]').textContent=expiry.issue?expiry.label:'';updateReceivingApproval()});
document.querySelector('#receivingItemRows')?.addEventListener('change',event=>event.target.dispatchEvent(new Event('input',{bubbles:true})));
document.querySelector('#backToPending')?.addEventListener('click',()=>switchInventoryMode('pending'));
document.querySelector('#confirmReceiving')?.addEventListener('click',()=>{const order=receivingOrders.find(item=>item.id===activeReceivingId);if(!order)return;const issues=receiptIssues(order),reason=document.querySelector('#receivingReason').value.trim();if(order.items.some(item=>!item.batch.trim()||!item.expiry))return typeof toast==='function'&&toast('請完成每個品項的批號與有效期限');if(issues.length&&!reason)return typeof toast==='function'&&toast('有差異或效期問題，請先填寫說明');receivingRecords.unshift({id:order.id,date:'10/15 剛剛',branch:order.branch,supplier:order.supplier,items:order.items.map(item=>`${item.name} ${item.received} ${item.unit}`).join('、'),result:issues.length?issues.join('；'):'無差異',approval:issues.length?'待店長核准':'已完成入庫',receiver:'林雅婷'});receivingOrders.splice(receivingOrders.indexOf(order),1);document.querySelector('#receivingReason').value='';renderReceivingQueue();renderReceivingRecords();renderReceivingForm();switchInventoryMode('records');if(typeof toast==='function')toast(issues.length?'清點完成，已送店長核准':'入庫完成，批次與效期警示已建立')});
document.querySelector('#exportReceivingRecords')?.addEventListener('click',()=>{const rows=[['入庫單','日期','分店','供應商','品項','差異結果','核准狀態','收貨人'],...receivingRecords.map(record=>[record.id,record.date,record.branch,record.supplier,record.items,record.result,record.approval,record.receiver])];const csv='\uFEFF'+rows.map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='DrinkFlow_入庫紀錄.csv';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);if(typeof toast==='function')toast('入庫紀錄 CSV 已匯出')});

renderReceivingQueue();renderReceivingForm();renderReceivingRecords();switchInventoryMode('stock');
