import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function TermosDeUsoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/50 to-emerald-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-md border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Voltar</span>
          </Link>
          <Image src="/logo.png" alt="Essence Logo" width={50} height={50} />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border-2 border-emerald-100">
          <h1 className="text-4xl font-bold text-emerald-900 mb-2 font-serif">
            Termos de Uso
          </h1>
          <p className="text-sm text-emerald-600 mb-8">
            Última atualização: Dezembro de 2024
          </p>

          {/* Seção 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              1. Aceitação dos Termos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Ao acessar e utilizar o Essence App ("Aplicativo", "Serviço", "nós" ou "nosso"), você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não utilize o Aplicativo.
            </p>
          </section>

          {/* Seção 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              2. Descrição do Serviço
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              O Essence é um aplicativo de aromaterapia que oferece:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Informações sobre óleos essenciais e suas propriedades</li>
              <li>Consultas personalizadas com IA sobre aromaterapia</li>
              <li>Busca de sintomas e recomendações de óleos</li>
              <li>Conteúdo educacional sobre psico-aromaterapia</li>
            </ul>
          </section>

          {/* Seção 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              3. Planos e Pagamentos
            </h2>
            
            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              3.1 Plano Gratuito
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Acesso a 3 óleos essenciais</li>
              <li>30 consultas com IA por mês</li>
              <li>Conteúdo básico sobre aromaterapia</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              3.2 Plano Premium
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Acesso ilimitado a todos os óleos essenciais</li>
              <li>Consultas ilimitadas com IA</li>
              <li>Conteúdo exclusivo de psico-aromaterapia</li>
              <li>Preço: R$ 14,90/mês ou R$ 125,00/ano</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              3.3 Cobrança e Cancelamento
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Os pagamentos são processados através do Stripe</li>
              <li>Renovação automática até o cancelamento</li>
              <li>Cancelamento pode ser feito a qualquer momento através do Stripe Customer Portal</li>
              <li>Não há reembolso proporcional para períodos já pagos</li>
            </ul>
          </section>

          {/* Seção 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              4. Uso Adequado do Serviço
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Você concorda em:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Utilizar o Aplicativo apenas para fins legais e pessoais</li>
              <li>Não compartilhar suas credenciais de acesso com terceiros</li>
              <li>Não tentar violar a segurança do Aplicativo</li>
              <li>Não usar o Serviço para distribuir malware ou conteúdo prejudicial</li>
              <li>Não fazer engenharia reversa do Aplicativo</li>
            </ul>
          </section>

          {/* Seção 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              5. Propriedade Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Todo o conteúdo do Aplicativo, incluindo textos, imagens, logos, ícones e software, é protegido por direitos autorais e propriedade intelectual. Você não pode copiar, modificar, distribuir ou vender qualquer conteúdo sem autorização expressa.
            </p>
          </section>

          {/* Seção 6 - IMPORTANTE */}
          <section className="mb-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-amber-900 mb-4">
              6. Isenção de Responsabilidade Médica
            </h2>
            <p className="text-amber-900 font-bold mb-3">
              IMPORTANTE: O Essence fornece informações educacionais sobre aromaterapia e NÃO substitui orientação médica profissional.
            </p>
            <ul className="list-disc list-inside text-amber-800 space-y-2 ml-4">
              <li>As recomendações são apenas informativas</li>
              <li>Consulte sempre um profissional de saúde qualificado</li>
              <li>Não use óleos essenciais sem orientação adequada</li>
              <li>Informe seu médico sobre qualquer uso de óleos essenciais</li>
              <li>Mulheres grávidas, lactantes e crianças devem consultar profissionais antes do uso</li>
            </ul>
          </section>

          {/* Seção 7 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              7. Limitação de Responsabilidade
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              O Essence não se responsabiliza por:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Reações alérgicas ou adversas ao uso de óleos essenciais</li>
              <li>Danos indiretos, incidentais ou consequentes</li>
              <li>Perda de dados ou lucros</li>
              <li>Interrupções no serviço</li>
              <li>Erros ou imprecisões no conteúdo</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              Na máxima extensão permitida pela lei, nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses.
            </p>
          </section>

          {/* Seção 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              8. Modificações do Serviço
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Reservamos o direito de:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Modificar ou descontinuar o Serviço a qualquer momento</li>
              <li>Alterar preços mediante aviso prévio de 30 dias</li>
              <li>Atualizar funcionalidades e conteúdo</li>
              <li>Suspender contas que violem estes Termos</li>
            </ul>
          </section>

          {/* Seção 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              9. Rescisão
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Podemos suspender ou encerrar seu acesso se:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Você violar estes Termos de Uso</li>
              <li>Houver atividade fraudulenta ou ilegal</li>
              <li>Houver uso inadequado que prejudique outros usuários</li>
            </ul>
          </section>

          {/* Seção 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              10. Alterações nos Termos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos atualizar estes Termos periodicamente. Mudanças significativas serão notificadas através do Aplicativo. O uso continuado após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          {/* Seção 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              11. Lei Aplicável
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida nos tribunais brasileiros.
            </p>
          </section>

          {/* Seção 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              12. Contato
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              Para questões sobre estes Termos:
            </p>
            <ul className="list-none text-gray-700 space-y-1 ml-4">
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:suporte@essenceapp.com.br" className="text-emerald-600 hover:underline">
                  suporte@essenceapp.com.br
                </a>
              </li>
              <li>
                <strong>Website:</strong>{" "}
                <a href="https://essenceapp.com.br" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                  https://essenceapp.com.br
                </a>
              </li>
            </ul>
          </section>

          {/* Footer da seção */}
          <div className="border-t-2 border-emerald-200 pt-6 mt-8">
            <p className="text-center text-gray-600 italic">
              Ao usar o Essence App, você declara ter lido, compreendido e concordado com estes Termos de Uso.
            </p>
          </div>
        </div>

        {/* Links de navegação */}
        <div className="mt-8 text-center">
          <Link 
            href="/politica-de-privacidade" 
            className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold"
          >
            Ver Política de Privacidade →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-emerald-100 py-8 mt-12">
        <div className="max-w-3xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>© 2024 Essence App. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
