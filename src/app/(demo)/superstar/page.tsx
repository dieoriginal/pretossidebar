"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Heart, Shirt, Dumbbell, Palette, Share2, Calendar, Volume2, Guitar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SuperstarPage() {
  return (
    <div className="container py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Superstar Management</h1>
        <p className="text-muted-foreground">
          Desenvolvimento artístico completo: beauty, fashion, fitness, branding e muito mais
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="beauty">Beauty</TabsTrigger>
          <TabsTrigger value="fashion">Fashion</TabsTrigger>
          <TabsTrigger value="fitness">Fitness</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="rehearsal">Rehearsal</TabsTrigger>
          <TabsTrigger value="vocal">Vocal</TabsTrigger>
          <TabsTrigger value="instrumentation">Instrumentation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/superstar/beauty">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-rose-500/10">
                      <Heart className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    </div>
                    <CardTitle>Beauty & Skin Care</CardTitle>
                  </div>
                  <CardDescription>
                    Produtos de skincare e rotinas de beleza
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Beauty
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/superstar/fashion">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Shirt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <CardTitle>Fashion</CardTitle>
                  </div>
                  <CardDescription>
                    Conselhos de moda e estilo para diferentes ocasiões
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Fashion
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/superstar/fitness">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Dumbbell className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle>Fitness</CardTitle>
                  </div>
                  <CardDescription>
                    Programas de treino e exercícios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Fitness
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/superstar/branding">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <Palette className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle>Branding</CardTitle>
                  </div>
                  <CardDescription>
                    Elementos de marca e identidade visual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Branding
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/superstar/social-media">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-pink-500/10">
                      <Share2 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>
                    <CardTitle>Social Media</CardTitle>
                  </div>
                  <CardDescription>
                    Estratégias e treino para redes sociais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Social Media
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/superstar/rehearsal">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-yellow-500/10">
                      <Calendar className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <CardTitle>Rehearsal</CardTitle>
                  </div>
                  <CardDescription>
                    Horários e rotinas de ensaio
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Rehearsal
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/superstar/vocal">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-red-500/10">
                      <Volume2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <CardTitle>Vocal Technique</CardTitle>
                  </div>
                  <CardDescription>
                    Exercícios e técnicas vocais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Vocal
                  </Button>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/superstar/instrumentation">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10">
                      <Guitar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <CardTitle>Instrumentation</CardTitle>
                  </div>
                  <CardDescription>
                    Instrumentos e níveis de habilidade
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Gerir Instrumentation
                  </Button>
                </CardContent>
              </Link>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}




