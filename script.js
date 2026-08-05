// ==========================================================================
// NINJA KEYS — INTERACTIVE SCRIPT & UX OPTIMIZATIONS
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initUrgencyTimer();
  initTerminalTyping();
  initFAQAccordion();
  initStickyMobileBar();
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

// 2. TERMINAL MOCKUP TYPEWRITER EFFECT
function initTerminalTyping() {
  const typingElement = document.getElementById('typingText');
  if (!typingElement) return;

  const commands = [
    'verifying_license --key NK-PRO-9842',
    'status: 100% ORIGINAL & LICENSED',
    'delivering_key_to_email...',
    'READY FOR INSTANT USE'
  ];

  let commandIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingSpeed = 70;

  function type() {
    const currentCommand = commands[commandIndex];

    if (isDeleting) {
      typingElement.textContent = currentCommand.substring(0, charIndex - 1);
      charIndex--;
      typingSpeed = 35;
    } else {
      typingElement.textContent = currentCommand.substring(0, charIndex + 1);
      charIndex++;
      typingSpeed = 70;
    }

    if (!isDeleting && charIndex === currentCommand.length) {
      typingSpeed = 2200; // Pause at end of line
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      commandIndex = (commandIndex + 1) % commands.length;
      typingSpeed = 400; // Pause before new line
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

// 3. FAQ ACCORDION
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

// 4. STICKY MOBILE BAR INTERSECTION OBSERVER
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

// 5. SMOOTH SCROLL TO PLANS
function scrollToPlans() {
  const plansSection = document.getElementById('planos');
  if (plansSection) {
    plansSection.scrollIntoView({ behavior: 'smooth' });
  }
}
