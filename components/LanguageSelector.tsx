type LanguageOption = {
  value: "en" | "uk";
  label: string;
};

type LanguageSelectorProps = {
  label: string;
  value: "en" | "uk";
  onChange: (value: "en" | "uk") => void;
  options: LanguageOption[];
};

export default function LanguageSelector({
  label,
  value,
  onChange,
  options,
}: LanguageSelectorProps) {
  return (
    <div className="space-y-3">
      <span className="text-sm font-semibold text-deep/90">{label}</span>
      <div className="mt-3 flex flex-wrap gap-3">
        {options.map((option) => {
          const isSelected = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              className={`h-11 w-[140px] rounded-full border px-4 text-sm font-semibold transition-colors ${
                isSelected
                  ? "border-[#97b5c2]/45 bg-[#97b5c2]/25 text-deep/90"
                  : "border-[#dfc2c0]/40 bg-white/90 text-deep/80 hover:border-[#dfc2c0]/60"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
