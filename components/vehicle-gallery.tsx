"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type VehicleGalleryImage = {
  url: string;
  altText: string;
};

type Props = {
  images: VehicleGalleryImage[];
  badge?: string;
};

export function VehicleGallery({ images, badge }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const activeImage = images[activeIndex] ?? images[0];

  function showPrevious() {
    setActiveIndex((current) => (current - 1 + images.length) % images.length);
  }

  function showNext() {
    setActiveIndex((current) => (current + 1) % images.length);
  }

  useEffect(() => {
    if (!lightboxOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowLeft" && images.length > 1) showPrevious();
      if (event.key === "ArrowRight" && images.length > 1) showNext();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, images.length]);

  if (!activeImage) return null;

  return (
    <div className="vehicle-gallery">
      <div className="vehicle-detail-image">
        <Image
          src={activeImage.url}
          alt={activeImage.altText}
          fill
          priority
          sizes="(max-width: 760px) 100vw, 62vw"
        />
        {badge ? <span className="gallery-badge badge badge-demo">{badge}</span> : null}
        <button
          className="gallery-expand"
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open vehicle image in full screen"
        >
          ⤢
        </button>
        {images.length > 1 ? (
          <>
            <button className="gallery-arrow gallery-arrow-left" type="button" onClick={showPrevious} aria-label="Previous vehicle image">‹</button>
            <button className="gallery-arrow gallery-arrow-right" type="button" onClick={showNext} aria-label="Next vehicle image">›</button>
            <span className="gallery-count">{activeIndex + 1} / {images.length}</span>
          </>
        ) : null}
      </div>

      {images.length > 1 ? (
        <div className="gallery-thumbnails" aria-label="Vehicle image thumbnails">
          {images.map((image, index) => (
            <button
              key={image.url + index}
              type="button"
              className={index === activeIndex ? "gallery-thumbnail is-active" : "gallery-thumbnail"}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show image ${index + 1}: ${image.altText}`}
              aria-pressed={index === activeIndex}
            >
              <Image src={image.url} alt="" fill sizes="110px" />
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Vehicle image viewer"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="gallery-lightbox-stage" onClick={(event) => event.stopPropagation()}>
            <button className="gallery-lightbox-close" type="button" onClick={() => setLightboxOpen(false)} aria-label="Close image viewer">×</button>
            <Image
              src={activeImage.url}
              alt={activeImage.altText}
              fill
              sizes="100vw"
              className="gallery-lightbox-image"
              priority
            />
            {images.length > 1 ? (
              <>
                <button className="gallery-lightbox-arrow gallery-lightbox-prev" type="button" onClick={showPrevious} aria-label="Previous image">‹</button>
                <button className="gallery-lightbox-arrow gallery-lightbox-next" type="button" onClick={showNext} aria-label="Next image">›</button>
                <span className="gallery-lightbox-count">{activeIndex + 1} / {images.length}</span>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
