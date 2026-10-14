const drinks=[
  {name:'桂花烏龍',price:65,cat:['tea','season'],desc:'清香烏龍・桂花蜜',icon:'桂',tag:'秋季推薦'},
  {name:'白桃青茶',price:60,cat:['tea','fruit'],desc:'白桃果香・青茶',icon:'桃',tag:''},
  {name:'黑糖薑奶',price:75,cat:['milk','season'],desc:'黑糖・老薑・鮮奶',icon:'薑',tag:'熱飲'},
  {name:'四季春青茶',price:45,cat:['tea'],desc:'清爽回甘・無糖也順口',icon:'茶',tag:''},
  {name:'燕麥焙茶拿鐵',price:80,cat:['milk','season'],desc:'焙茶・燕麥奶',icon:'焙',tag:'新品'},
  {name:'南瓜雲朵鮮奶',price:85,cat:['milk','season'],desc:'南瓜・鮮奶・奶蓋',icon:'南',tag:'限定'},
  {name:'暗夜可可碎片',price:85,cat:['milk','season'],desc:'可可・鮮奶・可可碎片',icon:'夜',tag:'限定'},
  {name:'莓果魔法氣泡',price:75,cat:['fruit','season'],desc:'莓果・氣泡水',icon:'莓',tag:'限定'},
  {name:'珍珠奶茶',price:65,cat:['milk'],desc:'紅茶・鮮奶・黑糖珍珠',icon:'珍',tag:'人氣'},
  {name:'百香雙響炮',price:70,cat:['fruit'],desc:'百香果・椰果・珍珠',icon:'百',tag:'人氣'}
];
const toppings=[
  {name:'珍珠',price:10},{name:'椰果',price:10},{name:'蘆薈',price:15},{name:'布丁',price:15},{name:'寒天晶球',price:15}
];
const queryChannel=new URLSearchParams(location.search).get('channel');
const channel=queryChannel==='tablet'?'tablet':'online';
const isTablet=channel==='tablet';
const menu=document.querySelector('#customerMenu');
const cartItems=document.querySelector('#cartItems');
const cartEmpty=document.querySelector('#cartEmpty');
const cartCount=document.querySelector('#cartCount');
const cartTotal=document.querySelector('#cartTotal');
const checkout=document.querySelector('#checkout');
const confirmation=document.querySelector('#confirmation');
const branchSelect=document.querySelector('#branchSelect');
const customizeDialog=document.querySelector('#customizeDialog');
const toppingChoices=document.querySelector('#toppingChoices');
let cart=[];
let resetTimer;
let pendingDrink=null;

document.body.classList.add(isTablet?'tablet-mode':'online-mode');
document.title=isTablet?'DrinkFlow AI｜站前店現場平板':'DrinkFlow AI｜網路預點單';
document.querySelector('#channelLabel').textContent=isTablet?'現場平板點單':'網路預點單';
document.querySelector('#branchHint').textContent=isTablet?'此平板分店':'選擇取餐分店';
document.querySelector('#heroDescription').textContent=isTablet?'站前店現場自助點餐；完成後請持取餐號碼至櫃台付款。':'可跨裝置預點、選擇取餐時間，並接收即時製作進度。';
branchSelect.disabled=isTablet;
checkout.textContent=isTablet?'送出訂單・現場付款':'線上付款並下單';
document.querySelector('#newOrder').textContent=isTablet?'完成並清除畫面':'繼續點餐';

function renderMenu(filter='all'){
  menu.innerHTML=drinks.filter(drink=>filter==='all'||drink.cat.includes(filter)).map(drink=>`<article class="drink-card"><div class="drink-art">${drink.icon}</div>${drink.tag?`<span class="tag">${drink.tag}</span>`:''}<h3>${drink.name}</h3><p>${drink.desc}</p><footer><strong>NT$ ${drink.price}</strong><button data-add="${drink.name}">客製／加料</button></footer></article>`).join('');
}
function renderCart(){
  cartEmpty.hidden=cart.length>0;
  cartItems.innerHTML=cart.map((drink,index)=>`<div class="cart-item"><div><strong>${drink.name}</strong><small>${drink.sweet}・${drink.temperature}<br>${drink.toppings.length?`加料：${drink.toppings.map(item=>item.name).join('、')}`:'不加料'}</small></div><b>NT$ ${drink.total}</b><button data-remove="${index}" aria-label="移除${drink.name}">×</button></div>`).join('');
  cartCount.textContent=`${cart.length} 杯`;
  cartTotal.textContent=`NT$ ${cart.reduce((sum,drink)=>sum+drink.total,0)}`;
  checkout.disabled=!cart.length;
}
function updateCustomizeTotal(){
  if(!pendingDrink)return;
  const toppingTotal=[...toppingChoices.querySelectorAll('.topping-choice.active')].reduce((sum,button)=>sum+Number(button.dataset.price),0);
  document.querySelector('#customizeTotal').textContent=`NT$ ${pendingDrink.price+toppingTotal}`;
}
function openCustomize(drink){
  pendingDrink=drink;
  document.querySelector('#customizeDrinkName').textContent=drink.name;
  document.querySelectorAll('.customize-group').forEach(group=>group.querySelectorAll('.custom-choice').forEach((button,index)=>button.classList.toggle('active',index===0)));
  toppingChoices.innerHTML=toppings.map(item=>`<button type="button" class="topping-choice" data-topping="${item.name}" data-price="${item.price}"><span>${item.name}</span><b>＋${item.price}</b></button>`).join('');
  updateCustomizeTotal();
  customizeDialog.showModal();
}
function clearOrder(){
  clearInterval(resetTimer);
  confirmation.hidden=true;
  cart=[];
  renderCart();
  document.querySelector('.tablet-screen')?.scrollTo({top:0,behavior:'smooth'});
}
function startTabletReset(){
  let seconds=15;
  const label=document.querySelector('#resetCountdown');
  label.textContent=`${seconds} 秒後自動清除畫面`;
  clearInterval(resetTimer);
  resetTimer=setInterval(()=>{seconds-=1;label.textContent=`${seconds} 秒後自動清除畫面`;if(seconds<=0)clearOrder()},1000);
}

document.querySelector('.filter-row').addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;document.querySelectorAll('.filter-row button').forEach(item=>item.classList.remove('active'));button.classList.add('active');renderMenu(button.dataset.filter)});
menu.addEventListener('click',event=>{const button=event.target.closest('[data-add]');if(!button)return;openCustomize(drinks.find(drink=>drink.name===button.dataset.add))});
document.querySelectorAll('.customize-group').forEach(group=>group.addEventListener('click',event=>{const button=event.target.closest('.custom-choice');if(!button)return;group.querySelectorAll('.custom-choice').forEach(item=>item.classList.remove('active'));button.classList.add('active')}));
toppingChoices.addEventListener('click',event=>{const button=event.target.closest('.topping-choice');if(!button)return;button.classList.toggle('active');updateCustomizeTotal()});
document.querySelector('#confirmCustomize').addEventListener('click',()=>{if(!pendingDrink)return;const sweet=document.querySelector('[data-custom-group="sweet"] .custom-choice.active').textContent;const temperature=document.querySelector('[data-custom-group="temperature"] .custom-choice.active').textContent;const selectedToppings=[...toppingChoices.querySelectorAll('.topping-choice.active')].map(button=>toppings.find(item=>item.name===button.dataset.topping));const total=pendingDrink.price+selectedToppings.reduce((sum,item)=>sum+item.price,0);cart.push({...pendingDrink,sweet,temperature,toppings:selectedToppings,total});customizeDialog.close();pendingDrink=null;renderCart()});
cartItems.addEventListener('click',event=>{const button=event.target.closest('[data-remove]');if(!button)return;cart.splice(Number(button.dataset.remove),1);renderCart()});
document.querySelectorAll('.pay-method').forEach(group=>group.addEventListener('click',event=>{const button=event.target.closest('.mode-choice');if(!button)return;group.querySelectorAll('.mode-choice').forEach(item=>item.classList.remove('active'));button.classList.add('active')}));
checkout.addEventListener('click',()=>{
  if(!cart.length)return;
  if(isTablet)document.querySelector('.tablet-screen')?.scrollTo({top:0,behavior:'auto'});
  confirmation.hidden=false;
  document.querySelector('#confirmationLabel').textContent=isTablet?'訂單已送出・請至櫃台付款':'付款成功・訂單已送出';
  if(!isTablet){const notify=document.querySelector('#notifyOrder').checked;document.querySelector('.status-delivery strong').textContent=notify?'狀態連結與通知已建立':'狀態連結已建立';}
  if(isTablet)startTabletReset();
});
document.querySelector('#newOrder').addEventListener('click',clearOrder);
renderMenu();
renderCart();
