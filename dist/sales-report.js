const monthlySalesReports={
  '2026-10':{
    label:'2026 年 10 月',orders:11994,cups:14565,gross:961040,discount:21320,refund:3510,net:936210,growth:'較上月 +6.4%',
    rows:[
      ['站前店',1380,1682,109200,2250,520,106430,'桂花烏龍'],['市場店',1195,1457,92050,1910,400,89740,'白桃青茶'],['學府店',1416,1723,115540,2600,380,112560,'燕麥焙茶拿鐵'],['商辦店',1124,1368,93450,1920,280,91250,'四季春青茶'],['社區店',1069,1296,74990,2000,290,72700,'珍珠奶茶'],['夜市店',1218,1486,95780,2380,340,93060,'百香雙響炮'],['百貨店',1326,1605,116420,2780,460,113180,'南瓜雲朵鮮奶'],['醫院店',1018,1202,79860,1540,250,78070,'桂花烏龍'],['科技園區店',1284,1578,109540,2250,370,106920,'燕麥焙茶拿鐵'],['河岸店',964,1168,74210,1690,220,72300,'白桃青茶']
    ],
    comboRate:'29.8%',comboReason:'科技園區店與站前店最常見，下午快取時段表現最好。',
    combos:[
      ['四季春青茶','珍珠',1284,'科技園區店','+12.6%'],['桂花烏龍','椰果',942,'站前店','+9.4%'],['白桃青茶','蘆薈',816,'河岸店','+7.1%'],['珍珠奶茶','布丁',704,'學府店','+5.8%'],['百香雙響炮','寒天晶球',598,'夜市店','−2.3%']
    ],
    toppings:[['珍珠',3126],['椰果',2284],['蘆薈',1710],['布丁',1488],['寒天晶球',1204]]
  },
  '2026-09':{
    label:'2026 年 9 月',orders:11349,cups:13761,gross:904120,discount:21280,refund:3260,net:879580,growth:'較上月 +4.5%',
    rows:[
      ['站前店',1304,1582,102650,2300,510,99840,'四季春青茶'],['市場店',1130,1372,86450,1850,390,84210,'白桃青茶'],['學府店',1342,1628,109150,2460,370,106320,'珍珠奶茶'],['商辦店',1072,1302,88630,1870,280,86480,'燕麥焙茶拿鐵'],['社區店',1014,1234,69990,2760,160,67070,'桂花烏龍'],['夜市店',1149,1395,89740,2240,320,87180,'百香雙響炮'],['百貨店',1254,1518,109620,2620,430,106570,'南瓜雲朵鮮奶'],['醫院店',962,1137,74880,1460,240,73180,'四季春青茶'],['科技園區店',1212,1489,103280,2120,350,100810,'燕麥焙茶拿鐵'],['河岸店',910,1104,69730,1600,210,67920,'白桃青茶']
    ],
    comboRate:'28.7%',comboReason:'科技園區店與學府店帶動，團體快取與放學時段最明顯。',
    combos:[
      ['四季春青茶','珍珠',1140,'科技園區店','+4.8%'],['桂花烏龍','椰果',861,'站前店','+7.1%'],['白桃青茶','蘆薈',762,'河岸店','+7.3%'],['珍珠奶茶','布丁',665,'學府店','+4.2%'],['百香雙響炮','寒天晶球',612,'夜市店','+4.6%']
    ],
    toppings:[['珍珠',2890],['椰果',2105],['蘆薈',1588],['布丁',1394],['寒天晶球',1160]]
  },
  '2026-08':{
    label:'2026 年 8 月',orders:11001,cups:13323,gross:865990,discount:20830,refund:3310,net:841850,growth:'較上月 +2.2%',
    rows:[
      ['站前店',1275,1546,99420,2370,490,96560,'四季春青茶'],['市場店',1103,1338,83430,2090,400,80940,'百香雙響炮'],['學府店',1298,1574,104810,2560,370,101880,'珍珠奶茶'],['商辦店',1048,1270,85270,1870,280,83120,'燕麥焙茶拿鐵'],['社區店',996,1206,67750,2390,280,65080,'白桃青茶'],['夜市店',1108,1342,85420,2130,310,82980,'百香雙響炮'],['百貨店',1204,1457,104160,2480,410,101270,'南瓜雲朵鮮奶'],['醫院店',928,1097,71350,1390,230,69730,'四季春青茶'],['科技園區店',1165,1432,98460,2040,340,96080,'燕麥焙茶拿鐵'],['河岸店',876,1061,65920,1510,200,64210,'白桃青茶']
    ],
    comboRate:'27.9%',comboReason:'學府店與夜市店加料率最高，珍珠仍是第一名。',
    combos:[
      ['四季春青茶','珍珠',1088,'科技園區店','+4.8%'],['桂花烏龍','椰果',804,'站前店','+3.9%'],['白桃青茶','蘆薈',710,'河岸店','+2.6%'],['珍珠奶茶','布丁',638,'學府店','+1.1%'],['百香雙響炮','寒天晶球',585,'夜市店','−1.4%']
    ],
    toppings:[['珍珠',2750],['椰果',1994],['蘆薈',1492],['布丁',1320],['寒天晶球',1098]]
  }
};

