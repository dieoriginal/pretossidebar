# DistroKid API Wrapper

Wrapper não oficial para a API do DistroKid, desenvolvido com base na reversão da aplicação iOS do DistroKid. Este wrapper fornece uma interface TypeScript/JavaScript para interagir programaticamente com algumas funcionalidades oferecidas pelo DistroKid.

## ⚠️ Aviso

Este wrapper **não é oficial** e não é afiliado, autorizado, mantido, patrocinado ou endossado pelo DistroKid ou qualquer uma de suas afiliadas ou subsidiárias. Esta é uma API independente e não oficial. Use por sua conta e risco.

## Funcionalidades Atuais

- **Releases Getters**: Recuperar informações sobre lançamentos musicais, incluindo título, artista, data de lançamento e mais.
- **Tracks Getters**: Buscar detalhes e estatísticas de faixas individuais, como duração, ISRC, contagem de reproduções e outros dados relevantes.
- **Video Getters**: Buscar informações sobre vídeos musicais, incluindo título, artista, visualizações, descrição, thumbnails e mais.

## Instalação

O wrapper já está incluído no projeto. Não são necessárias dependências adicionais.

## Uso

### Cliente DistroKid (Releases e Tracks)

Para usar releases e tracks, você precisa do seu token Bearer do DistroKid. Você pode obtê-lo inspecionando as requisições da aplicação iOS do DistroKid ou usando um proxy para interceptar as requisições feitas pelo app.

```typescript
import { createDistroKidClient } from '@/lib/distrokid';

// Criar cliente com token
const client = createDistroKidClient('seu-bearer-token');

// Obter todos os releases
const releases = await client.getReleases();
console.log(`Encontrados ${releases.length} releases`);

// Obter um release específico
const release = await client.getRelease('release-id');

// Obter todas as tracks
const tracks = await client.getTracks();
console.log(`Encontradas ${tracks.length} tracks`);

// Obter uma track específica
const track = await client.getTrack('track-id');
```

### API de Vídeos (sem token)

A API de vídeos não requer token de autenticação:

```typescript
import { getVideos, getVideo } from '@/lib/distrokid';

// Obter múltiplos vídeos
const videos = await getVideos([
  'Rc92Mqy6SWr',
  'mv-K0ye9T6Xv',
  'dv-5yW2dTd8N'
]);
console.log(`Encontrados ${videos.length} vídeos`);

// Obter um único vídeo
const video = await getVideo('Rc92Mqy6SWr');
```

### Hook React

Use o hook `useDistroKid` para integrar facilmente em componentes React:

```typescript
import { useDistroKid } from '@/hooks/use-distrokid';

function MyComponent() {
  const {
    releases,
    tracks,
    videos,
    loading,
    error,
    fetchReleases,
    fetchTracks,
    fetchVideos,
  } = useDistroKid({ bearerToken: 'seu-token' });

  return (
    <div>
      <button onClick={fetchReleases}>Buscar Releases</button>
      {loading && <p>Carregando...</p>}
      {error && <p>Erro: {error.message}</p>}
      <ul>
        {releases.map((release) => (
          <li key={release.id}>{release.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Componente UI

Use o componente `DistroKidManager` para uma interface completa:

```typescript
import DistroKidManager from '@/components/distrokid/DistroKidManager';

function MyPage() {
  return (
    <DistroKidManager
      initialBearerToken="seu-token"
      onTokenChange={(token) => {
        // Salvar token
        localStorage.setItem('distrokid_token', token);
      }}
    />
  );
}
```

## Tipos TypeScript

O wrapper inclui tipos TypeScript completos:

```typescript
import type {
  Release,
  Track,
  Video,
  DistroKidError,
  DistroKidOptions,
} from '@/lib/distrokid';

interface Release {
  id: string;
  title: string;
  artist: string;
  releaseDate: string;
  coverArt?: string;
  tracks?: Track[];
}

interface Track {
  id: string;
  title: string;
  artist: string;
  duration?: number; // em segundos
  isrc?: string;
  playCount?: number;
}

interface Video {
  id: string;
  title: string;
  artist: string;
  views?: number;
  description?: string;
  thumbnail?: string;
  videoUrl?: string;
}
```

## Tratamento de Erros

O wrapper lança erros do tipo `DistroKidError`:

```typescript
import { createDistroKidClient } from '@/lib/distrokid';
import type { DistroKidError } from '@/lib/distrokid';

try {
  const releases = await client.getReleases();
} catch (error) {
  if (error instanceof Error) {
    const distroKidError = error as DistroKidError;
    console.error('Erro:', distroKidError.message);
    console.error('Código:', distroKidError.code);
    console.error('Status:', distroKidError.status);
  }
}
```

## Funcionalidades Planejadas

O projeto está em estágio inicial e há planos para expandir suas capacidades. Atualizações futuras podem incluir:

- Edição de informações de releases e tracks
- Upload de novas tracks e releases
- Gerenciamento de perfis de artistas e contas

## Contribuições

Contribuições são muito bem-vindas! Se você está interessado em melhorar este wrapper, considere contribuir nas seguintes áreas:

- Expandir o conjunto de funcionalidades para cobrir mais funcionalidades do DistroKid
- Melhorar o código existente para melhor eficiência e confiabilidade
- Escrever documentação e exemplos para ajudar outros desenvolvedores

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo LICENSE para detalhes.

## Baseado em

Este wrapper é baseado no projeto [DistroGo](https://github.com/szerookii/distrogo) (Go), adaptado para TypeScript/JavaScript para uso em projetos Next.js/React.



