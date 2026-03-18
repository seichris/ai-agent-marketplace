"use client";

import React from "react";
import { useActionState } from "react";

import { adminLoginAction, type AdminLoginState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const initialState: AdminLoginState = {
  ok: false,
  message: ""
};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(adminLoginAction, initialState);

  return (
    <Card className="mx-auto w-full max-w-xl bg-[linear-gradient(180deg,rgba(10,14,26,0.9),rgba(9,12,20,0.92))]">
      <CardHeader>
        <CardDescription>Internal review access</CardDescription>
        <CardTitle className="text-3xl">Admin token login</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium">
            Admin token
            <Input name="token" type="password" placeholder="Enter shared admin token" required />
          </label>
          {state.message ? (
            <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
              {state.message}
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>
              {pending ? "Signing in..." : "Open admin queue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
