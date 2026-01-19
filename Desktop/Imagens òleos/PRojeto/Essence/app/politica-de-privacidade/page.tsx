import Link from "next/link"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"

export default function PoliticaDePrivacidadePage() {
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
            Política de Privacidade
          </h1>
          <p className="text-sm text-emerald-600 mb-8">
            Última atualização: Dezembro de 2024
          </p>

          {/* Seção 1 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              1. Introdução
            </h2>
            <p className="text-gray-700 leading-relaxed">
              A privacidade dos nossos usuários é fundamental para o Essence App. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei 13.709/2018).
            </p>
          </section>

          {/* Seção 2 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              2. Informações que Coletamos
            </h2>
            
            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              2.1 Informações Fornecidas por Você
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li><strong>Dados de Cadastro:</strong> nome, e-mail, senha (criptografada)</li>
              <li><strong>Consultas:</strong> perguntas e interações com o sistema de IA</li>
              <li><strong>Preferências:</strong> óleos favoritos, histórico de buscas</li>
              <li><strong>Dados de Pagamento:</strong> processados exclusivamente pelo Stripe (não armazenamos dados de cartão)</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              2.2 Informações Coletadas Automaticamente
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li><strong>Dados de Uso:</strong> páginas visitadas, funcionalidades utilizadas, tempo de sessão</li>
              <li><strong>Dados Técnicos:</strong> tipo de dispositivo, sistema operacional, navegador, endereço IP</li>
              <li><strong>Cookies:</strong> para melhorar a experiência e manter sua sessão</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              2.3 Informações que NÃO Coletamos
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Não solicitamos dados sensíveis de saúde detalhados</li>
              <li>Não compartilhamos informações pessoais com terceiros para marketing</li>
              <li>Não vendemos seus dados</li>
            </ul>
          </section>

          {/* Seção 3 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              3. Como Usamos Suas Informações
            </h2>
            
            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              3.1 Prestação do Serviço
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Criar e gerenciar sua conta</li>
              <li>Fornecer recomendações personalizadas de aromaterapia</li>
              <li>Processar consultas com IA</li>
              <li>Gerenciar assinaturas e pagamentos</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              3.2 Melhoria do Serviço
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Analisar padrões de uso para melhorar funcionalidades</li>
              <li>Desenvolver novos recursos</li>
              <li>Corrigir bugs e problemas técnicos</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              3.3 Comunicação
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Enviar atualizações importantes sobre o serviço</li>
              <li>Responder suas solicitações de suporte</li>
              <li>Notificar sobre mudanças nos Termos ou Política de Privacidade</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              3.4 Segurança
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Detectar e prevenir fraudes</li>
              <li>Proteger contra uso inadequado do serviço</li>
              <li>Garantir a segurança da plataforma</li>
            </ul>
          </section>

          {/* Seção 4 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              4. Base Legal para Processamento (LGPD)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Processamos seus dados com base em:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Execução de contrato:</strong> para fornecer o serviço contratado</li>
              <li><strong>Consentimento:</strong> quando você aceita estes termos</li>
              <li><strong>Legítimo interesse:</strong> para melhorar o serviço e prevenir fraudes</li>
              <li><strong>Obrigação legal:</strong> quando exigido por lei</li>
            </ul>
          </section>

          {/* Seção 5 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              5. Compartilhamento de Informações
            </h2>
            
            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              5.1 Provedores de Serviço
            </h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              Compartilhamos dados apenas com parceiros essenciais:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li><strong>Supabase:</strong> hospedagem do banco de dados (servidores seguros)</li>
              <li><strong>Stripe:</strong> processamento de pagamentos (PCI-DSS compliant)</li>
              <li><strong>Anthropic:</strong> processamento de consultas de IA</li>
              <li><strong>Vercel:</strong> hospedagem da aplicação</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              5.2 Requisitos Legais
            </h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              Podemos divulgar informações se:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Exigido por lei ou ordem judicial</li>
              <li>Necessário para proteger direitos e segurança</li>
              <li>Em caso de fusão ou aquisição da empresa</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              5.3 Nunca Compartilhamos
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Não vendemos dados para terceiros</li>
              <li>Não compartilhamos para publicidade direcionada</li>
              <li>Não fornecemos listas de contatos</li>
            </ul>
          </section>

          {/* Seção 6 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              6. Armazenamento e Segurança
            </h2>
            
            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              6.1 Medidas de Segurança
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
              <li>Criptografia de senhas (hash bcrypt)</li>
              <li>Autenticação segura via Supabase Auth</li>
              <li>Firewalls e proteção contra ataques</li>
              <li>Backups regulares dos dados</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              6.2 Localização dos Dados
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Dados armazenados em servidores seguros</li>
              <li>Infraestrutura com certificações de segurança</li>
              <li>Conformidade com padrões internacionais</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              6.3 Retenção de Dados
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Mantemos seus dados enquanto sua conta estiver ativa</li>
              <li>Após exclusão da conta: dados removidos em até 90 dias</li>
              <li>Dados de pagamento: retidos conforme exigências fiscais</li>
            </ul>
          </section>

          {/* Seção 7 - LGPD */}
          <section className="mb-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h2 className="text-2xl font-semibold text-blue-900 mb-4">
              7. Seus Direitos (LGPD)
            </h2>
            <p className="text-blue-900 mb-4">Você tem direito a:</p>
            
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              7.1 Acesso e Portabilidade
            </h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4 mb-4">
              <li>Solicitar cópia dos seus dados</li>
              <li>Exportar informações em formato estruturado</li>
            </ul>

            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              7.2 Correção
            </h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4 mb-4">
              <li>Atualizar dados incorretos ou incompletos</li>
              <li>Corrigir informações desatualizadas</li>
            </ul>

            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              7.3 Exclusão
            </h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4 mb-4">
              <li>Solicitar exclusão da sua conta e dados</li>
              <li>Direito ao esquecimento (exceto quando obrigados a manter por lei)</li>
            </ul>

            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              7.4 Oposição e Limitação
            </h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4 mb-4">
              <li>Opor-se a certos processamentos</li>
              <li>Limitar como usamos seus dados</li>
            </ul>

            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              7.5 Revogação de Consentimento
            </h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1 ml-4 mb-4">
              <li>Retirar consentimento a qualquer momento</li>
              <li>Pode afetar o funcionamento de alguns recursos</li>
            </ul>

            <p className="text-blue-900 font-semibold">
              Para exercer seus direitos, entre em contato:{" "}
              <a href="mailto:suporte@essenceapp.com.br" className="underline">
                suporte@essenceapp.com.br
              </a>
            </p>
          </section>

          {/* Seção 8 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              8. Cookies e Tecnologias Similares
            </h2>
            
            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              8.1 Tipos de Cookies
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li><strong>Essenciais:</strong> necessários para funcionamento básico</li>
              <li><strong>Funcionais:</strong> melhoram a experiência do usuário</li>
              <li><strong>Analíticos:</strong> ajudam a entender como o app é usado</li>
            </ul>

            <h3 className="text-xl font-semibold text-emerald-700 mb-3">
              8.2 Gerenciamento
            </h3>
            <p className="text-gray-700 leading-relaxed">
              Você pode gerenciar cookies através das configurações do navegador, mas isso pode afetar funcionalidades do aplicativo.
            </p>
          </section>

          {/* Seção 9 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              9. Privacidade de Menores
            </h2>
            <p className="text-gray-700 leading-relaxed">
              O Essence não é direcionado a menores de 18 anos. Se tomarmos conhecimento de que coletamos dados de menores sem autorização parental, excluiremos tais informações imediatamente.
            </p>
          </section>

          {/* Seção 10 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              10. Transferência Internacional de Dados
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Alguns de nossos provedores de serviço podem estar localizados fora do Brasil. Garantimos que tais transferências atendem aos requisitos da LGPD através de:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Cláusulas contratuais padrão</li>
              <li>Certificações de segurança</li>
              <li>Conformidade com regulamentações internacionais</li>
            </ul>
          </section>

          {/* Seção 11 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              11. Alterações nesta Política
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Podemos atualizar esta Política periodicamente. Mudanças significativas serão notificadas através de:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Email para usuários cadastrados</li>
              <li>Aviso destacado no aplicativo</li>
              <li>Atualização da data no topo deste documento</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              O uso continuado após as alterações constitui aceitação da nova política.
            </p>
          </section>

          {/* Seção 12 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              12. Encarregado de Dados (DPO)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              Para questões sobre privacidade e proteção de dados:
            </p>
            <ul className="list-none text-gray-700 space-y-1 ml-4">
              <li><strong>Email:</strong> privacidade@essenceapp.com.br</li>
              <li><strong>Encarregado:</strong> João Henrique Cardoso</li>
              <li><strong>Resposta:</strong> até 15 dias úteis</li>
            </ul>
          </section>

          {/* Seção 13 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              13. Autoridade de Controle
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              Você pode registrar reclamações junto à Autoridade Nacional de Proteção de Dados (ANPD):
            </p>
            <ul className="list-none text-gray-700 space-y-1 ml-4">
              <li>
                <strong>Website:</strong>{" "}
                <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                  https://www.gov.br/anpd
                </a>
              </li>
              <li><strong>Ouvidoria ANPD</strong> para reclamações formais</li>
            </ul>
          </section>

          {/* Seção 14 */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">
              14. Contato
            </h2>
            <p className="text-gray-700 leading-relaxed mb-2">
              Para dúvidas sobre esta Política de Privacidade:
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
              Ao usar o Essence App, você declara ter lido, compreendido e concordado com esta Política de Privacidade.
            </p>
          </div>
        </div>

        {/* Links de navegação */}
        <div className="mt-8 text-center">
          <Link 
            href="/termos-de-uso" 
            className="text-emerald-600 hover:text-emerald-700 hover:underline font-semibold"
          >
            ← Ver Termos de Uso
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
