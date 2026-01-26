export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded-full";

  const sizes = {
    sm: "h-9 px-4 text-sm",
    md: "h-10 px-5 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const variants = {
    primary:
      "bg-primary text-white hover:bg-[#0a74e6] dark:hover:bg-[#1a8cff]",
    outline:
      "bg-transparent text-foreground ios-ring hover:bg-black/5 dark:hover:bg-white/5",
    ghost:
      "bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/5",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
