import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAppStore } from "../store/index.js";
import { useSocket } from "../hooks/useSocket.js";
import { Badge, Button, Card, StatCard } from "../components/ui.jsx";

export default function VendorDashboard() {
  const apiBaseUrl = useAppStore((s) => s.apiBaseUrl);
  const authHeader = useAppStore((s) => s.authHeader);
  const setAuth = useAppStore((s) => s.setAuth);
  const role = useAppStore((s) => s.role);

  const { socket, connected } = useSocket();
  const [overview, setOverview] = useState(null);

  const client = useMemo(() => {
    const c = axios.create({ baseURL: `${apiBaseUrl}/api` });
    c.interceptors.request.use((config) => {
      config.headers = { ...(config.headers || {}), ...authHeader() };
      return config;
    });
    return c;
  }, [apiBaseUrl, authHeader]);

  async function loadOverview() {
    const res = await client.get("/analytics/vendor/overview");
    setOverview(res.data?.data || null);
  }

  useEffect(() => {
    if (role !== "vendor") setAuth({ role: "vendor" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!socket) return;
    // Placeholder subscription to vendor skip feed room.
    socket.emit("vendor:skipfeed:subscribe", { vendorId: "me" });
  }, [socket]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-white">Vendor</h2>
            <Badge tone={connected ? "good" : "muted"}>{connected ? "Live" : "Offline"}</Badge>
          </div>
          <div className="mt-1 text-xs text-white/55">Ops • Analytics • Forecast</div>
        </div>
        <Button variant="secondary" onClick={loadOverview}>
          Refresh analytics
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active subs" value={overview?.activeSubs ?? "—"} hint="Realtime later (Redis)" />
        <StatCard label="Orders today" value={overview?.ordersToday ?? "—"} hint="Queue split later" tone="good" />
        <StatCard label="Waste risk" value="Low" hint="Placeholder" tone="warn" />
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="md:col-span-3"
          title="Realtime skip feed"
          subtitle="Today + upcoming days"
          right={<Badge tone="brand">Socket</Badge>}
        >
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/55">
            MVP placeholder. Next: list skip events for `vendor:&lt;vendorId&gt;`.
          </div>
        </Card>

        <Card
          className="md:col-span-3"
          title="7-day demand forecast"
          subtitle="AI placeholder"
          right={<Badge tone="muted">MVP</Badge>}
        >
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/55">
            Placeholder chart. Next: call forecasting endpoint and render sparkline.
          </div>
        </Card>

        <Card className="md:col-span-4" title="Auto billing" subtitle="Invoices + ledger">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/55">
            MVP placeholder. Next: show generated invoices and payment status.
          </div>
        </Card>

        <Card className="md:col-span-2" title="Kitchen checklist" subtitle="Ops quick actions">
          <div className="grid gap-2 text-xs text-white/60">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 transition-all hover:bg-black/30">
              Prep count (placeholder)
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 transition-all hover:bg-black/30">
              Dispatch batch (placeholder)
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

