"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import PoeticForm from "../poetic-form";

const formSchema = z.object({
  username: z.string().min(2, {
    message: "O nome de usuário deve ter pelo menos 2 caracteres.",
  }),
});


export default function PlaceholderContentUpload() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
  }

  return (
    <Card className="rounded-lg border-none mt-6">
      <CardContent className="p-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="form-group">
          <label className="block font-medium">Nome de Usuário:</label>
          <input
            {...form.register("username")}
            className="input-field border p-2 rounded w-full"
            placeholder="Digite seu nome de usuário"
          />
        </div>
        <div className="form-group">
          <label className="block font-medium">Carregar Áudio:</label>
          <input
            type="file"
            accept="audio/*"
            className="input-field border p-2 rounded w-full"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                console.log("Arquivo de áudio carregado:", file);
              }
            }}
          />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Enviar
          </button>
        </div>
      </form>
      </CardContent>
    </Card>
  );
}
