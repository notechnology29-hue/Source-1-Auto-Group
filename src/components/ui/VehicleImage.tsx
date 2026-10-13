import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/** Local placeholder SVGs skip the optimizer; Cloudinary URLs get automatic WebP/AVIF via next/image. */
export function VehicleImage({ src, alt, className, sizes = "(min-width: 1024px) 33vw, 100vw", priority }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith("/placeholder")}
      className={className ?? "object-cover"}
    />
  );
}
