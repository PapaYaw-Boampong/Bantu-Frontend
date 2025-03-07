import { useEffect, useRef } from "react";

function useAutoScroll(interval = 7000, scrollAmount = 300) {
  const carouselRef = useRef(null);

  useEffect(() => {
    const scrollCarousel = () => {
      if (carouselRef.current) {
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    };

    const autoScroll = setInterval(scrollCarousel, interval);

    return () => clearInterval(autoScroll); // Cleanup on unmount
  }, [interval, scrollAmount]);

  return carouselRef;
}

export default useAutoScroll;
