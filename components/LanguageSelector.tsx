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
              className={`h-11 w-[140px] rounded-full border px-4 text-[13px] md:text-[14px] font-semibold transition-all duration-200 shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(223,194,192,0.35)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fdf9f9] ${
                isSelected
                  ? "bg-[rgba(247,220,224,0.7)] text-[#2B5968] border-[rgba(223,194,192,0.75)] shadow-[0_0_0_1px_rgba(223,194,192,0.35)]"
                  : "bg-[#FBF3F4] text-[#2B5968]/65 border-[rgba(223,194,192,0.35)] hover:bg-[rgba(247,220,224,0.4)] hover:text-[#2B5968]/85 hover:border-[rgba(223,194,192,0.55)]"
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
