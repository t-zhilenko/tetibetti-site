type GalleryPlaceholderProps = {
  className?: string;
  label?: string;
  variant?: "main" | "thumb";
};

export default function GalleryPlaceholder({
  className,
  label = "Preview",
  variant = "main",
}: GalleryPlaceholderProps) {
  const showText = variant === "main";
  const iconSize = variant === "thumb" ? 40 : 56;
  const textSize = 18;

  return (
    <div
      role="img"
      aria-label={label}
      className={className ?? "h-full w-full"}
    >
      <svg
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
      >
        <rect x="0" y="0" width="800" height="600" fill="#ffffff" />
        <g
          transform={`translate(${400 - iconSize / 2} ${260 - iconSize / 2})`}
          stroke="rgba(0,0,0,0.2)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect
            x="0"
            y="0"
            width={iconSize}
            height={iconSize}
            rx="10"
          />
          <circle cx={iconSize * 0.32} cy={iconSize * 0.3} r="6" />
          <path
            d={`M${iconSize * 0.18} ${iconSize * 0.78} L${
              iconSize * 0.42
            } ${iconSize * 0.52} L${iconSize * 0.6} ${
              iconSize * 0.68
            } L${iconSize * 0.82} ${iconSize * 0.4}`}
          />
        </g>
        {showText ? (
          <text
            x="400"
            y="360"
            textAnchor="middle"
            fill="rgba(0,0,0,0.4)"
            fontSize={textSize}
            fontFamily="Georgia, serif"
          >
            {label}
          </text>
        ) : null}
      </svg>
    </div>
  );
}
