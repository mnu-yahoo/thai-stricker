import { NavLink } from "react-router-dom";
import { Icon } from "./Icon";

const items = [
  ["/", "home", "Accueil"],
  ["/workouts", "fitness_center", "Séances"],
  ["/schedule", "calendar_month", "Planning"],
  ["/coach", "psychology", "Coach"],
  ["/settings", "settings", "Réglages"],
] as const;

export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      {items.map(([to, icon, label]) => (
        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => isActive ? "active" : ""}>
          <Icon name={icon} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