const money=value=>`$${Number(value).toLocaleString('zh-TW')}`;

function renderMonthlySales(month){
  const report=monthlySalesReports[month];
  if(!report)return;
  document.querySelector('#monthOrders').textContent=report.orders.toLocaleString('zh-TW');
  document.querySelector('#monthCups').textContent=report.cups.toLocaleString('zh-TW');
  document.querySelector('#monthAdjustments').textContent=money(report.discount+report.refund);
  document.querySelector('#monthNetSales').textContent=money(report.net);
  document.querySelector('#monthGrowth').textContent=report.growth;
  document.querySelector('#monthlyEvidenceBadge').textContent=`${report.label}・${report.cups.toLocaleString('zh-TW')} 杯`;
  document.querySelector('#monthlySalesRows').innerHTML=report.rows.map(([branch,orders,cups,gross,discount,refund,net,best])=>`<tr><td>${branch}</td><td>${orders.toLocaleString('zh-TW')}</td><td>${cups.toLocaleString('zh-TW')}</td><td>${money(net)}</td><td>${money(Math.round(net/orders))}</td><td>${best}</td></tr>`).join('');
  document.querySelector('#monthTableOrders').textContent=report.orders.toLocaleString('zh-TW');
  document.querySelector('#monthTableCups').textContent=report.cups.toLocaleString('zh-TW');
  document.querySelector('#monthTableNet').textContent=money(report.net);
  document.querySelector('#monthTableAverage').textContent=money(Math.round(report.net/report.orders));

  const [tea,topping,cups,branch]=report.combos[0];
  document.querySelector('#comboMonthBadge').textContent=report.label;
  document.querySelector('#topComboName').textContent=`${tea}＋${topping}`;
  document.querySelector('#topComboReason').textContent=report.comboReason;
  document.querySelector('#topComboCups').textContent=`${cups.toLocaleString('zh-TW')} 杯`;
  document.querySelector('#topComboShare').textContent=`${(cups/report.cups*100).toFixed(1)}%`;
  document.querySelector('#topComboBranch').textContent=branch;
  document.querySelector('#toppingOrderRate').textContent=`加料率 ${report.comboRate}`;
  document.querySelector('#toppingRanking').innerHTML=report.toppings.map(([name,count])=>`<li><span>${name}</span><b>${count.toLocaleString('zh-TW')} 杯</b></li>`).join('');
  document.querySelector('#comboRows').innerHTML=report.combos.map(([drink,addOn,count,strongest,trend],index)=>`<tr><td>${index+1}</td><td>${drink}</td><td>${addOn}</td><td>${count.toLocaleString('zh-TW')}</td><td>${(count/report.cups*100).toFixed(1)}%</td><td>${strongest}</td><td><span class="combo-trend ${trend.startsWith('−')||trend.startsWith('-')?'down':'up'}">${trend}</span></td></tr>`).join('');
}

function exportMonthlySales(){
  const month=document.querySelector('#salesMonth').value;
  const report=monthlySalesReports[month];
  const header=['月份','分店','完成訂單數','售出杯數','銷售原額','折扣','退款','實收營業額','網路訂單','現場平板訂單','櫃台訂單','當月熱銷'];
  const rows=report.rows.map(([branch,orders,cups,gross,discount,refund,net,best])=>{
    const online=Math.round(orders*.44),tablet=Math.round(orders*.37),counter=orders-online-tablet;
    return[report.label,branch,orders,cups,gross,discount,refund,net,online,tablet,counter,best];
  });
  rows.push([report.label,'十店合計',report.orders,report.cups,report.gross,report.discount,report.refund,report.net,'','','','']);
  const comboRows=report.combos.map(([tea,topping,cups,branch,trend],index)=>[index+1,tea,topping,cups,`${(cups/report.cups*100).toFixed(1)}%`,branch,trend]);
  const toppingRows=report.toppings.map(([topping,cups],index)=>[index+1,topping,cups]);
  const output=[header,...rows,[],['茶底＋加料組合分析'],['排名','茶底／飲品','加料','售出杯數','占全月杯數','最強分店','月增減'],...comboRows,[],['加料人氣排行'],['排名','加料','售出杯數'],...toppingRows];
  const csv='\uFEFF'+output.map(row=>row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');
  link.href=url;
  link.download=`DrinkFlow_${month}_完整銷售.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  if(typeof toast==='function')toast(`${report.label}完整銷售與加料組合 CSV 已匯出`);
}

document.querySelector('#salesMonth')?.addEventListener('change',event=>renderMonthlySales(event.target.value));
document.querySelector('#exportMonthlySales')?.addEventListener('click',exportMonthlySales);
renderMonthlySales(document.querySelector('#salesMonth')?.value||'2026-10');
