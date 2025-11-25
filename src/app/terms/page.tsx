/**
 * Termos de Serviço
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-primary" />
          <h1 className="mb-4 text-4xl font-bold">Termos de Serviço</h1>
          <p className="text-muted-foreground">Última atualização: {new Date().toLocaleDateString("pt-PT")}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>1. Aceitação dos Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Ao acederes e usares o PRETOS MUSIC, aceitas estar vinculado a estes Termos de Serviço.
              Se não concordares com algum destes termos, não deves usar o serviço.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>2. Descrição do Serviço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              O PRETOS MUSIC é uma plataforma de gestão para artistas musicais que oferece ferramentas
              para criação de projetos, planeamento de eventos, gestão de merchandise e outros processos
              relacionados com a indústria musical.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>3. Subscrições e Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <ul className="list-disc list-inside space-y-2">
              <li>As subscrições são anuais e renovam automaticamente</li>
              <li>Podes cancelar a qualquer momento</li>
              <li>Não há reembolsos para períodos já pagos</li>
              <li>Os preços podem ser alterados com aviso prévio de 30 dias</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>4. Limites e Quotas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Cada plano tem limites específicos de projetos e eventos. Exceder estes limites requer
              upgrade do plano. Os limites são claramente indicados na página de pricing.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>5. Propriedade Intelectual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Todos os conteúdos que crias na plataforma são teus. Nós não reivindicamos propriedade
              sobre os teus projetos, eventos ou outros dados. A plataforma e o seu código são propriedade
              do PRETOS MUSIC.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>6. Limitação de Responsabilidade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              O PRETOS MUSIC é fornecido "como está". Não garantimos que o serviço estará sempre
              disponível ou livre de erros. Não somos responsáveis por perdas de dados, embora
              implementemos medidas de backup.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>7. Cancelamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Podes cancelar a tua subscrição a qualquer momento. O cancelamento entra em vigor no
              final do período de pagamento atual. Não há taxas de cancelamento.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>8. Alterações aos Termos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Reservamo-nos o direito de alterar estes termos a qualquer momento. Alterações
              significativas serão comunicadas com 30 dias de antecedência.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

