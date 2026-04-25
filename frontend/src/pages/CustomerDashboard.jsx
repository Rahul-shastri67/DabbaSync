import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAppStore } from "../store/index.js";
import { useSocket } from "../hooks/useSocket.js";
import { Badge, Button, Card, Input, StatCard } from "../components/ui.jsx";

export default function CustomerDashboard() {
  const apiBaseUrl = useAppStore((s) => s.apiBaseUrl);
  const authHeader = useAppStore((s) => s.authHeader);
  const setAuth = useAppStore((s) => s.setAuth);
  const role = useAppStore((s) => s.role);

  const { connected } = useSocket();
  const [phone, setPhone] = useState("9999999999");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [wallet, setWallet] = useState(null);

  const client = useMemo(() => {
    const c = axios.create({ baseURL: `${apiBaseUrl}/api` });
    c.interceptors.request.use((config) => {
      config.headers = { ...(config.headers || {}), ...authHeader() };
      return config;
    });
    return c;
  }, [apiBaseUrl, authHeader]);

  async function requestOtp() {
    const res = await client.post("/auth/otp/request", { phone });
    setDevOtp(res.data?.data?.devOtp || "");
  }

  async function verifyOtp() {
    const res = await client.post("/auth/otp/verify", { phone, otp });
    const token = res.data?.data?.token;
    if (token) setAuth({ token, role: "customer" });
  }

  async function loadWallet() {
    const res = await client.get("/payments/wallet/me");
    setWallet(res.data?.data || null);
  }

  useEffect(() => {
    if (role !== "customer") setAuth({ role: "customer" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight text-white">Customer</h2>
            <Badge tone={connected ? "good" : "muted"}>{connected ? "Live" : "Offline"}</Badge>
          </div>
          <div className="mt-1 text-xs text-white/55">Skip • Pause • Wallet • Delivery</div>
        </div>
        <Button variant="secondary" onClick={loadWallet}>
          Refresh wallet
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Wallet" value={wallet ? `₹${wallet.walletBalance}` : "—"} hint="Auto-credits on skip (MVP)" />
        <StatCard label="Loyalty tier" value={wallet?.loyalty?.tier || "Bronze"} hint="Bronze → Platinum" tone="good" />
        <StatCard label="Next delivery" value="12:30 PM" hint="ETA placeholder" tone="warn" />
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <Card className="md:col-span-3" title="Login (OTP • dev)" right={<Badge tone="brand">JWT</Badge>}>
          <div className="grid gap-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-1">
                <div className="text-xs text-white/55">Phone</div>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid gap-1">
                <div className="text-xs text-white/55">OTP</div>
                <Input placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={requestOtp}>Request OTP</Button>
              <Button variant="secondary" onClick={verifyOtp}>
                Verify
              </Button>
              {devOtp ? <Badge tone="muted">Dev OTP: {devOtp}</Badge> : null}
            </div>
          </div>
        </Card>

        <Card
          className="md:col-span-3"
          title="Skip calendar (MVP)"
          subtitle="Tap to skip • instant wallet credit"
          right={<Badge tone="good">Smart</Badge>}
        >
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/55">
            Minimal placeholder. Next: render month grid and call skip/pause/cancel endpoints.
          </div>
          <div className="mt-3 text-xs text-white/45">Cancellation lock countdown will appear here.</div>
        </Card>

        <Card className="md:col-span-4" title="Live delivery" subtitle="Realtime location + status">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/55">
            Subscribe to an order room and render `delivery:location` + `delivery:status` events.
          </div>
        </Card>

        <Card className="md:col-span-2" title="Coupons" subtitle="Live bill preview">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-xs text-white/55">
            MVP placeholder.
          </div>
        </Card>
      </div>
    </div>
  );
}

