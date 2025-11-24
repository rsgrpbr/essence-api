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
    const { sentimento, oleos } = req.body || {};
    
    if (!sentimento?.trim()) {
      return res.status(400).json({ error: 'Sentimento obrigatorio' });
    }
    
    // DETECÇÃO SIMPLES DE SINTOMAS FÍSICOS
    const sintomasFisicos = ['dor de cabeca', 'febre', 'gripe', 'dor nas costas', 'nausea', 'tosse', 'dor muscular', 'enxaqueca', 'cefaleia'];
    const sentimentoLower = sentimento.toLowerCase();
    
    // Se contém APENAS sintomas físicos e NÃO contém palavras emocionais
    const temSintomaFisico = sintomasFisicos.some(sintoma => sentimentoLower.includes(sintoma));
    const palavrasEmocionais = ['ansioso', 'estressado', 'nervoso', 'preocupado', 'triste', 'me sinto', 'sinto', 'estou'];
    const temEmocao = palavrasEmocionais.some(emocao => sentimentoLower.includes(emocao));
    
    if (temSintomaFisico && !temEmocao) {
      return res.status(200).json({
        tipo: "sintoma_fisico",
        mensagem: "Para sintomas físicos, consulte a seção 'Óleos' do app onde pode buscar por categorias específicas.",
        sugestao_busca: "Explore nossa biblioteca de óleos por categoria: dor, sistema imunológico, digestão."
      });
    }
    
    // Tentar IA, se falhar usar fallback
    try {
      const { Anthropic } = await import('@anthropic-ai/sdk');
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      
      const prompt = `Analise: "${sentimento}". Responda JSON: {"tipo":"psicoaromaterapia","sentimento_detectado":"categoria","sugestoes":[{"slug":"lavender","nome":"Lavender","beneficios":"Promove calma e relaxamento","compatibilidade":90}]}`;
      
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        temperature: 0.3,
        messages: [{ role: "user", content: prompt }]
      });
      
      const resultado = JSON.parse(response.content[0].text);
      return res.status(200).json(resultado);
      
    } catch (aiError) {
      // FALLBACK GARANTIDO
      return res.status(200).json({
        tipo: "psicoaromaterapia",
        sentimento_detectado: "Bem-estar geral",
        sugestoes: [
          {
            slug: "lavender",
            nome: "Lavender",
            beneficios: "Promove calma e relaxamento profundo",
            compatibilidade: 85
          }
        ]
      });
    }
    
  } catch (error) {
    // FALLBACK FINAL
    return res.status(200).json({
      tipo: "psicoaromaterapia", 
      sentimento_detectado: "Suporte emocional",
      sugestoes: [
        {
          slug: "balance",
          nome: "Balance",
          beneficios: "Auxilia no equilíbrio emocional",
          compatibilidade: 80
        }
      ]
    });
  }
}
