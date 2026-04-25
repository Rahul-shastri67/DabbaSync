import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAppStore } from "../store/index.js";
import { Badge, Button, Card, StatCard } from "../components/ui.jsx";

export default function AdminPanel() {
  const apiBaseUrl = useAppStore((s) => s.apiBaseUrl);
  const authHeader = useAppStore((s) => s.authHeader);
  const setAuth = useAppStore((s) => s.setAuth);
  const role = useAppStore((s) => s.role);

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
    const res = await client.get("/analytics/admin/overview");
    setOverview(res.data?.data || null);
  }

  useEffect(() => {
    if (role !== "admin") setAuth({ role: "admin" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-white">Admin</h2>
            <Badge tone="muted">Platform</Badge>
          </div>
          <div className="mt-1 text-xs text-white/55">GMV • Commission • Growth</div>
        </div>
        <Button variant="secondary" onClick={loadOverview}>
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total orders" value={overview?.totalOrders ?? "—"} hint="All vendors" />
        <StatCard label="GMV" value={overview ? `₹${overview.gmv}` : "—"} hint="Placeholder" tone="brand" />
        <StatCard label="Commission" value={overview ? `₹${overview.commission}` : "—"} hint="Placeholder" tone="good" />
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="md:col-span-3"
          title="User & vendor management"
          subtitle="Approve • suspend • support"
          right={<Badge tone="brand">MVP</Badge>}
        >
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/55">
            Minimal placeholder. Next: list/search actions.
          </div>
        </Card>

        <Card className="md:col-span-3" title="Growth" subtitle="New users • churn • cohorts" right={<Badge tone="muted">Charts</Badge>}>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/55">
            Placeholder chart region.
          </div>
        </Card>

        <Card className="md:col-span-6" title="Alerts" subtitle="Fraud / refunds / outages">
          <div className="grid gap-2 text-xs text-white/60 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 transition-all hover:bg-black/30">
              Refund queue (placeholder)
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 transition-all hover:bg-black/30">
              Vendor SLA (placeholder)
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 transition-all hover:bg-black/30">
              Delivery incidents (placeholder)
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

