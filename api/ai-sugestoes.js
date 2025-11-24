export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '[https://www.essenceapp.com.br](https://www.essenceapp.com.br)');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({ 
      message: 'API da Essence funcionando!',
      status: 'online'
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

    // --- PROMPT DO SISTEMA (REGRAS) ---
    const systemPrompt = `Você é uma API JSON estrita para um app de Psicoaromaterapia.
    Sua ÚNICA função é classificar a entrada do usuário e retornar JSON.

    REGRAS DE CLASSIFICAÇÃO:
    1. SINTOMAS FÍSICOS (GATILHO DE BLOQUEIO):
       Se o texto contiver queixas puramente físicas como: "dor de cabeça", "dor na perna", "náusea", "vômito", "enjoo", "febre", "gripe", "ferida", "queimadura".
       -> Você DEVE retornar o JSON de redirecionamento.
       -> NÃO tente analisar o emocional por trás de um vômito ou dor aguda.

    2. PSICOAROMATERAPIA (EMOCIONAL):
       Se o texto contiver: "ansiedade", "tristeza", "medo", "estresse", "cansaço mental", "falta de foco", ou dores com fundo emocional claro (ex: "dor de cabeça de tanto estresse").
       -> Você deve realizar a análise dos óleos.

    FORMATO DE RESPOSTA OBRIGATÓRIO (JSON PURO SEM MARKDOWN):
    
    CASO 1 (FÍSICO):
    {
      "tipo": "sintoma_fisico",
      "mensagem": "Identificamos que você está buscando ajuda para sintomas físicos (como dores, náuseas ou inflamações).",
      "acao": "redirecionar_aba_sintomas",
      "texto_botao": "Ir para Guia de Sintomas Físicos"
    }

    CASO 2 (EMOCIONAL):
    {
      "tipo": "psicoaromaterapia",
      "sentimento_detectado": "Resumo curto do sentimento",
      "sugestoes": [
         { "slug": "...", "nome": "...", "beneficios": "...", "compatibilidade": 90 }
      ]
    }`;

    // --- DADOS PARA O PROMPT DO USUÁRIO ---
    const userMessage = `
    CONTEXTO DOS ÓLEOS DISPONÍVEIS NO BANCO:
    ${oleos.map((oleo) => `${oleo.nome} (${oleo.slug}): ${oleo.psico_texto_principal}`).join(' | ')}

    ENTRADA DO USUÁRIO PARA ANALISAR:
    "${sentimento}"
    `;

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1000,
      temperature: 0.0, // Temperatura zero para ser mais lógico e menos criativo
      system: systemPrompt, // Movemos as regras para o sistema
      messages: [{ role: "user", content: userMessage }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Resposta inesperada da IA');
    }

    // Função de limpeza para garantir que o JSON venha limpo (remove ```json ... ```)
    const cleanJson = (text) => {
      return text.replace(/```json\n?|```/g, '').trim();
    };

    let resultado;
    try {
        resultado = JSON.parse(cleanJson(content.text));
    } catch (e) {
        console.error("Erro ao fazer parse do JSON da IA:", content.text);
        // Fallback se a IA falhar no JSON
        return res.status(500).json({ error: "Erro na formatação da resposta da IA." });
    }

    return res.status(200).json(resultado);

  } catch (error) {
    console.error('Erro:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message
    });
  }
}
