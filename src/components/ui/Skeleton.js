export default function Skeleton({ className = "" }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-zinc-200/60 dark:bg-zinc-800/60 ${className}`}>
      <div className="shimmer-effect absolute inset-0" />
    </div>
  );
}
