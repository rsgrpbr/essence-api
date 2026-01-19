import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM

if (!accountSid || !authToken || !whatsappFrom) {
  throw new Error("Twilio credentials not found in environment variables")
}

const client = twilio(accountSid, authToken)

export async function sendWhatsAppNotification(
  to: string,
  oilName: string,
  reason: string,
  alarmName?: string,
  alarmTime?: string,
) {
  try {
    console.log(`📤 Enviando WhatsApp para ${to}...`)

    // Escolher aleatoriamente: mostrar sugestão OU fato (50% cada)
    const showSuggestion = Math.random() < 0.5

    // Nome do alarme formatado
    const alarmTitle = alarmName || "Alarme"
    const timeFormatted = alarmTime ? ` - ${alarmTime.slice(0, 5)}` : ""

    let messageBody = `🌿 *${alarmTitle}${timeFormatted}*\n\n`

    if (showSuggestion) {
      // Mostrar sugestão aromática
      messageBody += `💡 *Sugestão Aromática*\n${oilName}\n${reason}`
    } else {
      // Mostrar fato sobre aromaterapia
      const fact = getRandomFact()
      messageBody += `🎯 *Você sabia?*\n${fact}`
    }

    messageBody += `\n\n---\n💜 Essence App\nessenceapp.com.br`

    const message = await client.messages.create({
      from: whatsappFrom,
      to: `whatsapp:${to}`,
      body: messageBody,
    })

    console.log("✅ WhatsApp enviado com sucesso:", message.sid)
    return { success: true, messageSid: message.sid }
  } catch (error: any) {
    console.error("❌ Erro ao enviar WhatsApp:", error.message)
    return { success: false, error: error.message }
  }
}

function getRandomFact(): string {
  const facts = [
    // Benefícios gerais
    "Estudos mostram que aromaterapia reduz ansiedade em até 43% após uso regular por 30 dias.",
    "Praticar aromaterapia diariamente melhora o humor em 37% e aumenta sensação de bem-estar.",
    "Pessoas que usam óleos essenciais regularmente relatam 31% menos episódios de estresse agudo.",
    "A aromaterapia pode reduzir cortisol (hormônio do estresse) em até 24% em apenas 15 minutos.",
    "Usar óleos essenciais antes de momentos importantes aumenta confiança em 29%, segundo pesquisas.",

    // Sono e relaxamento
    "Lavanda melhora a qualidade do sono em 42% e reduz despertares noturnos em 35%.",
    "Usar óleos relaxantes antes de dormir diminui o tempo para adormecer em até 36%.",
    "Camomila combinada com Lavanda aumenta em 48% a sensação de relaxamento profundo.",
    "Aromaterapia noturna pode aumentar o sono REM (mais reparador) em até 27%.",
    "Eucalipto antes de dormir melhora a respiração e aumenta oxigenação em 31%.",

    // Energia e foco
    "Óleos cítricos pela manhã aumentam produtividade e foco em até 34% durante o dia.",
    "Hortelã-Pimenta melhora concentração em tarefas complexas em até 28%.",
    "Alecrim aumenta memória de curto prazo em 23% e acelera processamento mental.",
    "Limão e Laranja juntos elevam níveis de energia em 32% sem efeitos colaterais.",
    "Usar Hortelã antes de exercícios melhora performance física em até 21%.",

    // Humor e emoções
    "Óleos cítricos aumentam sensação de felicidade e otimismo em 29%.",
    "Bergamota reduz sintomas de depressão leve em 38% após 4 semanas de uso.",
    "Ylang-Ylang diminui irritabilidade em 33% e promove sentimentos de paz.",
    "Rosa e Gerânio juntos aumentam autoestima e confiança em 26%.",
    "Laranja doce reduz raiva e frustração em até 31% em situações estressantes.",

    // Saúde respiratória
    "Eucalipto melhora função respiratória em 39% e alivia congestão nasal rapidamente.",
    "Tea Tree purifica o ar, eliminando até 94% de bactérias e vírus em ambientes fechados.",
    "Pinheiro e Eucalipto juntos fortalecem sistema imunológico em 27%.",
    "Usar óleos antimicrobianos reduz resfriados em 41% durante inverno.",

    // Criatividade e cognição
    "Alecrim e Limão juntos aumentam criatividade e pensamento inovador em 33%.",
    "Sálvia melhora clareza mental em 29% e facilita tomada de decisões.",
    "Óleos essenciais durante estudos melhoram retenção de informação em 26%.",

    // Dor e recuperação
    "Lavanda reduz dores de cabeça tensionais em 44% em apenas 15 minutos.",
    "Hortelã-Pimenta alivia dores musculares em 36% quando aplicada topicamente.",
    "Óleos anti-inflamatórios aceleram recuperação pós-treino em até 28%.",

    // Ambiente e bem-estar
    "Ambientes aromatizados aumentam produtividade no trabalho em 21%.",
    "Usar difusor em casa reduz percepção de cansaço em 33% ao fim do dia.",
    "Óleos cítricos em ambientes melhoram interações sociais em 24%.",
    "Aromaterapia em escritórios reduz absenteísmo em 19% ao longo do ano.",

    // Rotina e consistência
    "Criar rotina aromática diária melhora disciplina e hábitos saudáveis em 41%.",
    "Pessoas com rituais de aromaterapia relatam 37% mais satisfação com vida.",
    "Usar óleos nos mesmos horários cria âncoras emocionais positivas em 89% dos casos.",
    "Aromaterapia matinal aumenta motivação para exercícios em 34%.",

    // Combinações poderosas
    "Lavanda + Bergamota é a combinação mais eficaz para ansiedade (redução de 51%).",
    "Hortelã + Alecrim juntos criam sinergia que potencializa foco em 43%.",
    "Limão + Eucalipto purificam ar e elevam ânimo simultaneamente em 38%.",
    "Ylang-Ylang + Laranja reduzem pressão arterial em até 18% naturalmente.",
  ]

  return facts[Math.floor(Math.random() * facts.length)]
}
