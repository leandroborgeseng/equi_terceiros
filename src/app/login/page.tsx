"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const rawCallback = searchParams.get("callbackUrl");
  const callbackUrl =
    rawCallback && rawCallback !== "/" && !rawCallback.startsWith("/login")
      ? rawCallback
      : "/dashboard";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Credenciais inválidas. Verifique e-mail e senha (demo: Hospital@2026).");
        setLoading(false);
        return;
      }
      if (!res?.ok) {
        setError("Não foi possível iniciar a sessão. Tente novamente.");
        setLoading(false);
        return;
      }
      window.location.href = callbackUrl;
    } catch {
      setError("Erro de conexão com o servidor. Verifique se o app está no ar.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-bold text-white">
            GE
          </div>
          <CardTitle>Entrar na plataforma</CardTitle>
          <CardDescription>GestEq — Gestão de Equipamentos de Terceiros</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label>Senha</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs text-slate-500">
            Demo: medico@hospital.local / Hospital@2026
          </p>
          <p className="mt-4 text-center text-sm">
            <Link href="/solicitar" className="font-medium text-emerald-600 hover:underline">
              Solicitar equipamento sem login
            </Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link href="/" className="text-slate-500 hover:underline">Voltar</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
