export default async function handler(req, res) {
  // CORS Headers mais simples e funcionais
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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

    const prompt = `Voce e um DETECTOR que decide entre sintomas fisicos ou psicoaromaterapia.

ENTRADA: "${sentimento}"

SE APENAS SINTOMA FISICO (dor cabeca, febre, gripe, dor costas) SEM emocao, RESPONDA:
{
  "tipo": "sintoma_fisico",
  "mensagem": "Para sintomas físicos, consulte a seção 'Óleos' do app onde pode buscar por categorias específicas.",
  "sugestao": "Explore nossa biblioteca completa de óleos essenciais para encontrar soluções naturais."
}

SE CONTEM EMOCAO (ansioso, estressado, me sinto, nervoso), RESPONDA:
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

OLEOS DISPONIVEIS:
${oleos.map((oleo, i) => `${i + 1}. ${oleo.nome} (${oleo.slug}): ${oleo.psico_texto_principal}`).join('\n')}`;

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
