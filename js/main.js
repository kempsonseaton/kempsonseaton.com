/* ============================================
   kempsonseaton.com — Global JS
   ============================================ */

// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', links.classList.contains('open'));
    });

    // Close nav when a link is clicked
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Fade-in on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

  // Set active nav link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Keyboard shortcuts. Buttons declare their key via data-key="x".
  // Pressing the key fires the button (visual press + navigation).
  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

    const key = (e.key || '').toLowerCase();
    if (!key || key.length !== 1) return;

    const btn = document.querySelector('a.btn[data-key="' + key + '"]');
    if (!btn) return;

    e.preventDefault();
    btn.classList.add('is-pressed');
    setTimeout(() => {
      btn.classList.remove('is-pressed');
      const target = btn.getAttribute('target');
      const href = btn.getAttribute('href');
      if (target === '_blank') {
        window.open(href, '_blank', 'noopener');
      } else if (href) {
        window.location.href = href;
      }
    }, 140);
  });

  // Homepage workflow choreography. Every few seconds, animate a data
  // packet from the trigger node, through one of the three middle
  // nodes, into the merge node and out to the email node — pulsing
  // each destination as it arrives. Looks like watching a real
  // workflow execute.
  const wfSvg = document.querySelector('.n8n-hero svg');
  const wfPacket = wfSvg && wfSvg.querySelector('#wf-packet');

  if (wfPacket) {
    const easeInOutQuad = (x) => x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const middleSegments = {
      about:    ['p-tr-ab', 'p-ab-mg'],
      projects: ['p-tr-pr', 'p-pr-mg'],
      cv:       ['p-tr-cv', 'p-cv-mg'],
    };
    const middles = Object.keys(middleSegments);

    const pulseNode = (id) => {
      const node = wfSvg.querySelector('#' + id);
      if (!node) return;
      node.classList.remove('wf-pulse');
      // Force a reflow so the animation restarts even if it just ran.
      void node.getBoundingClientRect();
      node.classList.add('wf-pulse');
    };

    const animatePacketAlong = (pathId, duration) => new Promise((resolve) => {
      const path = wfSvg.querySelector('#' + pathId);
      if (!path) return resolve();
      const length = path.getTotalLength();
      const start = performance.now();
      wfPacket.setAttribute('opacity', '1');
      const step = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const pt = path.getPointAtLength(length * easeInOutQuad(t));
        wfPacket.setAttribute('cx', pt.x);
        wfPacket.setAttribute('cy', pt.y);
        if (t < 1) requestAnimationFrame(step);
        else resolve();
      };
      requestAnimationFrame(step);
    });

    const runFlow = async () => {
      const middle = middles[Math.floor(Math.random() * middles.length)];
      const [pathA, pathB] = middleSegments[middle];
      pulseNode('node-trigger');
      await animatePacketAlong(pathA, 950);
      pulseNode('node-' + middle);
      await animatePacketAlong(pathB, 950);
      pulseNode('node-merge');
      await animatePacketAlong('p-mg-out', 700);
      pulseNode('node-output');
      wfPacket.setAttribute('opacity', '0');
      setTimeout(runFlow, 2000 + Math.random() * 2500);
    };

    // Wait a moment after page load before the first flow.
    setTimeout(runFlow, 1200);
  }
});
