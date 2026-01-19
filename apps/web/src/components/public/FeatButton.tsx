"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFeat } from "@/hooks/use-feat";
import { Music, Video, Mic } from "lucide-react";
import { useToastLite } from "@/components/ui/toast-lite";

export function FeatButton() {
  const [open, setOpen] = useState(false);
  const [serviceType, setServiceType] = useState<"featuring" | "production" | "audiovisual">("featuring");
  const [details, setDetails] = useState("");
  const [amount, setAmount] = useState("");
  const { createFeatRequest, loading, error } = useFeat();
  const { push: showToast } = useToastLite();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!details || !amount) {
      showToast({ msg: "Por favor, preencha todos os campos", kind: "error" });
      return;
    }

    try {
      const response = await createFeatRequest({
        serviceType,
        details,
        amount: parseFloat(amount),
        currency: "EUR",
      });

      showToast({ msg: "Pedido criado! Redirecionando para pagamento...", kind: "success" });

      // Redirecionar para página de pagamento
      if (response.feat.paymentLink) {
        window.location.href = response.feat.paymentLink;
      } else {
        setOpen(false);
      }
    } catch (err: any) {
      showToast({ msg: err.message || "Erro ao criar pedido", kind: "error" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Mic className="w-4 h-4 mr-2" />
          Feat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Solicitar Featuring / Produção</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do seu pedido e proceda ao pagamento
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="serviceType">Tipo de Serviço</Label>
            <Select
              value={serviceType}
              onValueChange={(value: "featuring" | "production" | "audiovisual") =>
                setServiceType(value)
              }
            >
              <SelectTrigger id="serviceType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featuring">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4" />
                    Featuring
                  </div>
                </SelectItem>
                <SelectItem value="production">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4" />
                    Produção Musical
                  </div>
                </SelectItem>
                <SelectItem value="audiovisual">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4" />
                    Serviços Audiovisuais
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="details">Detalhes do Pedido</Label>
            <Textarea
              id="details"
              placeholder="Descreva o que precisa (ex: featuring em uma música, produção de um single, gravação de videoclipe...)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Valor (EUR)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Processando..." : "Continuar para Pagamento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}



