
const http = require("node:http");

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200);
    return res.end(JSON.stringify({
      aplicativo: "Conect Motos",
      status: "Servidor funcionando",
      pagamentos: "Em configuracao"
    }));
  }

  if (req.method === "GET" && req.url === "/health") {
    res.writeHead(200);
    return res.end(JSON.stringify({ status: "ok" }));
  }

  res.writeHead(404);
  res.end(JSON.stringify({ erro: "Rota nao encontrada" }));
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Conect Motos API iniciada na porta ${PORT}`);
});
