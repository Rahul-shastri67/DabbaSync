import { Link } from "react-router-dom";
import { useAppStore } from "../store/index.js";
import BottomNav from "./BottomNav.jsx";
import { Badge, Button, Tabs } from "./ui.jsx";

export default function Shell({ children }) {
  const role = useAppStore((s) => s.role);
  const token = useAppStore((s) => s.token);
  const logout = useAppStore((s) => s.logout);

  return (
    <div className="min-h-dvh bg-[radial-gradient(1200px_600px_at_20%_-10%,rgba(245,158,11,.18),transparent_55%),radial-gradient(900px_500px_at_100%_0%,rgba(217,70,239,.12),transparent_55%),linear-gradient(#070A12,#070A12)]">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="group flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-2xl bg-gradient-to-b from-amber-200 to-amber-500 text-sm font-black text-slate-950 shadow-[0_20px_50px_-30px_rgba(245,158,11,1)] transition-transform duration-200 group-hover:scale-[1.02]">
              D
            </div>
            <div className="leading-tight">
              <div className="font-semibold tracking-tight text-white">DabbaSync</div>
              <div className="text-xs text-white/55">Hyperlocal tiffin subscriptions</div>
            </div>
          </Link>

          <div className="hidden sm:flex">
            <Tabs
              items={[
                { to: "/customer", label: "Customer" },
                { to: "/vendor", label: "Vendor" },
                { to: "/admin", label: "Admin" }
              ]}
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <Badge tone="muted">
                role <span className="ml-1 text-white/90">{role}</span>
              </Badge>
            </div>
            {token ? (
              <Button variant="secondary" onClick={logout} className="px-3 py-2 text-sm">
                Logout
              </Button>
            ) : (
              <Badge tone="brand">MVP</Badge>
            )}
          </div>
        </div>
      </header>

      <main className="grain mx-auto max-w-6xl px-4 pb-24 pt-6 sm:pb-8">{children}</main>
      <BottomNav />
    </div>
  );
}

