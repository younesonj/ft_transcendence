import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];
type CarouselVariant = "default" | "cone-vertical";

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
  variant?: CarouselVariant;
  activeIndex?: number;
  autoplayDelay?: number;
  onSlideChange?: (index: number) => void;
  onSlideCountChange?: (count: number) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  variant: CarouselVariant;
  currentIndex: number;
  slideCount: number;
  setSlideCount: (count: number) => void;
  goTo: (index: number) => void;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & CarouselProps>(
  (
    {
      orientation = "horizontal",
      opts,
      setApi,
      plugins,
      className,
      children,
      variant = "default",
      activeIndex,
      autoplayDelay,
      onSlideChange,
      onSlideCountChange,
      ...props
    },
    ref,
  ) => {
    const [carouselRef, api] = useEmblaCarousel(
      {
        ...opts,
        axis: orientation === "horizontal" ? "x" : "y",
      },
      plugins,
    );
    const [internalIndex, setInternalIndex] = React.useState(0);
    const [slideCount, setSlideCount] = React.useState(0);
    const [canScrollPrev, setCanScrollPrev] = React.useState(false);
    const [canScrollNext, setCanScrollNext] = React.useState(false);
    const isCone = variant === "cone-vertical";
    const isControlled = typeof activeIndex === "number";
    const currentIndex = isControlled ? activeIndex : internalIndex;
    const loop = Boolean(opts?.loop);

    const setCurrentIndex = React.useCallback(
      (next: number) => {
        const normalized = Number.isFinite(next) ? Math.max(0, next) : 0;
        if (!isControlled) {
          setInternalIndex(normalized);
        }
        onSlideChange?.(normalized);
      },
      [isControlled, onSlideChange],
    );

    const onSelect = React.useCallback((api: CarouselApi) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setCurrentIndex(api.selectedScrollSnap());
      onSlideCountChange?.(api.scrollSnapList().length);
    }, [onSlideCountChange, setCurrentIndex]);

    const goTo = React.useCallback(
      (index: number) => {
        if (isCone) {
          if (slideCount <= 0) return;
          const next = loop ? ((index % slideCount) + slideCount) % slideCount : Math.min(Math.max(index, 0), slideCount - 1);
          setCurrentIndex(next);
          return;
        }

        api?.scrollTo(index);
      },
      [api, isCone, loop, setCurrentIndex, slideCount],
    );

    const scrollPrev = React.useCallback(() => {
      if (isCone) {
        if (slideCount <= 1) return;
        const next = loop
          ? (currentIndex - 1 + slideCount) % slideCount
          : Math.max(currentIndex - 1, 0);
        setCurrentIndex(next);
        return;
      }

      api?.scrollPrev();
    }, [api, currentIndex, isCone, loop, setCurrentIndex, slideCount]);

    const scrollNext = React.useCallback(() => {
      if (isCone) {
        if (slideCount <= 1) return;
        const next = loop
          ? (currentIndex + 1) % slideCount
          : Math.min(currentIndex + 1, slideCount - 1);
        setCurrentIndex(next);
        return;
      }

      api?.scrollNext();
    }, [api, currentIndex, isCone, loop, setCurrentIndex, slideCount]);

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          scrollPrev();
        } else if (event.key === "ArrowRight") {
          event.preventDefault();
          scrollNext();
        }
      },
      [scrollPrev, scrollNext],
    );

    React.useEffect(() => {
      if (!isCone) {
        return;
      }
      setCanScrollPrev(loop || currentIndex > 0);
      setCanScrollNext(loop || currentIndex < Math.max(slideCount - 1, 0));
    }, [currentIndex, isCone, loop, slideCount]);

    React.useEffect(() => {
      onSlideCountChange?.(slideCount);
    }, [onSlideCountChange, slideCount]);

    React.useEffect(() => {
      if (!isCone || !autoplayDelay || autoplayDelay <= 0 || slideCount <= 1) {
        return;
      }
      const timer = window.setInterval(() => {
        const next = loop
          ? (currentIndex + 1) % slideCount
          : Math.min(currentIndex + 1, slideCount - 1);
        setCurrentIndex(next);
      }, autoplayDelay);

      return () => window.clearInterval(timer);
    }, [autoplayDelay, currentIndex, isCone, loop, setCurrentIndex, slideCount]);

    React.useEffect(() => {
      if (slideCount <= 0 || currentIndex <= slideCount - 1) {
        return;
      }
      setCurrentIndex(slideCount - 1);
    }, [currentIndex, setCurrentIndex, slideCount]);

    React.useEffect(() => {
      if (!api || !setApi) {
        return;
      }

      setApi(api);
    }, [api, setApi]);

    React.useEffect(() => {
      if (!api || isCone) {
        return;
      }

      onSelect(api);
      api.on("reInit", onSelect);
      api.on("select", onSelect);

      return () => {
        api?.off("select", onSelect);
      };
    }, [api, isCone, onSelect]);

    return (
      <CarouselContext.Provider
        value={{
          carouselRef,
          api: api,
          opts,
          orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
          scrollPrev,
          scrollNext,
          canScrollPrev,
          canScrollNext,
          variant,
          currentIndex,
          slideCount,
          setSlideCount,
          goTo,
        }}
      >
        <div
          ref={ref}
          onKeyDownCapture={handleKeyDown}
          className={cn("relative", className)}
          role="region"
          aria-roledescription="carousel"
          {...props}
        >
          {children}
        </div>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const { carouselRef, orientation, variant, currentIndex, setSlideCount } = useCarousel();
    const items = React.Children.toArray(children);

    React.useEffect(() => {
      setSlideCount(items.length);
    }, [items.length, setSlideCount]);

    if (variant === "cone-vertical") {
      const count = Math.max(items.length, 1);
      const coneHeight = 160;
      const baseRadius = 220;
      const topTaper = 100;

      return (
        <div ref={carouselRef} className="overflow-visible">
          <div
            ref={ref}
            className={cn("relative h-[26rem] sm:h-[30rem] w-full [perspective:1600px]", className)}
            {...props}
          >
            <div className="relative h-full w-full origin-center [transform-style:preserve-3d] [transform:rotateX(12deg)]">
              {items.map((child, index) => {
                if (!React.isValidElement(child)) {
                  return child;
                }

                const relative = (index - currentIndex + count) % count;
                const angle = (relative / count) * 360;
                const heightProgress = count > 1 ? relative / (count - 1) : 0;
                const y = coneHeight / 2 - heightProgress * coneHeight;
                const radius = baseRadius - heightProgress * topTaper;
                const scale = 1 - heightProgress * 0.3;
                const opacity = 1 - heightProgress * 0.6;
                const zIndex = count - relative;
                const childStyle = (child.props as { style?: React.CSSProperties }).style;

                return React.cloneElement(child as React.ReactElement, {
                  className: cn(
                    "absolute left-1/2 top-1/2 w-full max-w-[18rem] sm:max-w-[19rem] -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out will-change-transform",
                    (child.props as { className?: string }).className,
                  ),
                  style: {
                    ...childStyle,
                    transform: `translate(-50%, -50%) rotateY(${angle}deg) translateZ(${radius}px) translateY(${y}px) scale(${scale})`,
                    opacity,
                    zIndex,
                  },
                  "aria-hidden": relative !== 0,
                });
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)}
          {...props}
        >
          {children}
        </div>
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation, variant } = useCarousel();

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn(
          "min-w-0 shrink-0 grow-0",
          variant === "cone-vertical" ? "basis-auto pt-0 pl-0" : "basis-full",
          variant === "cone-vertical" ? "" : orientation === "horizontal" ? "pl-4" : "pt-4",
          className,
        )}
        {...props}
      />
    );
  },
);
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollPrev, canScrollPrev } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-left-12 top-1/2 -translate-y-1/2"
            : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollPrev}
        onClick={scrollPrev}
        {...props}
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="sr-only">Previous slide</span>
      </Button>
    );
  },
);
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, React.ComponentProps<typeof Button>>(
  ({ className, variant = "outline", size = "icon", ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <Button
        ref={ref}
        variant={variant}
        size={size}
        className={cn(
          "absolute h-8 w-8 rounded-full",
          orientation === "horizontal"
            ? "-right-12 top-1/2 -translate-y-1/2"
            : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
          className,
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <ArrowRight className="h-4 w-4" />
        <span className="sr-only">Next slide</span>
      </Button>
    );
  },
);
CarouselNext.displayName = "CarouselNext";

export { type CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext };
