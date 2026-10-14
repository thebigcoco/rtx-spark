const http=require('http');
const fs=require('fs');
const path=require('path');
const root=path.join(__dirname,'dist');
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.png':'image/png','.svg':'image/svg+xml'};
http.createServer((request,response)=>{
  const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
  const safePath=path.normalize(pathname==='/'?'index.html':pathname.replace(/^\/+/,''));
  const file=path.join(root,safePath);
  if(!file.startsWith(root)){response.writeHead(403);response.end('Forbidden');return}
  fs.readFile(file,(error,data)=>{if(error){response.writeHead(404);response.end('Not found');return}response.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});response.end(data)});
}).listen(4173,'127.0.0.1',()=>console.log('http://127.0.0.1:4173'));
