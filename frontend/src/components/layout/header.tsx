"use client";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <div
      style={{
        padding: "20px 24px 12px",
      }}
    >
      <h2
        style={{
          fontSize: "20px",
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "var(--foreground)",
          margin: 0,
        }}
      >
        {title}
      </h2>
    </div>
  );
}
