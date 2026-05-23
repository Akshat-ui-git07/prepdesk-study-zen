export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="grid place-items-center rounded-xl gradient-primary shadow-glow"
        style={{ width: size + 8, height: size + 8 }}
      >
        <svg width={size - 6} height={size - 6} viewBox="0 0 24 24" fill="none">
          <path
            d="M5 4h9a5 5 0 010 10H8v6H5V4zm3 3v4h6a2 2 0 100-4H8z"
            fill="white"
          />
        </svg>
      </div>
      <span
        className="font-display text-xl font-semibold tracking-tight"
        style={{ fontFamily: "Sora, system-ui" }}
      >
        Prepdesk
      </span>
    </div>
  );
}
