type IconProps = { name: string; label?: string; size?: number };

export function Icon({ name, label, size = 22 }: IconProps) {
  return (
    <span
      className="material-symbols-rounded icon"
      style={{ fontSize: size }}
      aria-hidden={label ? undefined : true}
      aria-label={label}
    >
      {name}
    </span>
  );
}
