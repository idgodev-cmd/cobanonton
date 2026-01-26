export default function Badge({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-surface-muted px-2.5 py-1 text-xs text-muted ios-ring ${className}`}>
      {children}
    </span>
  );
}
