// ==========================================================================
// NINJA KEYS — INTERACTIVE SCRIPT & UX OPTIMIZATIONS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initUrgencyTimer();
  initSmartUrgencyBar();
  initFAQAccordion();
  initStickyMobileBar();
  initTestimonialsCarousel();
  initLightbox();
});

// 1. URGENCY COUNTDOWN TIMER
function initUrgencyTimer() {
  const timerElement = document.getElementById('timer');
  if (!timerElement) return;

  let totalSeconds = 14 * 60 + 59; // 14:59 minutes countdown

  const countdownInterval = setInterval(() => {
    if (totalSeconds <= 0) {
      clearInterval(countdownInterval);
      timerElement.textContent = "00:00";
      return;
    }

    totalSeconds--;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    const formattedMins = String(minutes).padStart(2, '0');
    const formattedSecs = String(seconds).padStart(2, '0');

    timerElement.textContent = `${formattedMins}:${formattedSecs}`;
  }, 1000);
}

// 2. WHATSAPP TESTIMONIALS CAROUSEL
function initTestimonialsCarousel() {
  const carousel = document.getElementById('testimonialsCarousel');
  if (!carousel) return;

  const slides = carousel.querySelectorAll('.testimonial-slide');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const dotsContainer = document.getElementById('carouselDots');
  if (!slides.length) return;

  let currentIndex = 0;
  let autoPlayTimer = null;

  // Create indicator dots dynamically
  if (dotsContainer) {
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const dot = document.createElement('span');
      dot.classList.add('dot-item');
      if (idx === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(idx);
        resetAutoPlay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function updateSlides() {
    slides.forEach((slide, idx) => {
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.dot-item');
      dots.forEach((dot, idx) => {
        if (idx === currentIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }
  }

  function nextSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    updateSlides();
  }

  function prevSlide() {
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateSlides();
  }

  function goToSlide(index) {
    currentIndex = index;
    updateSlides();
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoPlay();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoPlay();
    });
  }

  // Auto Play every 5 seconds
  function startAutoPlay() {
    autoPlayTimer = setInterval(nextSlide, 5000);
  }

  function resetAutoPlay() {
    clearInterval(autoPlayTimer);
    startAutoPlay();
  }

  const wrapper = document.querySelector('.testimonials-carousel-wrapper');
  if (wrapper) {
    wrapper.addEventListener('mouseenter', () => clearInterval(autoPlayTimer));
    wrapper.addEventListener('mouseleave', () => startAutoPlay());
  }

  // Touch Swipe Support
  let startX = 0;
  let endX = 0;

  carousel.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  }, { passive: true });

  carousel.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      resetAutoPlay();
    }
  }, { passive: true });

  startAutoPlay();
}

// 3. LIGHTBOX FUNCTIONALITY FOR WHATSAPP TESTIMONIAL IMAGES
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const clickableContainers = document.querySelectorAll('.whatsapp-img-container');

  if (!modal || !modalImg) return;

  clickableContainers.forEach(container => {
    container.addEventListener('click', () => {
      const img = container.querySelector('img');
      if (img) {
        modalImg.src = img.src;
        modalImg.alt = img.alt;
        modal.classList.add('active');
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      modal.classList.remove('active');
    }
  });
}

// 4. FAQ ACCORDION
function initFAQAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (!questionBtn) return;

    questionBtn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      // Close all other items
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
      });

      // Toggle current item
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

// 5. STICKY MOBILE BAR INTERSECTION OBSERVER
function initStickyMobileBar() {
  const stickyBar = document.getElementById('stickyMobileBar');
  const heroSection = document.getElementById('hero');
  const finalCtaSection = document.getElementById('finalCta');

  if (!stickyBar || !heroSection) return;

  // We show sticky bar when user scrolls past hero and is NOT in final CTA
  let heroExited = false;
  let insideFinalCta = false;

  const updateStickyVisibility = () => {
    if (heroExited && !insideFinalCta) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  };

  const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      heroExited = !entry.isIntersecting;
      updateStickyVisibility();
    });
  }, { threshold: 0.1 });

  heroObserver.observe(heroSection);

  if (finalCtaSection) {
    const finalCtaObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        insideFinalCta = entry.isIntersecting;
        updateStickyVisibility();
      });
    }, { threshold: 0.1 });

    finalCtaObserver.observe(finalCtaSection);
  }
}

// 6. SMOOTH SCROLL TO PLANS
function scrollToPlans() {
  const plansSection = document.getElementById('planos');
  if (plansSection) {
    plansSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// 7. SMART URGENCY BAR SCROLL BEHAVIOR (Hide on Scroll Down, Show on Scroll Up)
function initSmartUrgencyBar() {
  const urgencyBar = document.getElementById('urgencyBar');
  if (!urgencyBar) return;

  let lastScrollTop = 0;
  const threshold = 8;

  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (Math.abs(scrollTop - lastScrollTop) <= threshold) return;

    if (scrollTop > lastScrollTop && scrollTop > 50) {
      // Scroll Down -> Hide top bar
      urgencyBar.classList.add('scroll-hidden');
    } else {
      // Scroll Up -> Show top bar
      urgencyBar.classList.remove('scroll-hidden');
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }, { passive: true });
}
