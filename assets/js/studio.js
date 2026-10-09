(function () {
  "use strict";
  // Both locales use the same section IDs, so language changes keep context.
  function syncLanguageLinks() {
    document.querySelectorAll('[data-language]').forEach(function (link) {
      var url = new URL(link.href);
      url.hash = window.location.hash;
      link.href = url.href;
    });
  }
  syncLanguageLinks();
  window.addEventListener('hashchange', syncLanguageLinks);
  var printButton = document.querySelector('[data-print]');
  if (printButton) {
    printButton.hidden = false;
    printButton.addEventListener('click', function () { window.print(); });
  }

  // Content stays visible by default. Animate each item only as it enters view.
  function setupMotion() {
    var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!window.IntersectionObserver || !Element.prototype.animate || preference.matches) return;
    var active = new Map();
    var delays = new Map();
    document.querySelectorAll('.home-hero__copy > *, .page-intro > :not([hidden])').forEach(function (element, index) {
      delays.set(element, Math.min(index, 5) * 75);
    });
    document.querySelectorAll('.home-profile, .home-section-heading, .home-theme, .home-current, .home-paper, .home-software-note, .home-project, .home-background__intro, .home-background .home-education li, .home-contact, .publication-year > h2, .publication, .software-card, .software-more, .cv-section').forEach(function (element) {
      var siblings = Array.from(element.parentElement.children);
      delays.set(element, Math.min(siblings.indexOf(element), 2) * 80);
    });

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var element = entry.target;
        observer.unobserve(element);
        // Keep focused content immediately readable during keyboard navigation.
        if (element.contains(document.activeElement) || preference.matches) return;
        var portrait = element.classList.contains('home-profile');
        var animation = element.animate([
          { opacity: 0, translate: '0 22px', scale: portrait ? '.97' : '1' },
          { opacity: 1, translate: '0 0', scale: '1' }
        ], {
          duration: portrait ? 950 : 760,
          delay: delays.get(element),
          easing: 'cubic-bezier(.16, 1, .3, 1)',
          fill: 'backwards'
        });
        active.set(element, animation);
        animation.onfinish = function () { active.delete(element); };
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });
    delays.forEach(function (_, element) { observer.observe(element); });

    function stopMotion() {
      observer.disconnect();
      active.forEach(function (animation) { animation.cancel(); });
      active.clear();
    }
    preference.addEventListener('change', function (event) {
      if (event.matches) stopMotion();
    });
    window.addEventListener('beforeprint', stopMotion);
    document.addEventListener('focusin', function (event) {
      active.forEach(function (animation, element) {
        if (element.contains(event.target)) {
          animation.cancel();
          active.delete(element);
        }
      });
    });
  }
  setupMotion();

  var menu = document.querySelector(".studio-menu");
  if (!menu) return;
  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { menu.open = false; });
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && menu.open) {
      menu.open = false;
      menu.querySelector("summary").focus();
    }
  });
  document.addEventListener("click", function (event) {
    if (menu.open && !menu.contains(event.target)) menu.open = false;
  });
}());
