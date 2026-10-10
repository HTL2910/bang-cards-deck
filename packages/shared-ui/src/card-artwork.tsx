import { useEffect, useState, type SyntheticEvent } from "react";

export type CardArtworkProps = {
  src: string;
  alt: string;
  name: string;
  text: string;
  className?: string;
  onError?: (event: SyntheticEvent<HTMLImageElement>) => void;
};

export function CardArtwork({
  src,
  alt,
  name,
  text,
  className = "",
  onError,
}: CardArtworkProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (failed) {
    return (
      <section
        className={`bang-card-fallback ${className}`.trim()}
        aria-label={`Không tải được ảnh ${name}`}
      >
        <strong>{name}</strong>
        <p>{text}</p>
      </section>
    );
  }

  return (
    <img
      className={`bang-card-artwork ${className}`.trim()}
      src={src}
      alt={alt}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}
