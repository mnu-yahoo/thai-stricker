import { NavLink } from "react-router-dom";
import { Icon } from "./Icon";
import "./BottomNav.css";

const items = [
  ["/", "home", "Home"],
  ["/workouts", "sports_martial_arts", "Workouts"],
  ["/schedule", "calendar_month", "Schedule"],
  ["/coach", "smart_toy", "AI Coach"],
  ["/settings", "settings", "Settings"],
] as const;

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map(([to, icon, label]) => (
        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => isActive ? "active" : ""}>
          <Icon name={icon} size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
