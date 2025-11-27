import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import { Autoplay, EffectCreative, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-creative";
import "swiper/css/pagination";
import "swiper/css/autoplay";

import { useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

interface MobileShowcaseProps {
  isDark: boolean;
}

export const MobileShowcase: React.FC<MobileShowcaseProps> = ({ isDark }) => {
  const { isHalloweenMode } = useTheme();

  const getThemeFolder = () => {
    if (isHalloweenMode) return "halloween";
    if (isDark) return "dark";
    return "light";
  };

  const themeFolder = getThemeFolder();

  const images = [
    {
      src: `showcase/mobile/${themeFolder}/dashboard.webp`,
      alt: "Mobile Dashboard",
    },
    {
      src: `showcase/mobile/${themeFolder}/tasks.webp`,
      alt: "Task Management",
    },
    {
      src: `showcase/mobile/${themeFolder}/journal.webp`,
      alt: "Journal & Notes",
    },
    {
      src: `showcase/mobile/${themeFolder}/notes.webp`,
      alt: "Rich Text Notes",
    },
    {
      src: `showcase/mobile/${themeFolder}/budgets.webp`,
      alt: "Budget Tracking",
    },
    {
      src: `showcase/mobile/${themeFolder}/budgets-analytics.webp`,
      alt: "Budget Analytics",
    },
    {
      src: `showcase/mobile/${themeFolder}/accounts.webp`,
      alt: "Account Management",
    },
    {
      src: `showcase/mobile/${themeFolder}/time.webp`,
      alt: "Time Tracking",
    },
    {
      src: `showcase/mobile/${themeFolder}/pomodoro.webp`,
      alt: "Pomodoro Timer",
    },
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold mb-4 ${
              isHalloweenMode
                ? "text-[#60c9b6]"
                : isDark
                  ? "text-white"
                  : "text-gray-900"
            }`}
          >
            Mobile-First Design
          </h2>
          <p
            className={`text-base sm:text-lg md:text-xl max-w-2xl mx-auto ${
              isDark ? "text-[#B4B4B8]" : "text-gray-600"
            }`}
          >
            Seamlessly manage your productivity on the go with our fully
            responsive mobile experience
          </p>
        </motion.div>

        <div className="flex h-full w-full items-center justify-center">
          <MobileCarousel
            className=""
            images={images}
            autoplay
            showPagination
            loop
          />
        </div>
      </div>
    </section>
  );
};

const MobileCarousel = ({
  images,
  className,
  showPagination = false,
  showNavigation = false,
  loop = true,
  autoplay = false,
  spaceBetween = 0,
}: {
  images: { src: string; alt: string }[];
  className?: string;
  showPagination?: boolean;
  showNavigation?: boolean;
  loop?: boolean;
  autoplay?: boolean;
  spaceBetween?: number;
}) => {
  const css = `
  .mobile-showcase-carousel {
    width: 100%;
    aspect-ratio: 3 / 4;
    max-height: 700px;
    padding-bottom: 50px !important;
  }
  
  .mobile-showcase-carousel .swiper-slide {
    background-position: center;
    background-size: cover;
    width: 100%;
    border-radius: 25px;
    aspect-ratio: 3 / 4;
  }

  @media (min-width: 640px) {
    .mobile-showcase-carousel {
      aspect-ratio: 16 / 9;
      max-height: 600px;
    }
    
    .mobile-showcase-carousel .swiper-slide {
      width: 90%;
      aspect-ratio: 16 / 9;
    }
  }

  @media (min-width: 768px) {
    .mobile-showcase-carousel {
      max-height: 660px;
    }
    
    .mobile-showcase-carousel .swiper-slide {
      width: 900px;
    }
  }

  .mobile-showcase-carousel .swiper-pagination-bullet {
    background-color: #000 !important;
  }
  
  .dark .mobile-showcase-carousel .swiper-pagination-bullet {
    background-color: #fff !important;
  }

  .halloween .mobile-showcase-carousel .swiper-pagination-bullet {
    background-color: #60c9b6 !important;
  }
  `;
  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        duration: 0.3,
        delay: 0.5,
      }}
      className={cn("relative w-full max-w-7xl", className)}
    >
      <style>{css}</style>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full"
      >
        <Swiper
          spaceBetween={spaceBetween}
          autoplay={
            autoplay
              ? {
                  delay: 4000,
                  disableOnInteraction: false,
                }
              : false
          }
          effect="creative"
          grabCursor={true}
          slidesPerView="auto"
          centeredSlides={true}
          loop={loop}
          pagination={
            showPagination
              ? {
                  clickable: true,
                }
              : false
          }
          navigation={
            showNavigation
              ? {
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                }
              : false
          }
          className="mobile-showcase-carousel"
          creativeEffect={{
            prev: {
              shadow: true,
              translate: ["-120%", 0, -500],
              opacity: 0,
            },
            next: {
              translate: ["120%", 0, -500],
              opacity: 0,
            },
          }}
          modules={[EffectCreative, Pagination, Autoplay]}
        >
          {images.map((image, index) => (
            <SwiperSlide key={index} className="">
              <div className="h-full w-full rounded-3xl p-3 sm:p-4 md:p-8 flex items-center justify-center">
                <img
                  className="h-full w-auto object-contain drop-shadow-2xl"
                  src={image.src}
                  alt={image.alt}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
          {showNavigation && (
            <div>
              <div className="swiper-button-next after:hidden">
                <ChevronRightIcon className="h-6 w-6 text-white" />
              </div>
              <div className="swiper-button-prev after:hidden">
                <ChevronLeftIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          )}
        </Swiper>
      </motion.div>
    </motion.div>
  );
};
