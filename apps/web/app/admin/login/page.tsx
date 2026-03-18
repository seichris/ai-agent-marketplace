import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-6 py-10 md:px-10">
      <div className="grid gap-6">
        <div className="space-y-3">
          <div className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Internal Workspace</div>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">Review the supply queue</h1>
          <p className="max-w-2xl text-base leading-7 text-muted-foreground">
            Use the shared admin token to review endpoint and source requests before providers pick them up.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
