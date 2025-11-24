export default async function handler(req, res) {
  // CORS Headers - permitir domínio específico
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://www.essenceapp.com.br');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'API da Essence funcionando!',
      status: 'online',
      version: '1.0'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Apenas POST permitido' });
  }

  try {
    // Importar Anthropic dinamicamente
    const { Anthropic } = await import('@anthropic-ai/sdk');
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const { sentimento, oleos } = req.body;

    if (!sentimento?.trim()) {
      return res.status(400).json({ error: 'Sentimento obrigatorio' });
    }

    if (!oleos || oleos.length === 0) {
      return res.status(400).json({ error: 'Lista de oleos obrigatoria' });
    }

    const prompt = `Voce e um especialista em psicoaromaterapia.

SITUACAO: O usuario se sente "${sentimento}"

IMPORTANTE - ANALISE PRIMEIRO:
1. Se a mensagem contem APENAS sintomas fisicos (dor de cabeca, febre, gripe, dor nas costas, etc.) SEM mencionar emocoes, responda:
{
  "tipo": "sintoma_fisico",
  "mensagem": "Para sintomas físicos, recomendamos consultar nosso guia de óleos por categoria. A psicoaromaterapia foca em bem-estar emocional e mental.",
  "sugestao_busca": "Experimente buscar por 'dor', 'inflamação' ou 'sistema imunológico' em nossa seção de óleos."
}

2. Se menciona emocoes OU sentimentos psicologicos (mesmo junto com sintomas), continue a analise normal.

OLEOS DISPONIVEIS:
${oleos.map((oleo, i) => `
${i + 1}. ${oleo.nome} (slug: ${oleo.slug}):
   Descricao: ${oleo.psico_texto_principal}
   Emocoes que trata: ${JSON.stringify(oleo.psico_emocoes_negativas)}
   Propriedades positivas: ${JSON.stringify(oleo.psico_propriedades_positivas)}
`).join('\n')}

PARA ANALISE EMOCIONAL, RESPONDA:
{
  "tipo": "psicoaromaterapia",
  "sentimento_detectado": "categoria emocional",
  "sugestoes": [
    {
      "slug": "slug-exato-do-oleo",
      "nome": "Nome exato do oleo",
      "beneficios": "Como este oleo especifico ajuda emocionalmente",
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
    return res.status(200).json(resultado);

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
export default async function handler(req, res) {
  // CORS Headers - permitir domínio específico
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', 'https://www.essenceapp.com.br');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'API da Essence funcionando!',
      status: 'online',
      version: '1.0'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Apenas POST permitido' });
  }

  try {
    // Importar Anthropic dinamicamente
    const { Anthropic } = await import('@anthropic-ai/sdk');
    
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const { sentimento, oleos } = req.body;

    if (!sentimento?.trim()) {
      return res.status(400).json({ error: 'Sentimento obrigatorio' });
    }

    if (!oleos || oleos.length === 0) {
      return res.status(400).json({ error: 'Lista de oleos obrigatoria' });
    }

const prompt = `Voce e um DETECTOR INTELIGENTE que decide entre sintomas fisicos ou psicoaromaterapia.

ENTRADA: "${sentimento}"

REGRA FUNDAMENTAL:
Se a mensagem menciona SOMENTE dores corporais/sintomas fisicos SEM palavras emocionais, retorne tipo "sintoma_fisico".

EXEMPLOS DE SINTOMA FISICO (sem emocao):
- "dor de cabeca"
- "febre"  
- "gripe"
- "dor nas costas"
- "nausea"
- "tosse"

EXEMPLOS DE PSICOAROMATERAPIA (com emocao):
- "ansioso"
- "estressado" 
- "dor de cabeca por estresse"
- "me sinto..."
- "preocupado"
- "nervoso"

SE APENAS SINTOMA FISICO, RESPONDA:
{
  "tipo": "sintoma_fisico", 
  "mensagem": "Para sintomas físicos, consulte a seção 'Óleos' do app onde pode buscar por categorias específicas.",
  "sugestao": "Explore nossa biblioteca completa de óleos essenciais para encontrar soluções naturais."
}

SE CONTEM EMOCAO, RESPONDA:
{
  "tipo": "psicoaromaterapia",
  "sentimento_detectado": "categoria emocional",
  "sugestoes": [
    {
      "slug": "slug-do-oleo",
      "nome": "Nome do oleo", 
      "beneficios": "Como ajuda emocionalmente",
      "compatibilidade": 90
    }
  ]
}

OLEOS PARA PSICOAROMATERAPIA:
${oleos.map((oleo, i) => `
${i + 1}. ${oleo.nome} (${oleo.slug}): ${oleo.psico_texto_principal}
Emoções: ${JSON.stringify(oleo.psico_emocoes_negativas)}
`).join('\n')

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
    return res.status(200).json(resultado);

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
