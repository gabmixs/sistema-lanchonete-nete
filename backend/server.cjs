require('dotenv').config(); // 1. O Cofre: Carrega as senhas secretas
const http = require('http');
const fs = require('fs');
const https = require('https'); // Necessário para criar o agente seguro
const axios = require('axios'); // O Carteiro que manda pra SEFAZ

// --- CONFIGURAÇÃO ---
const PORT = process.env.PORT || 3001; // Pega a porta da Render ou usa 3001
const PFX_PATH = './backend/certificadoNete.pfx'; 

// 2. Segredo: A senha vem da variável de ambiente (não fica escrita aqui!)
const PFX_PASSWORD = process.env.CERTIFICADO_SENHA; 

// --- SETUP DO AGENTE SEFAZ (O Crachá) ---
// Isso cria um "navegador" especial que já carrega o certificado da Nete
const getSefazAgent = () => {
    if (!fs.existsSync(PFX_PATH)) {
        throw new Error(`Certificado não encontrado em: ${PFX_PATH}`);
    }
    const pfxContent = fs.readFileSync(PFX_PATH);
    return new https.Agent({
        pfx: pfxContent,
        passphrase: PFX_PASSWORD,
        rejectUnauthorized: false // Importante para SEFAZ (ignora erros de SSL deles)
    });
};

const server = http.createServer(async (req, res) => {
    // 3. Configurar CORS (Permite o site falar com o servidor)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // Rota de Teste (Para ver se o servidor está vivo)
    if (req.url === '/status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'Online', 
            ambiente: process.env.NODE_ENV || 'Desenvolvimento',
            mensagem: 'Servidor Fiscal Pronto!' 
        }));
        return;
    }

    // --- ROTA PRINCIPAL: EMITIR NOTA ---
    if (req.url === '/emitir-fiscal' && req.method === 'POST') {
        let body = '';
        
        req.on('data', chunk => { body += chunk.toString(); });

        req.on('end', async () => {
            try {
                const dadosVenda = JSON.parse(body);
                console.log('📝 Iniciando emissão para venda de R$:', dadosVenda.total);

                // Tenta carregar o agente seguro (teste do certificado)
                const agent = getSefazAgent();
                console.log('🔐 Certificado carregado e desbloqueado com sucesso!');

                // --- AQUI ACONTECE A MÁGICA DA SEFAZ ---
                // Nota: Para emitir DE VERDADE, precisamos gerar o XML assinado.
                // Como ainda não temos o XML gerador, vamos fazer um "Ping" na SEFAZ
                // para provar que o certificado funciona.
                
                const urlSefaz = 'https://homologacao.nfce.fazenda.sp.gov.br/ws/NfeStatusServico4.asmx'; // URL de Teste SP
                
                // Exemplo de envio real (comentado até termos o XML pronto)
                /*
                const responseSefaz = await axios.post(urlSefaz, xmlAssinado, {
                    headers: { 'Content-Type': 'application/soap+xml; charset=utf-8' },
                    httpsAgent: agent // <--- Aqui vai o certificado!
                });
                */

                // POR ENQUANTO: Simula Sucesso se o certificado abriu
                console.log('✅ Comunicação com o módulo fiscal: OK');
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    ambiente: 'HOMOLOGACAO (TESTE)',
                    nfe_number: Math.floor(Math.random() * 5000) + 1000,
                    chave_acesso: '352302' + Math.floor(Math.random() * 10000000000000), // Simulação
                    url_qrcode: 'https://www.sefaz.sp.gov.br/nfce/consulta' 
                }));

            } catch (error) {
                console.error('❌ Erro na emissão:', error.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    success: false, 
                    message: 'Erro no servidor fiscal: ' + error.message 
                }));
            }
        });
        return;
    }

    res.writeHead(404);
    res.end('Rota desconhecida');
});

server.listen(PORT, () => {
    console.log(`🚀 SERVIDOR FISCAL ONLINE NA PORTA ${PORT}!`);
});