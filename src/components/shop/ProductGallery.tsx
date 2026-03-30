"use client";

import { useState, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { motion } from "motion/react";

import "swiper/css";
import "swiper/css/navigation";

const ZOOM_SCALE = 2;
const DRAG_THRESHOLD_PX = 6;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

interface ProductGalleryProps {
  images: string[];
  videoUrl?: string | null;
}

export function ProductGallery({ images, videoUrl }: ProductGalleryProps) {
  const mainSwiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panBounds, setPanBounds] = useState({ mx: 280, my: 280 });

  const lightboxViewportRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    panStartX: number;
    panStartY: number;
    dragged: boolean;
    pointerId: number | null;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    panStartX: 0,
    panStartY: 0,
    dragged: false,
    pointerId: null,
  });

  const hasVideo = !!videoUrl;
  const totalItems = images.length + (hasVideo ? 1 : 0);

  const openLightbox = useCallback((index: number) => {
    // Don't open lightbox for video
    if (hasVideo && index === images.length) return;
    
    setLightboxIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = "hidden";
  }, [hasVideo, images.length]);

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
    setIsZoomed(false);
    setPan({ x: 0, y: 0 });
    document.body.style.overflow = "";
  }, []);

  useLayoutEffect(() => {
    if (!lightboxOpen || !isZoomed) return;
    const el = lightboxViewportRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      // При scale=2 «лишняя» область ~ половина увеличения относительно центра
      const mx = Math.max(0, (r.width * (ZOOM_SCALE - 1)) / 2);
      const my = Math.max(0, (r.height * (ZOOM_SCALE - 1)) / 2);
      setPanBounds({ mx, my });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lightboxOpen, isZoomed, lightboxIndex]);

  useEffect(() => {
    setPan({ x: 0, y: 0 });
  }, [lightboxIndex]);

  useEffect(() => {
    if (!isZoomed) setPan({ x: 0, y: 0 });
  }, [isZoomed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    if (lightboxOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, closeLightbox]);

  // Сброс scroll-lock при уходе со страницы (иначе после лайтбокса /cart может «не кликаться»)
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const nextImage = useCallback(() => {
    setIsZoomed(false);
    setPan({ x: 0, y: 0 });
    setLightboxIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setIsZoomed(false);
    setPan({ x: 0, y: 0 });
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const clampPan = useCallback(
    (x: number, y: number) => ({
      x: clamp(x, -panBounds.mx, panBounds.mx),
      y: clamp(y, -panBounds.my, panBounds.my),
    }),
    [panBounds.mx, panBounds.my]
  );

  const onLightboxPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isZoomed) return;
      e.preventDefault();
      const el = e.currentTarget;
      el.setPointerCapture(e.pointerId);
      pointerRef.current = {
        active: true,
        startX: e.clientX,
        startY: e.clientY,
        panStartX: pan.x,
        panStartY: pan.y,
        dragged: false,
        pointerId: e.pointerId,
      };
    },
    [isZoomed, pan.x, pan.y]
  );

  const onLightboxPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isZoomed || !pointerRef.current.active) return;
      const { startX, startY, panStartX, panStartY } = pointerRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) pointerRef.current.dragged = true;
      setPan(clampPan(panStartX + dx, panStartY + dy));
    },
    [isZoomed, clampPan]
  );

  const onLightboxPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointerRef.current.active) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    pointerRef.current.active = false;
    pointerRef.current.pointerId = null;
  }, []);

  const onLightboxImageClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (!isZoomed) {
        setIsZoomed(true);
        setPan({ x: 0, y: 0 });
        return;
      }
      if (!pointerRef.current.dragged) {
        setIsZoomed(false);
        setPan({ x: 0, y: 0 });
      }
      pointerRef.current.dragged = false;
    },
    [isZoomed]
  );

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-[2rem] text-[#999999]">
        Фото товара
      </div>
    );
  }

  return (
    <div className="flex min-w-0 w-full max-w-full flex-col gap-4">
      {/* Desktop: items-start — иначе stretch по высоте миниатюр ломает aspect-square и flex-1 раздувает ширину поверх соседней колонки грида */}
      <div className="flex flex-col-reverse gap-4 sm:flex-row sm:items-start">
        {/* Thumbnails */}
        {totalItems > 1 && (
          <div className="flex w-full shrink-0 gap-3 overflow-x-auto py-2 px-1 scrollbar-hide [-webkit-overflow-scrolling:touch] sm:w-20 sm:flex-col sm:self-start sm:overflow-visible sm:px-0 sm:py-0">
            {images.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setActiveIndex(i);
                  mainSwiperRef.current?.slideTo(i);
                }}
                className={`relative aspect-square w-20 sm:w-full shrink-0 overflow-hidden rounded-xl bg-white transition-all duration-150 ${
                  activeIndex === i
                    ? "ring-2 ring-inset ring-brand"
                    : "opacity-55 hover:opacity-100"
                }`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  className="object-contain p-1"
                  sizes="80px"
                  unoptimized
                />
              </button>
            ))}
            {hasVideo && (
              <button
                type="button"
                onClick={() => {
                  setActiveIndex(images.length);
                  mainSwiperRef.current?.slideTo(images.length);
                }}
                className={`relative aspect-square w-20 sm:w-full shrink-0 overflow-hidden rounded-xl bg-white flex items-center justify-center transition-all duration-150 ${
                  activeIndex === images.length
                    ? "ring-2 ring-inset ring-brand"
                    : "opacity-55 hover:opacity-100"
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-brand/90 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </button>
            )}
          </div>
        )}

        {/* Главный слайдер */}
        <div
          className="gallery-frame relative min-w-0 w-full flex-1 aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-white"
        >
          <Swiper
            modules={[Navigation]}
            onSwiper={(swiper) => {
              mainSwiperRef.current = swiper;
            }}
            navigation
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            className="gallery-swiper h-full w-full"
            style={{ height: "100%" }}
          >
            {images.map((src, i) => (
              <SwiperSlide key={i} className="h-full" style={{ height: "100%" }}>
                <div
                  className="relative h-full w-full cursor-zoom-in"
                  onClick={() => openLightbox(i)}
                >
                  <Image
                    src={src}
                    alt={`Фото ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                    priority={i === 0}
                    unoptimized
                  />
                </div>
              </SwiperSlide>
            ))}
            {hasVideo && (
              <SwiperSlide key="video" className="h-full" style={{ height: "100%" }}>
                <div className="relative flex h-full w-full items-center justify-center bg-neutral-950">
                  <video
                    src={videoUrl!}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-auto max-h-full aspect-video object-contain"
                  >
                    <track kind="captions" />
                  </video>
                </div>
              </SwiperSlide>
            )}
          </Swiper>
        </div>
      </div>

      {/* Lightbox: без AnimatePresence — иначе при client navigation оверлей может остаться и перекрыть сайт */}
      {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-md"
            onClick={closeLightbox}
          >
            <button
              type="button"
              aria-label="Закрыть просмотр"
              onClick={closeLightbox}
              className="absolute right-6 top-6 z-10 rounded-full bg-black/5 p-3 text-black hover:bg-black/10 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Предыдущее фото"
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-6 z-10 rounded-full bg-black/5 p-4 text-black hover:bg-black/10 transition-colors hidden sm:block"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Следующее фото"
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-6 z-10 rounded-full bg-black/5 p-4 text-black hover:bg-black/10 transition-colors hidden sm:block"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}

            <motion.div
              key={lightboxIndex}
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative flex h-[85vh] w-[90vw] max-w-5xl items-center justify-center overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Зум: translate + scale (не motion drag — он ломается вместе со scale). Панорама: pointer events */}
              <div
                ref={lightboxViewportRef}
                role="presentation"
                className={`relative h-full w-full select-none ${
                  isZoomed ? "cursor-grab active:cursor-grabbing touch-none" : "cursor-zoom-in"
                }`}
                style={{ touchAction: isZoomed ? "none" : "manipulation" }}
                onPointerDown={onLightboxPointerDown}
                onPointerMove={onLightboxPointerMove}
                onPointerUp={onLightboxPointerUp}
                onPointerCancel={onLightboxPointerUp}
                onClick={onLightboxImageClick}
              >
                <div
                  className="relative h-full w-full transition-transform duration-200 ease-out will-change-transform"
                  style={{
                    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${isZoomed ? ZOOM_SCALE : 1})`,
                    transformOrigin: "center center",
                  }}
                >
                  <Image
                    src={images[lightboxIndex]}
                    alt={`Фото ${lightboxIndex + 1}`}
                    fill
                    className="object-contain pointer-events-none"
                    sizes="90vw"
                    draggable={false}
                    unoptimized
                  />
                </div>
              </div>
            </motion.div>

            <div className="absolute bottom-8 rounded-full bg-black/5 px-4 py-1.5 text-sm font-bold tracking-widest text-black/60">
              {lightboxIndex + 1} / {images.length}
            </div>
          </motion.div>
      )}
    </div>
  );
}
