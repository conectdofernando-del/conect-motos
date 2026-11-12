
const http = require("node:http");

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.MERCADO_PAGO_ACCESS_TOKEN;

const motos = {
  "bot-m400": { nome: "Bot M400", preco: 4500 },
  "bot-m500": { nome: "Bot M500", preco: 6400 },
  "bot-paris": { nome: "Bot Paris", preco: 8500 },
  "bot-l70": { nome: "Bot L-70", preco: 8500 },
  "bot-flash-1000": { nome: "Bot Flash 1000", preco: 11000 }
};

function responder(res, status, dados) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(dados));
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(
    req.url,
    "http://localhost"
  ).pathname;

  if (req.method === "OPTIONS") {
    return responder(res, 204, {});
  }

  if (req.method === "GET" && pathname === "/health") {
    return responder(res, 200, { status: "ok" });
  }

  if (req.method === "GET" && pathname === "/") {
    return responder(res, 200, {
      aplicativo: "Conect Motos",
      status: "Servidor funcionando",
      pagamentos: "Mercado Pago em teste"
    });
  }

  if (req.method === "POST" &&
      pathname === "/criar-pagamento") {
    try {
      if (!TOKEN) {
        return responder(res, 500, {
          erro: "Token não configurado"
        });
      }

      let corpo = "";
      for await (const parte of req) {
        corpo += parte;
        if (corpo.length > 10000) {
          return responder(res, 413, {
            erro: "Requisição muito grande"
          });
        }
      }

      const dados = JSON.parse(corpo);
      const moto = motos[dados.modelo];

      if (!moto) {
        return responder(res, 400, {
          erro: "Modelo de moto inválido"
        });
      }

      const resposta = await fetch(
        "https://api.mercadopago.com/checkout/preferences",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
            "X-Idempotency-Key": require("node:crypto")
              .randomUUID()
          },
          body: JSON.stringify({
            items: [{
              id: dados.modelo,
              title: moto.nome,
              quantity: 1,
              currency_id: "BRL",
              unit_price: moto.preco
            }],
            external_reference: require("node:crypto")
  .randomUUID(),

payment_methods: {
  installments: 10
}
})

        }
      );

      const resultado = await resposta.json();

      if (!resposta.ok) {
        return responder(res, 502, {
          erro: "Falha ao criar pagamento de teste",
          detalhe: resultado.message || "Verifique as credenciais"
        });
      }

      return responder(res, 200, {
        pagamento_id: resultado.id,
        link_teste: resultado.sandbox_init_point,
        link: resultado.init_point
      });

    } catch (erro) {
      return responder(res, 400, {
        erro: "Não foi possível processar a solicitação"
      });
    }
  }

  
if (req.method === "POST" && pathname === "/webhook") {
  console.log("Notificação recebida do Mercado Pago");
  return responder(res, 200, { recebido: true });
}

  return responder(res, 404, {
    erro: "Rota não encontrada"
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Conect Motos API na porta ${PORT}`);
});
