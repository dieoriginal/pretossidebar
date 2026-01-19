/**
 * Página de exemplo para integração DistroKid
 * Demonstra o uso do wrapper DistroKid API
 */

"use client";

import DistroKidManager from '@/components/distrokid/DistroKidManager';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function DistroKidPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">DistroKid API</h1>
        <p className="text-muted-foreground">
          Integração com a API do DistroKid para gerenciar releases, tracks e vídeos
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Aviso:</strong> Este é um wrapper não oficial da API do DistroKid, 
          baseado na reversão da aplicação iOS. Use por sua conta e risco. 
          Não é afiliado, autorizado ou endossado pelo DistroKid.
        </AlertDescription>
      </Alert>

      <DistroKidManager
        onTokenChange={(token) => {
          // Salvar token no localStorage (opcional)
          if (typeof window !== 'undefined') {
            localStorage.setItem('distrokid_bearer_token', token);
          }
        }}
      />

      <Card>
        <CardHeader>
          <CardTitle>Como obter o Bearer Token</CardTitle>
          <CardDescription>
            Instruções para obter seu token de autenticação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Abra a aplicação iOS do DistroKid no seu dispositivo</li>
            <li>Use uma ferramenta de inspeção de rede (como Charles Proxy, Proxyman ou mitmproxy)</li>
            <li>Configure o proxy para interceptar as requisições HTTPS</li>
            <li>Faça login na aplicação e navegue pelas suas releases/tracks</li>
            <li>Inspecione as requisições HTTP e procure pelo header <code className="bg-muted px-1 rounded">Authorization: Bearer</code></li>
            <li>Copie o token após "Bearer " e cole no campo acima</li>
          </ol>
          <p className="text-sm text-muted-foreground">
            <strong>Nota:</strong> O token pode expirar. Se receber erros de autenticação, 
            você precisará obter um novo token seguindo os passos acima.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>Releases:</strong> Visualize todos os seus lançamentos no DistroKid</li>
            <li><strong>Tracks:</strong> Acesse informações detalhadas sobre suas faixas</li>
            <li><strong>Vídeos:</strong> Busque informações sobre vídeos musicais (não requer token)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}


