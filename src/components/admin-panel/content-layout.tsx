import React, { useState, useContext } from "react";
import Link from "next/link";
import { Navbar } from "@/components/admin-panel/navbar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Footer } from "@/components/admin-panel/footer";
import { Sidebar } from "@/components/admin-panel/sidebar";
import AdminPanelLayout from "@/components/admin-panel/admin-panel-layout";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSidebar } from "@/hooks/use-sidebar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function ContentLayout({ title, children }: ContentLayoutProps) {
  const sidebar = useSidebar();
  const { settings, setSettings } = sidebar;

  return (
    <div>
      <Navbar title={title} />
     
      <AdminPanelLayout>
        <div className="container pt-8 pb-8 px-0 sm:px-2 ml-1">
        
          <div className="p-4 items-center">
              <div className="gap-x-4">
                <Card className="w-[1350px] mb-4"> {/* Ajuste para que o Card tenha a mesma largura que o Breadcrumb e adicione margem inferior */}
                  <CardHeader className="items-center">
                    <Breadcrumb className="items-center">
                      <BreadcrumbList className="items-center">
                        {[
                          { name: "Instrumental", link: "/instrumental" },
                          { name: "Contextualização", link: "/contextualizacao" },
                          { name: "Versificação", link: "/versificacao" },
                          { name: "Gravação", link: "/gravacao" },
                          { name: "Cinematografia", link: "/cinematografia" },
                          { name: "Orçamentalização", link: "/orcamento" },
                          { name: "Filmagens", link: "/filmagem" },
                          { name: "Contratualização", link: "/contratualizacao" },
                          { name: "Direitos Autorais", link: "/direitosautorais" },
                          { name: "Lançamento", link: "/lancamento" },
                        ].map((item, index) => (
                          <React.Fragment key={item.name}>
                            <BreadcrumbItem>
                              <BreadcrumbLink asChild>
                                <Link href={item.link} className="hover:text-primary">
                                  {item.name}
                                </Link>
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            {index < 9 && <BreadcrumbSeparator />}
                          </React.Fragment>
                        ))}
                      </BreadcrumbList>
                    </Breadcrumb>
                  </CardHeader>
                  <CardContent className="py-0" /> {/* Ajuste a altura do CardContent para igualar o espaço acima e abaixo do Breadcrumb */}
                </Card>
                <Card className="mb-6">
            <CardContent className="pt-6">
              <TooltipProvider>
                <div className="flex gap-6">
                  <Tabs defaultValue="controls" className="w-full">
                    <TabsList>
                      <TabsTrigger value="controls">Controles</TabsTrigger>
                      <TabsTrigger value="settings">Configurações</TabsTrigger>
                    </TabsList>
        
                    <div className="pt-4 flex gap-6">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is-hover-open"
                              checked={settings.isHoverOpen}
                              onCheckedChange={(x) => setSettings({ isHoverOpen: x })}
                            />
                            <Label htmlFor="is-hover-open">Abertura Sutil</Label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Ativa a exibição suave da sidebar ao passar o mouse</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="disable-sidebar"
                              checked={settings.disabled}
                              onCheckedChange={(x) => setSettings({ disabled: x })}
                            />
                            <Label htmlFor="disable-sidebar">Desativar Sidebar</Label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Esconde completamente a sidebar</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </Tabs>
                </div>
              </TooltipProvider>
            </CardContent>
          </Card>
                <Card className="mb-6 h-[1cm] w-[280px] h-[36px] flex items-center justify-center">
                  <CardHeader>
                    <TooltipProvider>
                      <div className="flex gap-6">
                        <Tabs defaultValue="controls" className="w-full">
                          <TabsList>
                            <TabsTrigger value="versos">Versificação</TabsTrigger>
                            <TabsTrigger value="pdf"> Documentação</TabsTrigger>
                            <TabsTrigger value="cinematografia">Cinematografia</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </TooltipProvider>
                  </CardHeader>
                </Card>
        
              </div>
          </div>
          {children}
        </div>
      </AdminPanelLayout>
    </div>
  );
}
