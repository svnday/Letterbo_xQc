const STAR_PATH =
  "M12 2l2.9 6.6 7.1.7-5.4 4.8 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.3l7.1-.7z";

export function StarSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`h-full w-full ${className ?? ""}`}
      fill="currentColor"
      aria-hidden
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

/** Read-only star rating display (supports half stars). */
export default function Stars({
  rating,
  size = 14,
}: {
  rating: number | null;
  size?: number;
}) {
  if (rating == null) return null;
  return (
    <span className="inline-flex items-center" title={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = rating >= i ? 1 : rating >= i - 0.5 ? 0.5 : 0;
        return (
          <span
            key={i}
            className="relative inline-block"
            style={{ width: size, height: size }}
          >
            <span className="absolute inset-0" style={{ width: size, height: size }}>
              <StarSvg className="text-[#3a4551]" />
            </span>
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: fill === 1 ? size : size / 2, height: size }}
              >
                <span className="block" style={{ width: size, height: size }}>
                  <StarSvg className="text-lbgreen" />
                </span>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
