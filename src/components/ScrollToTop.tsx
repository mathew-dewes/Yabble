// components/ScrollToTop.tsx
import { useEffect } from "react";
import { useLocation } from "react-router";

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // 👈 smooth scroll!
    });
  }, [location.pathname]);

  return null;
};

export default ScrollToTop;
