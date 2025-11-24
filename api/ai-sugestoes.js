import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Apenas POST permitido' });
  }

  try {
    const { sentimento, oleos } = req.body;

    if (!sentimento?.trim()) {
      return res.status(400).json({ error: 'Sentimento obrigatorio' });
    }

    if (!oleos || oleos.length === 0) {
      return res.status(400).json({ error: 'Lista de oleos obrigatoria' });
    }

    const prompt = `Voce e um especialista em psicoaromaterapia.

SITUACAO: O usuario se sente "${sentimento}"

OLEOS DISPONIVEIS:
${oleos.map((oleo, i) => `
${i + 1}. ${oleo.nome} (slug: ${oleo.slug}):
   Descricao: ${oleo.psico_texto_principal}
   Emocoes que trata: ${JSON.stringify(oleo.psico_emocoes_negativas)}
   Propriedades positivas: ${JSON.stringify(oleo.psico_propriedades_positivas)}
`).join('\n')}

TAREFA:
1. Analise o sentimento profundamente
2. Sugira os 3 MELHORES oleos para ajudar
3. Explique POR QUE cada um ajuda especificamente

RESPONDA EXATAMENTE NESTE JSON:
{
  "sentimento_detectado": "nome da categoria emocional detectada",
  "sugestoes": [
    {
      "slug": "slug-exato-do-oleo",
      "nome": "Nome exato do oleo",
      "beneficios": "Explicacao clara de como este oleo especifico ajuda esta situacao",
      "compatibilidade": 95
    }
  ]
}

IMPORTANTE: Use APENAS oleos da lista. Use slugs EXATOS. Maximo 3 sugestoes.`;

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
