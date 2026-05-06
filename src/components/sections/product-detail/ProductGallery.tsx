import Image from "next/image";

export function ProductGallery() {
  const images = [
    { src: "/images/product-imperial-main.png", alt: "Imperial Heritage Red Ginseng Root" },
    { src: "/images/product-imperial-extract.png", alt: "Red Ginseng Extract Pouring" },
    { src: "/images/product-imperial-box.png", alt: "Ginseng in Luxury Wooden Box" },
    { src: "/images/product-imperial-main.png", alt: "Imperial Heritage Details" },
  ];

  return (
    <div className="md:col-span-5 grid grid-cols-12 gap-4">
      {/* Main Large Image */}
      <div className="col-span-12 relative aspect-[4/5] bg-surface-container-low rounded-2xl overflow-hidden shadow-lg border border-outline-variant/30 group">
        <Image
          alt={images[0].alt}
          src={images[0].src}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-1000"
          priority
        />
        <div className="absolute top-6 left-6 bg-secondary text-on-secondary px-4 py-1 text-[10px] font-bold tracking-[0.2em] uppercase rounded-md shadow-lg">
          Limited Edition
        </div>
      </div>

      {/* Thumbnails */}
      {images.slice(1).map((img, idx) => (
        <div key={idx} className="col-span-4 aspect-square bg-surface-container-low rounded-xl overflow-hidden border border-outline-variant/20 relative group cursor-pointer">
          <Image
            alt={img.alt}
            src={img.src}
            fill
            className="object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
          />
          {idx === 1 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
              <span className="material-symbols-outlined text-white text-4xl">play_circle</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
