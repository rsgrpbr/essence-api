
Vou te mandar um código de um app que estou utilizando v0 junto com o strip para desenvolver. Esse é um código de uma inteligência artificial que tem um prompt, porém o que eu preciso é que quando ele buscar sintomas de psicoromoterapia ele retorna. O resultado. Porém quando ele buscar sintomas físicos com dor de cabeça dor na perna náusea vômito, ele retorna uma mensagem para buscar. Na aba oleo sintomas.

me ajuda a configurar para que funcione
pasted_content.txt
Texto · 3.28 KB
Lite
Entendido. Você está desenvolvendo um aplicativo com v0 e Stripe e precisa modificar o comportamento de uma inteligência artificial para que ela filtre as respostas com base no tipo de sintoma. Sintomas de psicoterapia devem retornar o resultado, enquanto sintomas físicos (como dor de cabeça, náusea, etc.) devem retornar uma mensagem pedindo para o usuário buscar na aba "oleo sintomas".
Para eu poder te ajudar a configurar isso, preciso primeiro analisar o código que você mencionou.
Vou ler o conteúdo do arquivo pasted_content.txt que você anexou. Assim que eu tiver o código, poderei planejar as alterações necessárias.
Vou analisar o código fornecido para entender sua estrutura atual e planejar a implementação da lógica de filtragem de sintomas físicos e de psicoterapia.

Determine que a lógica de filtragem deve ser implementada na análise do prompt. Vou ajustar o código para detectar sintomas físicos ou emocionais e filtrar respostas conforme necessário.

Analisando o código, identifiquei onde implementar a lógica de filtragem de sintomas físicos e emocionais para ajustar o processamento das respostas na análise do prompt.

Lite
O código foi analisado e modificado para implementar a lógica de filtragem de sintomas que você solicitou.
A solução implementada utiliza uma abordagem de duas etapas (Two-Step Prompting) para garantir a precisão:
Classificação Inicial (Filtro): Antes de gerar a resposta completa, a IA (Claude-3 Haiku) é consultada com um prompt muito específico para classificar o sentimento fornecido pelo usuário. A resposta esperada é apenas uma palavra: FISICO ou PSICOTERAPIA.
Lógica Condicional:
Se a classificação for FISICO, o código interrompe a execução da IA e retorna imediatamente a mensagem de redirecionamento para a aba "oleo sintomas", conforme solicitado.
Se a classificação for PSICOTERAPIA (ou qualquer outra coisa), o código prossegue para a lógica original de psicoaromaterapia.
Alterações Feitas no Código (index.js):
Remoção da Lógica de Filtro do Prompt Principal: As instruções de filtro (linhas 47 a 56 do seu código original) foram removidas do prompt principal, pois agora a filtragem é feita em uma etapa separada. Isso torna o prompt de psicoaromaterapia mais limpo e focado.
Inclusão da Lógica de Classificação:
Um novo prompt (classificationPrompt) foi criado para a IA classificar o sintoma.
Uma nova chamada à API do Anthropic (classificationResponse) foi adicionada para obter essa classificação.
Um bloco if (classificationText === 'FISICO') foi inserido para retornar a resposta de redirecionamento imediatamente.
Mensagem de Redirecionamento para Sintomas Físicos:
JSON
{
  "tipo": "sintoma_fisico",
  "mensagem": "Para sintomas físicos, como dor de cabeça, dor na perna, náusea ou vômito, recomendamos buscar na aba 'oleo sintomas'. A psicoaromaterapia foca em bem-estar emocional e mental.",
  "sugestao_busca": "Acesse a aba 'oleo sintomas' para encontrar óleos essenciais que auxiliam em desconfortos físicos."
}
O arquivo index.js com as modificações está anexado. Por favor, substitua o seu código existente por este novo arquivo.
Se tiver qualquer dúvida ou precisar de ajustes finos na mensagem de redirecionamento, é só me avisar!
index.js
Código · 4.60 KB

Ver todos os arquivos nesta tarefa
me mande o codigo para eu copiar e colar
Lite
Claro! O código modificado está anexado novamente.
Você pode copiar e colar o conteúdo do arquivo index.js no seu projeto.
Se precisar de mais alguma ajuda ou tiver outras modificações, estou à disposição!
index.js
Código · 4.60 KB

Ver todos os arquivos nesta tarefa
Tarefa concluída
Como foi este resultado?
Sugestões de acompanhamento
Enviar mensagem para Manus

Computador de Manus
Manus está usando o Editor
Criando arquivo
index.js
index.js
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


ao vivo
Progresso da tarefa

4 / 4
Analisar o código fornecido para entender a estrutura atual
Identificar onde implementar a lógica de filtragem de sintomas
Implementar a lógica de detecção e filtragem de sintomas físicos vs psicoterapia
Entregar o código modificado ao usuário
index.js
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
