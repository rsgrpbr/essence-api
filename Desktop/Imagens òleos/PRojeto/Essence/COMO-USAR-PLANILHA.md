# Como Usar a Planilha de Óleos Essenciais

## Passo a Passo

1. **Baixe o template**: Abra o arquivo `public/template-oleos.csv`
2. **Edite no Excel ou Google Sheets**: Abra o arquivo e edite conforme necessário
3. **Salve como CSV**: Importante manter o formato CSV (separado por vírgulas)
4. **Envie no chat**: Anexe o arquivo aqui e peça "Atualiza os óleos com esta planilha"

## Estrutura das Colunas

### Campos Obrigatórios

- **slug**: Nome do arquivo sem espaços (ex: `lavender`, `on-guard`, `deep-blue`)
- **nome**: Nome exibido do óleo (ex: `Lavender`, `On Guard®`)
- **categorias**: Kits separados por vírgula (ex: `Living Brasil,AromaTouch`)
- **nota**: Descrição curta do óleo
- **tags**: Palavras-chave separadas por vírgula para busca
- **dicasUso**: Categorias e dicas formatadas (veja formato abaixo)
- **cor**: Cor da borda em hexadecimal (ex: `#9370DB`)
- **formasUso**: Códigos separados por vírgula: `A` (Aromático), `T` (Tópico), `N` (Neat/Puro), `S` (Sensível), `I` (Interno)
- **origem**: País ou região de origem
- **aroma**: Descrição do aroma
- **psicoaromaterapia**: Benefícios emocionais/psicológicos
- **composicao**: Óleos componentes separados por vírgula (ex: `Lavandula angustifolia` ou `Wild Orange, Clove, Cinnamon Bark`)

### Formato das Dicas de Uso

Use o seguinte formato para `dicasUso`:
```
CATEGORIA 1: Dica 1; Dica 2; Dica 3. | CATEGORIA 2: Dica 1; Dica 2.
```

**Exemplo:**
```
ALERGIAS CAUSADAS POR PICADAS DE INSETOS: Aplicar puro local como um antialérgico natural. | CÓLICA E BEBÊ IRRITADO: Aplicar diluído no abdômen; Aplicar na coluna vertebral.
```

**Regras:**
- Categorias em MAIÚSCULAS seguidas de `:`
- Dicas separadas por `;` (ponto e vírgula)
- Categorias separadas por ` | ` (pipe com espaços)

### Kits Disponíveis

- `Living Brasil`
- `Kids`
- `Emotional`
- `AromaTouch`
- `Beauty Power`
- `Extras`

### Códigos de Formas de Uso

- `A` = Aromático (difusor, inalação)
- `T` = Tópico (aplicação na pele)
- `N` = Neat/Puro (pode aplicar sem diluir)
- `S` = Sensível (requer diluição obrigatória)
- `I` = Interno (ingestão)

## Dicas

- **Composição**: Para óleos únicos (single oils), coloque o nome científico. Para blends, liste os óleos componentes separados por vírgula.
- **Cores**: Use um seletor de cores online para escolher cores em hexadecimal
- **Imagens**: Nomeie as imagens com o mesmo `slug` (ex: `lavender.jpg`)
- **Aspas**: Se um campo contém vírgulas, coloque entre aspas duplas (ex: `"Living Brasil,Kids"`)

## Exemplo Completo

```csv
slug,nome,categorias,nota,tags,dicasUso,cor,formasUso,origem,aroma,psicoaromaterapia,composicao
lavender,Lavender,"Living Brasil,AromaTouch","Calmante e suporte ao sono.","lavanda,relaxamento,sono","SONO: Difundir à noite; Aplicar nos pés. | ANSIEDADE: Inalar diretamente; Aplicar nos pulsos.",#9370DB,"A,T,N,I",Bulgária,"Floral suave e herbáceo","Acalma a mente e promove sono tranquilo.",Lavandula angustifolia
```

## Suporte

Se tiver dúvidas, pergunte no chat!
