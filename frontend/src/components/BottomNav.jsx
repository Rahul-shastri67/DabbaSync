import { NavLink } from "react-router-dom";
import { cn } from "./ui.jsx";

const Item = ({ to, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-[11px] font-semibold transition-all",
        isActive ? "bg-white/10 text-white" : "text-white/60 hover:bg-white/8 hover:text-white"
      )
    }
  >
    <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
    {label}
  </NavLink>
);

export default function BottomNav() {
  return (
    <div className="fixed inset-x-0 bottom-3 z-20 mx-auto w-[min(560px,calc(100%-24px))] sm:hidden">
      <div className="rounded-3xl bg-black/40 p-1.5 ring-1 ring-white/10 backdrop-blur">
        <div className="flex items-stretch gap-1">
          <Item to="/customer" label="Customer" />
          <Item to="/vendor" label="Vendor" />
          <Item to="/admin" label="Admin" />
        </div>
      </div>
    </div>
  );
}

