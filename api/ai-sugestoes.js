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

    // --- NOVA LÓGICA DE FILTRAGEM DE SINTOMAS ---
    // 1. Criar um prompt de classificação para a IA
    const classificationPrompt = `Analise a seguinte descrição de sentimento/sintoma: "${sentimento}".
    
    Se a descrição contiver APENAS sintomas físicos (como dor de cabeça, dor na perna, náusea, vômito, febre, gripe, dor nas costas, etc.) SEM mencionar explicitamente emoções, sentimentos ou estados psicológicos, responda APENAS com a palavra: FISICO
    
    Caso contrário (se contiver emoções, sentimentos, estados psicológicos, ou uma mistura de físico e emocional), responda APENAS com a palavra: PSICOTERAPIA`;

    const classificationResponse = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 5, // Apenas para a palavra-chave
      temperature: 0.0, // Queremos uma resposta determinística
      messages: [{ role: "user", content: classificationPrompt }],
    });

    const classificationText = classificationResponse.content[0].text.trim().toUpperCase();

    if (classificationText === 'FISICO') {
      // 2. Se for classificado como "FISICO", retorna a mensagem de redirecionamento
      return res.status(200).json({
        tipo: "sintoma_fisico",
        mensagem: "Para sintomas físicos, como dor de cabeça, dor na perna, náusea ou vômito, recomendamos buscar na aba 'oleo sintomas'. A psicoaromaterapia foca em bem-estar emocional e mental.",
        sugestao_busca: "Acesse a aba 'oleo sintomas' para encontrar óleos essenciais que auxiliam em desconfortos físicos."
      });
    }
    // --- FIM DA NOVA LÓGICA ---

    // 3. Se for classificado como "PSICOTERAPIA" (ou qualquer outra coisa que não seja "FISICO"), continua com a lógica original

    const prompt = `Voce e um especialista em psicoaromaterapia.
    
SITUACAO: O usuario se sente "${sentimento}"

IMPORTANTE - ANALISE:
1. O usuario esta buscando uma analise de psicoaromaterapia.
2. Sua resposta DEVE ser um objeto JSON que segue o formato "psicoaromaterapia" (item 2 abaixo).
3. NUNCA use o formato "sintoma_fisico" (item 1 abaixo), pois a triagem já foi feita.

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
