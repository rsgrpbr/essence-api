// ============================================
// VERSÃO CORRIGIDA - api/ai-sugestoes
// ============================================
// MUDANÇAS:
// ✅ ADICIONA autenticação por API Key
// ✅ ADICIONA rate limiting por IP
// ✅ ADICIONA logs de segurança
// ✅ ADICIONA validação rigorosa de input
// ✅ MANTÉM toda funcionalidade original
// ============================================

// ============================================
// 🔒 RATE LIMITING GLOBAL (IN-MEMORY)
// ============================================
const ipRequestCache = new Map();

function checkIPRateLimit(ip) {
  const now = Date.now();
  const LIMIT = 50; // 50 requests/hora por IP
  const WINDOW = 60 * 60 * 1000; // 1 hora

  const cached = ipRequestCache.get(ip);

  if (!cached || now > cached.resetAt) {
    ipRequestCache.set(ip, { count: 1, resetAt: now + WINDOW });
    return { allowed: true, remaining: LIMIT - 1, resetAt: new Date(now + WINDOW) };
  }

  if (cached.count >= LIMIT) {
    return { allowed: false, remaining: 0, resetAt: new Date(cached.resetAt) };
  }

  cached.count++;
  return { allowed: true, remaining: LIMIT - cached.count, resetAt: new Date(cached.resetAt) };
}

// Limpar cache a cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of ipRequestCache.entries()) {
    if (now > data.resetAt) {
      ipRequestCache.delete(ip);
    }
  }
}, 10 * 60 * 1000);

// ============================================
// 🔒 FUNÇÃO AUXILIAR: Extrair IP
// ============================================
function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const realIP = req.headers['x-real-ip'];
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// ============================================
// 🔒 HANDLER PRINCIPAL
// ============================================
export default async function handler(req, res) {
  // ============================================
  // STEP 1: CORS Headers (MANTIDO)
  // ============================================
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://www.essenceapp.com.br');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-API-Key');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // ============================================
  // STEP 2: RATE LIMITING POR IP (NOVO)
  // ============================================
  const ip = getClientIP(req);
  console.log(`[AI-SUGESTOES] IP: ${ip}, Method: ${req.method}`);
  
  const ipLimit = checkIPRateLimit(ip);
  
  if (!ipLimit.allowed) {
    console.warn(`[AI-SUGESTOES] ⚠️ IP ${ip} bloqueado por rate limit`);
    return res.status(429).json({
      error: 'Muitas requisições. Aguarde alguns minutos.',
      code: 'RATE_LIMIT_IP',
      remaining: 0,
      resetAt: ipLimit.resetAt.toISOString()
    });
  }

  console.log(`[AI-SUGESTOES] IP ${ip} - Remaining: ${ipLimit.remaining}`);

  // ============================================
  // STEP 3: AUTENTICAÇÃO POR API KEY (NOVO)
  // ============================================
  // Exceto para GET (status endpoint)
  if (req.method !== 'GET') {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.ESSENCE_API_SECRET;

    if (!validApiKey) {
      console.error('[AI-SUGESTOES] ❌ ESSENCE_API_SECRET não configurado!');
      return res.status(500).json({ 
        error: 'Configuração do servidor inválida' 
      });
    }

    if (!apiKey) {
      console.warn(`[AI-SUGESTOES] ❌ IP ${ip} - API Key ausente`);
      return res.status(401).json({ 
        error: 'API Key obrigatória',
        code: 'MISSING_API_KEY'
      });
    }

    if (apiKey !== validApiKey) {
      console.warn(`[AI-SUGESTOES] ❌ IP ${ip} - API Key inválida: ${apiKey.substring(0, 8)}...`);
      return res.status(401).json({ 
        error: 'API Key inválida',
        code: 'INVALID_API_KEY'
      });
    }

    console.log(`[AI-SUGESTOES] ✅ IP ${ip} - Autenticado com sucesso`);
  }

  // ============================================
  // STEP 4: ENDPOINT GET (MANTIDO)
  // ============================================
  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'API da Essence funcionando!',
      status: 'online',
      version: '2.0-secured'
    });
  }

  // ============================================
  // STEP 5: VALIDAR MÉTODO (MANTIDO)
  // ============================================
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Apenas POST permitido' });
  }

  // ============================================
  // STEP 6: PROCESSAR REQUEST (MANTIDO + MELHORADO)
  // ============================================
  try {
    // Importar Anthropic dinamicamente
    const { Anthropic } = await import('@anthropic-ai/sdk');
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const { sentimento, oleos } = req.body;

    // Validação de input (MELHORADA)
    if (!sentimento?.trim()) {
      console.warn(`[AI-SUGESTOES] ❌ IP ${ip} - Sentimento vazio`);
      return res.status(400).json({ error: 'Sentimento obrigatório' });
    }

    if (sentimento.length > 500) {
      console.warn(`[AI-SUGESTOES] ❌ IP ${ip} - Sentimento muito longo: ${sentimento.length} chars`);
      return res.status(400).json({ 
        error: 'Sentimento muito longo. Máximo 500 caracteres.',
        code: 'INPUT_TOO_LONG'
      });
    }

    if (!oleos || oleos.length === 0) {
      console.warn(`[AI-SUGESTOES] ❌ IP ${ip} - Lista de óleos vazia`);
      return res.status(400).json({ error: 'Lista de óleos obrigatória' });
    }

    if (oleos.length > 100) {
      console.warn(`[AI-SUGESTOES] ❌ IP ${ip} - Muitos óleos: ${oleos.length}`);
      return res.status(400).json({ 
        error: 'Máximo 100 óleos permitidos',
        code: 'TOO_MANY_OILS'
      });
    }

    console.log(`[AI-SUGESTOES] ✅ IP ${ip} - Processando: sentimento="${sentimento.substring(0, 30)}...", óleos=${oleos.length}`);

    // --- LÓGICA DE FILTRAGEM DE SINTOMAS (MANTIDA) ---
    const classificationPrompt = `Analise a seguinte descrição de sentimento/sintoma: "${sentimento}".
    
    Se a descrição contiver APENAS sintomas físicos (como dor de cabeça, dor na perna, náusea, vômito, febre, gripe, dor nas costas, etc.) SEM mencionar explicitamente emoções, sentimentos ou estados psicológicos, responda APENAS com a palavra: FISICO
    
    Caso contrário (se contiver emoções, sentimentos, estados psicológicos, ou uma mistura de físico e emocional), responda APENAS com a palavra: PSICOTERAPIA`;

    const classificationResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 5,
      temperature: 0.0,
      messages: [{ role: "user", content: classificationPrompt }],
    });

    const classificationText = classificationResponse.content[0].text.trim().toUpperCase();
    console.log(`[AI-SUGESTOES] Classificação: ${classificationText}`);

    if (classificationText === 'FISICO') {
      console.log(`[AI-SUGESTOES] ✅ IP ${ip} - Sintoma físico detectado`);
      return res.status(200).json({
        tipo: "sintoma_fisico",
        mensagem: "Para sintomas físicos, como dor de cabeça, dor na perna, náusea ou vômito, recomendamos buscar na aba 'óleo sintomas'. A psicoaromaterapia foca em bem-estar emocional e mental.",
        sugestao_busca: "Acesse a aba 'óleo sintomas' para encontrar óleos essenciais que auxiliam em desconfortos físicos."
      });
    }

    // --- LÓGICA DE PSICOAROMATERAPIA (MANTIDA) ---
    const prompt = `Você é um especialista em psicoaromaterapia.
    
SITUAÇÃO: O usuário se sente "${sentimento}"

IMPORTANTE - ANÁLISE:
1. O usuário está buscando uma análise de psicoaromaterapia.
2. Sua resposta DEVE ser um objeto JSON que segue o formato "psicoaromaterapia" (item 2 abaixo).
3. NUNCA use o formato "sintoma_fisico" (item 1 abaixo), pois a triagem já foi feita.

ÓLEOS DISPONÍVEIS:
${oleos.map((oleo, i) => `
${i + 1}. ${oleo.nome} (slug: ${oleo.slug}):
   Descrição: ${oleo.psico_texto_principal}
   Emoções que trata: ${JSON.stringify(oleo.psico_emocoes_negativas)}
   Propriedades positivas: ${JSON.stringify(oleo.psico_propriedades_positivas)}
