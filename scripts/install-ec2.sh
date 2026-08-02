#!/bin/bash
# OmniNinja — Instalação completa na EC2 Ubuntu (PERMANENTE, não cai nunca)
# Roda: bash install-ec2.sh
set -e

echo "🥷 OmniNinja — Instalação completa na EC2"
echo "============================================"

# 1. Instalar Node.js 20, PM2, Chromium
echo "→ Instalando Node.js 20 + PM2 + Chromium..."
if ! command -v node &>/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
sudo npm install -y -g pm2 npx 2>/dev/null || true
sudo npx playwright install chromium --with-deps 2>/dev/null || true

# 2. Baixar código
echo "→ Baixando código..."
if [ ! -d ~/omninja ]; then
  git clone https://github.com/Vxvjsiwieh82/refactored-doodle.git ~/omninja
else
  cd ~/omninja && git fetch origin && git reset --hard origin/main
fi

cd ~/omninja

# 3. Instalar dependências
echo "→ Instalando dependências..."
npm install

# 4. Criar .env completo (com SANDBOX_URL=localhost, sem ngrok!)
echo "→ Criando .env..."
cat > .env << 'EOF'
DATABASE_URL=file:./prod.db
BROWSERLESS_API_KEY=2UxDzc484bvSwHY594f6a03db1a56901ca6d90bd701a2a950
BROWSERLESS_REGION=production-sfo
OPENROUTER_CLAUDE_API_KEY=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
OPENROUTER_CHATGPT_API_KEY=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
OPENROUTER_KIMI_API_KEY=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
OPENROUTER_GROK_API_KEY=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
OPENROUTER_GEMINI_API_KEY=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
SANDBOX_URL=http://localhost:3005
AUTH_SECRET=omnininja-secret-key-2026
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# 5. Banco de dados
echo "→ Criando banco..."
npx prisma generate
npx prisma db push

# 6. Criar admin
echo "→ Criando conta admin..."
node -e "
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.scryptSync('omnininja-admin-2026', salt, 64).toString('hex');
prisma.user.upsert({
  where: { email: 'admin@omninja.app' },
  update: { passwordHash: salt+':'+hash, role: 'admin', credits: 999999999, tier: 'enterprise' },
  create: { email: 'admin@omninja.app', name: 'Admin', passwordHash: salt+':'+hash, role: 'admin', credits: 999999999, bonusCredits: 999999999, tier: 'enterprise', defaultModel: 'grok' }
}).then(u => { console.log('Admin:', u.email, '| role:', u.role); process.exit(0); }).catch(e => { console.error(e); process.exit(1); });
"

# 7. Build
echo "→ Fazendo build (demora 2-3 min)..."
npm run build

# 8. Instalar dependências do sandbox
echo "→ Instalando sandbox..."
cd ~/omninja/mini-services/sandbox-server
npm install
cd ~/omninja

# 9. Parar processos antigos
echo "→ Parando processos antigos..."
pm2 delete omninja-web 2>/dev/null || true
pm2 delete omninja-sandbox 2>/dev/null || true
fuser -k 3000/tcp 2>/dev/null || true
fuser -k 3005/tcp 2>/dev/null || true
sleep 2

# 10. Iniciar site + sandbox com PM2
echo "→ Iniciando site (porta 3000) + sandbox (porta 3005)..."
pm2 start "npm run start" --name omninja-web --cwd ~/omninja
pm2 start "npx tsx mini-services/sandbox-server/index.ts" --name omninja-sandbox --cwd ~/omninja
pm2 save

# 11. Configurar PM2 startup (reinicia após reboot)
echo "→ Configurando auto-restart..."
pm2 startup 2>&1 | grep "sudo" | head -1 | bash 2>/dev/null || true
pm2 save

# 12. Abrir portas no firewall
sudo ufw allow 3000/tcp 2>/dev/null || true
sudo ufw allow 3005/tcp 2>/dev/null || true

echo ""
echo "============================================"
echo "✅ INSTALAÇÃO COMPLETA!"
echo "============================================"
echo ""
echo "Status dos serviços:"
pm2 status
echo ""
echo "Teste o site:"
curl -s -o /dev/null -w "  Site (3000): HTTP %{http_code}\n" http://localhost:3000/
curl -s http://localhost:3005/health | head -c 100
echo ""
echo ""
echo "🔑 LOGIN ADMIN:"
echo "  Email: admin@omninja.app"
echo "  Senha: omnininja-admin-2026"
echo ""
echo "🌐 Acesse:"
IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4 2>/dev/null || echo "SEU_IP")
echo "  http://$IP:3000"
echo ""
echo "⚠️  Abra a porta 3000 no Security Group da AWS:"
echo "  EC2 → Security Groups → Edit inbound rules → Add:"
echo "  Type: Custom TCP | Port: 3000 | Source: 0.0.0.0/0"
echo ""
