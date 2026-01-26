export default function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-10 w-full rounded-2xl bg-surface-muted px-4 text-foreground placeholder-muted placeholder:text-sm ios-ring focus:outline-none focus:bg-white/80 dark:focus:bg-white/10 ${className}`}
      {...props}
    />
  );
}
