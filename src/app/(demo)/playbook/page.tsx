"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Piano, Drum, Music, Monitor, Settings, FileAudio, Globe, MessageCircle, Upload, Lock, Video, LifeBuoy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PlaybookPage() {
  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Playbook</h1>
        <p className="text-muted-foreground">
          O teu repositório completo - nunca percas nada. Gear, software, presets, patterns, templates e muito mais.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="gear">Gear Essencial</TabsTrigger>
          <TabsTrigger value="piano">Piano Videos</TabsTrigger>
          <TabsTrigger value="drum-kits">Drum Kits</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/gear">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-violet-500/10">
                      <Mic className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                    </div>
                    <CardTitle>Gear Essencial</CardTitle>
                  </div>
                  <CardDescription>
                    Microfones, interfaces, computadores e equipamento essencial
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Gear
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/piano">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Piano className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle>Piano Videos</CardTitle>
                  </div>
                  <CardDescription>
                    Vídeos de lições de piano preferidos e recursos de aprendizagem
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Ver Videos
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/drum-kits">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-orange-500/10">
                      <Drum className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle>Drum Kits</CardTitle>
                  </div>
                  <CardDescription>
                    Drum kits favoritos com fontes legítimas e queries de pesquisa
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Drum Kits
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/vst-synths">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Music className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle>VST Synths</CardTitle>
                  </div>
                  <CardDescription>
                    VST synths, samplers e romplers essenciais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir VSTs
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/software">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Monitor className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle>Software</CardTitle>
                  </div>
                  <CardDescription>
                    Premiere, Davinci, Photoshop e outros programas essenciais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Software
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/fl-presets">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-pink-500/10">
                      <Settings className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <CardTitle>FL Studio Presets</CardTitle>
                  </div>
                  <CardDescription>
                    Mixer presets, vocal presets, effects e master presets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Presets
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/fl-patterns">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <FileAudio className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <CardTitle>FL Studio Patterns</CardTitle>
                  </div>
                  <CardDescription>
                    808, kick, perc, rim, sfx, clap, snare, open/closed hat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Patterns
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/templates">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle>Templates</CardTitle>
                  </div>
                  <CardDescription>
                    UAD Luna e FL Studio template files - upload e gestão
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Templates
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/sauce-websites">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <Globe className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle>Sauce Websites</CardTitle>
                  </div>
                  <CardDescription>
                    Websites para downloads que sempre funcionam
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Websites
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/telegram-groups">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-cyan-500/10">
                      <MessageCircle className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <CardTitle>Telegram Groups</CardTitle>
                  </div>
                  <CardDescription>
                    Links de grupos Telegram para downloads e comunidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Grupos
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/interviews">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-sky-500/10">
                      <Video className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                    </div>
                    <CardTitle>Entrevistas</CardTitle>
                  </div>
                  <CardDescription>
                    Guia de estilo para entrevistas + vídeo de referência embutido
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Abrir Bucket
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/playbook/life-kit">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <LifeBuoy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <CardTitle>Life Kit Links</CardTitle>
                  </div>
                  <CardDescription>
                    Links críticos (“cyberpunk savior links”) — kit de sobrevivência online
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Abrir Biblioteca
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary/20">
              <Link href="/playbook/passwords">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        Password Manager
                        <Badge variant="secondary" className="text-xs">Privado</Badge>
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription>
                    <strong>100% Privado</strong> - Armazene senhas de redes sociais, DistroKid, emails e plataformas musicais. 
                    <span className="block mt-1 text-xs text-muted-foreground">
                      Armazenado localmente - nós não temos acesso
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Senhas
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gear">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Redirecionando para Gear Essencial...</p>
            <Link href="/playbook/gear">
              <Button>Ir para Gear Essencial</Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="piano">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Redirecionando para Piano Videos...</p>
            <Link href="/playbook/piano">
              <Button>Ir para Piano Videos</Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="drum-kits">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Redirecionando para Drum Kits...</p>
            <Link href="/playbook/drum-kits">
              <Button>Ir para Drum Kits</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}




