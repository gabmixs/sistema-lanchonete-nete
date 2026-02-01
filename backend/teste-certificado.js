const fs = require('fs');
const tls = require('tls'); // <--- AQUI MUDOU: Usamos 'tls' agora

// --- CONFIGURAÇÃO ---
const PFX_PATH = './backend/certificadoNete.pfx'; 
const PFX_PASSWORD = '59950858';

function testarCertificadoNativo() {
    try {
        console.log('🔄 Lendo arquivo .pfx (Modo Nativo)...');
        
        if (!fs.existsSync(PFX_PATH)) {
             throw new Error('O arquivo não foi encontrado no caminho: ' + PFX_PATH);
        }

        const pfxBuffer = fs.readFileSync(PFX_PATH);

        console.log('🔓 Testando a senha...');
        
        // Agora usando a biblioteca certa (tls)
        const context = tls.createSecureContext({
            pfx: pfxBuffer,
            passphrase: PFX_PASSWORD
        });

        console.log('\n✅ SUCESSO TOTAL!');
        console.log('O Node.js conseguiu abrir seu certificado.');
        console.log('Senha correta e arquivo válido para emitir notas!');

    } catch (error) {
        // O erro de senha geralmente vem como "bad decrypt" ou "mac verify failure"
        if (error.message.includes('mac verify failure') || error.message.includes('bad decrypt') || error.message.includes('wrong passphrase')) {
            console.error('\n❌ ERRO: A senha digitada está incorreta.');
        } else {
            console.error('\n❌ ERRO TÉCNICO:', error.message);
        }
    }
}

testarCertificadoNativo();