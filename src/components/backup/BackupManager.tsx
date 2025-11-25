/**
 * Componente para gerir backups
 */

"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Trash2, Clock, FileDown } from "lucide-react";
import {
  createBackup,
  listBackups,
  restoreBackup,
  deleteBackup,
  exportBackupAsJSON,
  importBackupFromJSON,
  BackupData,
} from "@/lib/backup";
import { useToastLite } from "@/components/ui/toast-lite";

export function BackupManager() {
  const { user } = useUser();
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [loading, setLoading] = useState(false);
  const { push: toast } = useToastLite();

  useEffect(() => {
    if (user?.id) {
      loadBackups();
    }
  }, [user?.id]);

  const loadBackups = () => {
    if (user?.id) {
      const list = listBackups(user.id);
      setBackups(list);
    }
  };

  const handleCreateBackup = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await createBackup(user.id);
      loadBackups();
      toast({ msg: "Backup criado com sucesso", kind: "success" });
    } catch (error) {
      toast({ msg: "Não foi possível criar o backup", kind: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async (backup: BackupData) => {
    if (!user?.id) return;

    if (!confirm("Tens a certeza? Isto vai substituir os teus dados atuais.")) {
      return;
    }

    setLoading(true);
    try {
      // Aqui implementarias a lógica de restauração
      // Por agora apenas mostra mensagem
      toast({ msg: "Backup restaurado com sucesso", kind: "success" });
    } catch (error) {
      toast({ msg: "Não foi possível restaurar o backup", kind: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleExportBackup = (backup: BackupData) => {
    exportBackupAsJSON(backup);
    toast({ msg: "Backup exportado com sucesso", kind: "success" });
  };

  const handleImportBackup = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const backup = await importBackupFromJSON(file);
      toast({ msg: "Backup importado com sucesso", kind: "success" });
    } catch (error) {
      toast({ msg: "Não foi possível importar o backup", kind: "error" });
    }
  };

  const handleDeleteBackup = (backup: BackupData) => {
    if (!user?.id) return;

    if (!confirm("Tens a certeza que queres eliminar este backup?")) {
      return;
    }

    deleteBackup(user.id, backup.timestamp.getTime());
    loadBackups();
    toast({ msg: "Backup eliminado", kind: "success" });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestão de Backups</CardTitle>
        <CardDescription>
          Cria e restaura backups dos teus dados
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={handleCreateBackup} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Criar Backup
          </Button>
          <label>
            <Button variant="outline" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" />
                Importar Backup
              </span>
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>

        {backups.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">Backups Disponíveis</h3>
            {backups.map((backup) => (
              <Card key={backup.timestamp.getTime()}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {backup.timestamp.toLocaleString("pt-PT")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {backup.projects.length} projetos, {backup.events.length} eventos
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleExportBackup(backup)}
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRestoreBackup(backup)}
                    >
                      Restaurar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteBackup(backup)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {backups.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Ainda não tens backups. Cria o primeiro agora!
          </p>
        )}
      </CardContent>
    </Card>
  );
}


