# Configuração do Stripe

Este guia explica como configurar as variáveis de ambiente do Stripe para funcionar tanto localmente quanto em produção.

## Desenvolvimento Local

1. Copie o arquivo `.env.local.example` para `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. As chaves já estão preenchidas no arquivo `.env.local.example`

3. Execute o projeto:
   ```bash
   npm run dev
   ```

## Produção (Vercel)

Para configurar no ambiente de produção da Vercel:

### Opção 1: Via Dashboard da Vercel

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto "v0-aroma-harmony-guide"
3. Vá em **Settings** > **Environment Variables**
4. Adicione as seguintes variáveis:

   **STRIPE_SECRET_KEY**
   ```
   sk_test_51SRCp3AdGFZXrHuvNve3SBsjO5DXorOft5vSMN1TLjeY2vtFQiZ0b8VYI8EgpBqGiCV0ZjRuvq3EEHHArXjM0UlJ00v5JvzljhNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   ```
   
   **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY**
   ```
   pk_test_51SRCp3AdGFZXrHuvKY9dTdLBaxsim2CiiEvB9SOmQ49Iuux3Hif6pAcAwBKz5K6LrpRyVpq9g1zZwrHrgZj0ZE6k00njmkU1qy
   ```
   
   **NEXT_PUBLIC_URL**
   ```
   https://v0-aroma-harmony-guide.vercel.app
   ```

5. Clique em **Save** e faça um novo deploy

### Opção 2: Via CLI da Vercel

```bash
vercel env add STRIPE_SECRET_KEY
# Cole a chave quando solicitado

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
# Cole a chave quando solicitado

vercel env add NEXT_PUBLIC_URL
# Digite: https://v0-aroma-harmony-guide.vercel.app
```

## Testando a Integração

1. Acesse `/checkout` no seu app
2. Clique em "Assinar" em um dos planos
3. Você será redirecionado para o Stripe Checkout
4. Use um cartão de teste do Stripe:
   - Número: `4242 4242 4242 4242`
   - Data: Qualquer data futura
   - CVC: Qualquer 3 dígitos
   - CEP: Qualquer CEP válido

## Mudando para Produção

Quando estiver pronto para receber pagamentos reais:

1. Acesse seu [Dashboard do Stripe](https://dashboard.stripe.com/)
2. Ative sua conta (complete as informações bancárias)
3. Obtenha as chaves de **produção** (começam com `sk_live_` e `pk_live_`)
4. Substitua as variáveis de ambiente na Vercel pelas chaves de produção
5. Faça um novo deploy

## Planos Disponíveis

Os Price IDs configurados são:
- **Mensal (R$ 14,90)**: `price_1QmPwqAdGFZXrHuvFPD7CbsI`
- **Anual (R$ 125,00)**: `price_1QmPxIAdGFZXrHuvNVzGvMcU`

Se precisar alterar os preços ou criar novos planos, faça isso no Dashboard do Stripe e atualize os Price IDs em `app/checkout/page.tsx`.

## Problemas Comuns

### "STRIPE_SECRET_KEY is not configured"
- Verifique se a variável está corretamente configurada na Vercel
- Faça um novo deploy após adicionar as variáveis

### "An unknown error occurred"
- Verifique os logs da Vercel em **Deployments** > **Functions**
- Confirme que todas as 3 variáveis estão configuradas
- Certifique-se de que as chaves são válidas no Dashboard do Stripe

### Redirect não funciona
- Verifique se `NEXT_PUBLIC_URL` está correto
- Certifique-se de incluir `https://` na URL de produção
