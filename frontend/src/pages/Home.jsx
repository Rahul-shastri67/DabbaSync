import { Link } from "react-router-dom";
import { Badge, Button, Card } from "../components/ui.jsx";

export default function Home() {
  return (
    <div className="grid gap-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/8 to-white/[0.02] p-6 ring-1 ring-white/10 sm:p-8">
        <div className="absolute -top-28 right-0 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute -bottom-28 left-0 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <Badge tone="brand">MVP • Swiggy/Zomato style UI</Badge>
          <Badge tone="muted">hyperlocal • subscriptions • tracking</Badge>
        </div>

        <h1 className="relative mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Daily tiffin, synced like an app.
        </h1>
        <p className="relative mt-2 max-w-2xl text-sm leading-6 text-white/60">
          Minimal UI to ship fast: customer, vendor, admin dashboards with bento layout, premium palette, and subtle micro
          interactions.
        </p>

        <div className="relative mt-6 flex flex-wrap gap-3">
          <Link to="/customer">
            <Button>Open Customer</Button>
          </Link>
          <Link to="/vendor">
            <Button variant="secondary">Open Vendor</Button>
          </Link>
          <Link to="/admin">
            <Button variant="ghost">Open Admin</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <Card
          className="md:col-span-3"
          title="Customer"
          subtitle="Skip, pause, wallet, live tracking"
          right={<Badge tone="good">PWA ready</Badge>}
        >
          Skip calendar + auto wallet credit, vacation mode, and delivery tracking placeholders.
        </Card>
        <Card
          className="md:col-span-3"
          title="Vendor"
          subtitle="Realtime skip feed + analytics"
          right={<Badge tone="brand">Realtime</Badge>}
        >
          Bento dashboard cards for daily ops and demand forecast placeholder.
        </Card>
        <Card
          className="md:col-span-6"
          title="Admin"
          subtitle="GMV, commission, growth"
          right={<Badge tone="muted">Platform</Badge>}
        >
          Minimal panel scaffold with KPI cards and management sections.
        </Card>
      </div>
    </div>
  );
}

