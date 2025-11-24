export default async function handler(req, res) {
  // CORS Headers
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
    
    // Construir lista de óleos de forma mais segura
    const oleosTexto = oleos.map((oleo, i) => {
      return `${i + 1}. ${oleo.nome || 'Nome indefinido'} (${oleo.slug || 'slug'}): ${oleo.psico_texto_principal || 'Descrição não disponível'}`;
    }).join('\n');
    
    const prompt = `DETECTOR: Analise se e SINTOMA FISICO puro ou EMOCIONAL.

ENTRADA: "${sentimento}"

REGRA RIGOROSA:
Se menciona SOMENTE sintomas corporais SEM palavras emocionais:
- "dor de cabeca" 
- "febre"
- "gripe" 
- "dor nas costas"
- "nausea"

RESPONDA:
{
  "tipo": "sintoma_fisico",
  "mensagem": "Para sintomas físicos, consulte a seção Óleos do app onde pode buscar por categorias específicas.",
  "sugestao_busca": "Explore nossa biblioteca de óleos por categoria: dor, sistema imunológico, digestão."
}

Se menciona QUALQUER emocao:
- "ansioso", "estressado", "nervoso"
- "me sinto", "preocupado", "triste"  
- "dor de cabeca por estresse"

RESPONDA:
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
${oleosTexto}`;

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
    console.error('Erro completo:', error);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message,
      stack: error.stack
    });
  }
}
