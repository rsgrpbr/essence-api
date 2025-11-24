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

PRIMEIRA ANALISE - DETECCAO DE TIPO:
Se a mensagem menciona APENAS sintomas fisicos ou dores corporais SEM contexto emocional, como:
- "dor de cabeca", "enxaqueca", "cefaleia"
- "dor nas costas", "dor muscular", "dor no pescoco"
- "febre", "gripe", "resfriado", "tosse"
- "dor de barriga", "nausea", "digestao"
- "insonia" (apenas o sintoma, sem mencionar ansiedade/estresse)

RESPONDA APENAS:
{
  "tipo": "sintoma_fisico",
  "mensagem": "Para sintomas físicos, recomendamos buscar na seção 'Óleos' do app por categorias como dor, sistema imunológico ou digestão.",
  "sugestao": "A psicoaromaterapia foca em bem-estar emocional. Para sintomas físicos, explore nossa biblioteca de óleos."
}

SEGUNDA ANALISE - PSICOAROMATERAPIA:
Se menciona emocoes, sentimentos, estados mentais OU sintomas fisicos COM contexto emocional, como:
- "ansioso", "estressado", "triste", "nervoso"
- "dor de cabeca por estresse", "insonia por ansiedade"
- "me sinto...", "estou preocupado", "tenho medo"

RESPONDA:
{
  "tipo": "psicoaromaterapia",
  "sentimento_detectado": "categoria emocional detectada",
  "sugestoes": [
    {
      "slug": "slug-exato-do-oleo",
      "nome": "Nome exato do oleo",
      "beneficios": "Como este oleo especifico ajuda emocionalmente",
      "compatibilidade": 95
    }
  ]
}

OLEOS DISPONIVEIS PARA PSICOAROMATERAPIA:
${oleos.map((oleo, i) => `
${i + 1}. ${oleo.nome} (slug: ${oleo.slug}):
   Descricao: ${oleo.psico_texto_principal}
   Emocoes que trata: ${JSON.stringify(oleo.psico_emocoes_negativas)}
   Propriedades positivas: ${JSON.stringify(oleo.psico_propriedades_positivas)}
`).join('\n')}

IMPORTANTE: Se APENAS sintoma fisico sem emocao = tipo "sintoma_fisico". Se tem emocao = tipo "psicoaromaterapia".`;

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