`).join('\n')}

PARA ANÁLISE EMOCIONAL, RESPONDA:
{
  "tipo": "psicoaromaterapia",
  "sentimento_detectado": "categoria emocional",
  "sugestoes": [
    {
      "slug": "slug-exato-do-oleo",
      "nome": "Nome exato do óleo",
      "beneficios": "Como este óleo específico ajuda emocionalmente",
      "compatibilidade": 95
    }
  ]
}`;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Resposta inesperada da IA');
    }

    const resultado = JSON.parse(content.text);
    
    console.log(`[AI-SUGESTOES] ✅ IP ${ip} - Resposta gerada com sucesso`);
    console.log(`[AI-SUGESTOES] Tokens usados: ${response.usage.input_tokens + response.usage.output_tokens}`);

    return res.status(200).json(resultado);

  } catch (error) {
    console.error(`[AI-SUGESTOES] ❌ IP ${ip} - Erro:`, error);
    
    // Erro de rate limit da Anthropic
    if (error.status === 429) {
      return res.status(503).json({ 
        error: 'Serviço temporariamente indisponível. Tente novamente em alguns minutos.',
        code: 'ANTHROPIC_RATE_LIMIT'
      });
    }

    // Erro de budget da Anthropic
    if (error.status === 402) {
      console.error('[AI-SUGESTOES] 🚨 LIMITE DE GASTOS ATINGIDO NA ANTHROPIC!');
      return res.status(503).json({ 
        error: 'Serviço temporariamente indisponível.',
        code: 'BUDGET_EXCEEDED'
      });
    }

    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
