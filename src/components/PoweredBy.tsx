export function PoweredBy({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-chrome-dark ${className}`}>
      Powered by <span className="font-semibold text-chrome">Chrisslaymedia</span>
    </p>
  );
}
