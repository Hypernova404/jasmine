export function BadgeVerified({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="inline-flex items-center rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
        Terverifikasi
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-warning-border bg-warning-bg px-2.5 py-0.5 text-xs font-semibold text-foreground">
      Acuan umum
    </span>
  );
}
