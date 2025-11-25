/**
 * Política de Privacidade (RGPD Compliant)
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-4 text-4xl font-bold">Política de Privacidade</h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-PT")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Introdução</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              O PRETOS MUSIC ("nós", "nosso", "aplicação") respeita a tua privacidade e está comprometido
              em proteger os teus dados pessoais. Esta política explica como recolhemos, usamos e protegemos
              as tuas informações em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD).
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>2. Dados que Recolhemos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <div>
              <h3 className="font-semibold text-foreground mb-2">2.1 Dados de Conta</h3>
              <p>
                Recolhemos informações da tua conta através do Clerk (email, nome, foto de perfil).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">2.2 Dados de Utilização</h3>
              <p>
                Armazenamos localmente no teu navegador todos os projetos, eventos e dados que crias.
                Estes dados são teus e nunca são partilhados sem o teu consentimento.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">2.3 Dados de Pagamento</h3>
              <p>
                Os dados de pagamento são processados pelo Stripe. Não armazenamos informações de cartão
                de crédito na nossa aplicação.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>3. Como Usamos os Teus Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
              <li>Para fornecer e melhorar os nossos serviços</li>
              <li>Para processar pagamentos e gerir subscrições</li>
              <li>Para comunicar contigo sobre a tua conta</li>
              <li>Para cumprir obrigações legais</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>4. Base Legal (RGPD)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Processamos os teus dados com base em:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Consentimento:</strong> Quando te inscreves e aceitas esta política</li>
              <li><strong>Execução de contrato:</strong> Para fornecer os serviços subscritos</li>
              <li><strong>Interesse legítimo:</strong> Para melhorar os nossos serviços</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>5. Os Teus Direitos (RGPD)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>Tens o direito de:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Acesso:</strong> Solicitar uma cópia dos teus dados</li>
              <li><strong>Retificação:</strong> Corrigir dados incorretos</li>
              <li><strong>Apagamento:</strong> Solicitar a eliminação dos teus dados</li>
              <li><strong>Portabilidade:</strong> Exportar os teus dados</li>
              <li><strong>Oposição:</strong> Opor-te ao processamento dos teus dados</li>
              <li><strong>Limitação:</strong> Limitar o processamento dos teus dados</li>
            </ul>
            <p className="mt-4">
              Para exerceres estes direitos, contacta-nos em:{" "}
              <a href="mailto:privacy@pretosmusic.com" className="text-primary underline">
                privacy@pretosmusic.com
              </a>
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>6. Armazenamento e Segurança</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Os teus dados são armazenados localmente no teu navegador usando IndexedDB.
              Para sincronização cloud (opcional), usamos Firebase com encriptação.
              Implementamos medidas técnicas e organizacionais adequadas para proteger os teus dados.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>7. Retenção de Dados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Mantemos os teus dados enquanto a tua conta estiver ativa ou enquanto necessário
              para fornecer os serviços. Podes eliminar a tua conta e todos os dados a qualquer momento.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>8. Contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Para questões sobre privacidade ou para exercer os teus direitos, contacta-nos:
            </p>
            <p>
              Email: <a href="mailto:privacy@pretosmusic.com" className="text-primary underline">privacy@pretosmusic.com</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

