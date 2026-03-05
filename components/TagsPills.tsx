type TagsPillsProps = {
  tags: string[];
  className?: string;
};

export default function TagsPills({ tags, className }: TagsPillsProps) {
  if (!tags.length) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-2 ${className ?? ""}`}>
      {tags.map((tag, index) => (
        <span
          key={`${index}-${tag}`}
          className="inline-flex items-center rounded-full border border-black/10 bg-white/40 px-3 py-1 text-[10px] uppercase tracking-widest text-deep/55 transition-colors hover:bg-white/60"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
