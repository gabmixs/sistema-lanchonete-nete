const http = require('http');
const fs = require('fs');
const tls = require('tls');

// --- CONFIGURAÇÃO ---
const PORT = 3001;
// O caminho deve apontar para o arquivo dentro da pasta backend
const PFX_PATH = './backend/certificadoNete.pfx'; 
const PFX_PASSWORD = '59950858'; 

const server = http.createServer((req, res) => {
    // 1. Configurar CORS (Para o seu site React conseguir falar com esse servidor)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Se for uma verificação (OPTIONS), responde OK e para.
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // 2. Rota de Status (Para testar se está vivo)
    if (req.url === '/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'Online', message: 'Servidor Fiscal Rodando!' }));
        return;
    }

    // 3. Rota de Emitir Nota (POST)
    if (req.url === '/emitir-fiscal' && req.method === 'POST') {
        let body = '';
        
        // Recebe os dados da venda
        req.on('data', chunk => { body += chunk.toString(); });

        req.on('end', () => {
            try {
                const dadosVenda = JSON.parse(body);
                console.log('📝 Recebi um pedido de venda! Valor:', dadosVenda.total);

                // --- VALIDAÇÃO DO CERTIFICADO ---
                if (!fs.existsSync(PFX_PATH)) {
                    throw new Error('Certificado não encontrado no caminho: ' + PFX_PATH);
                }
                const pfxBuffer = fs.readFileSync(PFX_PATH);
                
                // Tenta abrir o certificado com a senha
                // Se a senha estiver errada, vai dar erro e cair no catch
                tls.createSecureContext({
                    pfx: pfxBuffer,
                    passphrase: PFX_PASSWORD
                });

                // Se chegou aqui, a senha está certa! Simulamos a resposta da SEFAZ:
                console.log('✅ Certificado validado! Emitindo nota simulada...');
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    nfe_number: Math.floor(Math.random() * 5000) + 1000, // Gera número aleatório
                    url_qrcode: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=NotaFiscalEmitidaComSucesso' 
                }));

            } catch (error) {
                console.error('❌ Erro:', error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: 'Erro: ' + error.message }));
            }
        });
        return;
    }

    // Qualquer outra rota
    res.writeHead(404);
    res.end('Rota desconhecida');
});

server.listen(PORT, () => {
    console.log(`🚀 SERVIDOR FISCAL ONLINE!`);
    console.log(`📡 Rodando em: http://localhost:${PORT}`);
});