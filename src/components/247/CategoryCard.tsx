// src/components/247/CategoryCard.tsx

interface CategoryCardProps {
  id: string;
  label: string;
  imageSrc?: string;
  fallbackColor?: string;
  href?: string;
  onClick?: () => void;
}

export default function CategoryCard({
  id,
  label,
  imageSrc,
  fallbackColor = "#1a2a4a",
  href,
  onClick,
}: CategoryCardProps) {
  const inner = (
    <>
      {imageSrc && (
        <img
          src={imageSrc}
          alt={label}
          className="category-card__bg"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="category-card__overlay" aria-hidden="true" />
      <span className="category-card__label">{label}</span>
    </>
  );

  const style = { background: fallbackColor };

  if (href) {
    return (
      <a href={href} className="category-card" data-cat={id} style={style}>
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      className="category-card"
      data-cat={id}
      style={style}
      onClick={onClick}
    >
      {inner}
    </button>
  );
}