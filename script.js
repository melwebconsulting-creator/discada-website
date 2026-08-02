/* ==========================================================================
   DISCADA • AUSTIN'S ORIGINAL TACOS DE DISCADA
   TACO MAFIA INTERACTIVE JAVASCRIPT ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     1. LOADER & INITIALIZATION
     ------------------------------------------------------------------------ */
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loader-bar');
  const loaderStatus = document.getElementById('loader-status');

  const statusMessages = [
    "FIRING UP THE PLOW DISC...",
    "HEATING MESQUITE COALS TO 600°F...",
    "SEASONING CORN TORTILLAS...",
    "BLENDING FIRE-ROASTED SALSA...",
    "WELCOME TO THE TACO MAFIA!"
  ];

  let progress = 0;
  let statusIndex = 0;

  const loaderInterval = setInterval(() => {
    progress += Math.floor(Math.random() * 15) + 10;
    if (progress > 100) progress = 100;
    
    if (loaderBar) loaderBar.style.width = `${progress}%`;
    
    if (progress >= (statusIndex + 1) * 20 && statusIndex < statusMessages.length) {
      if (loaderStatus) loaderStatus.textContent = statusMessages[statusIndex];
      statusIndex++;
    }

    if (progress >= 100) {
      clearInterval(loaderInterval);
      setTimeout(() => {
        if (loader) loader.classList.add('fade-out');
        initParticleSmoke();
      }, 500);
    }
  }, 120);

  /* ------------------------------------------------------------------------
     2. CUSTOM CURSOR
     ------------------------------------------------------------------------ */
  const cursorDot = document.getElementById('cursor-dot');
  const cursorSpray = document.getElementById('cursor-spray');

  window.addEventListener('mousemove', (e) => {
    if (cursorDot) {
      cursorDot.style.left = `${e.clientX}px`;
      cursorDot.style.top = `${e.clientY}px`;
    }
    if (cursorSpray) {
      cursorSpray.style.left = `${e.clientX}px`;
      cursorSpray.style.top = `${e.clientY}px`;
    }
  });

  window.addEventListener('mousedown', () => {
    if (cursorSpray) {
      cursorSpray.style.width = '48px';
      cursorSpray.style.height = '48px';
      cursorSpray.style.borderColor = 'var(--mustard)';
    }
  });

  window.addEventListener('mouseup', () => {
    if (cursorSpray) {
      cursorSpray.style.width = '32px';
      cursorSpray.style.height = '32px';
      cursorSpray.style.borderColor = 'var(--burnt-orange)';
    }
  });

  /* ------------------------------------------------------------------------
     3. HEADER & NAVIGATION SCROLL
     ------------------------------------------------------------------------ */
  const header = document.getElementById('main-header');
  const navItems = document.querySelectorAll('.nav-item');
  const mobileToggle = document.getElementById('mobile-menu-toggle');
  const navMenu = document.getElementById('nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  mobileToggle?.addEventListener('click', () => {
    navMenu?.classList.toggle('mobile-open');
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navMenu?.classList.remove('mobile-open');
    });
  });

  // Intersection Observer for Active Nav Link
  const sections = document.querySelectorAll('section[id]');
  const observerOptions = { threshold: 0.3 };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navItems.forEach(item => {
          if (item.getAttribute('href') === `#${id}`) {
            item.classList.add('active');
          } else {
            item.classList.remove('active');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(sec => sectionObserver.observe(sec));

  /* ------------------------------------------------------------------------
     4. CANVAS SMOKE & EMBERS PARTICLE ENGINE
     ------------------------------------------------------------------------ */
  function initParticleSmoke() {
    const canvas = document.getElementById('smokeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles = [];
    const maxParticles = 65;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        // Source particles from bottom center/right near truck grill
        this.x = canvas.width * 0.65 + (Math.random() * 120 - 60);
        this.y = canvas.height * 0.75 + (Math.random() * 40 - 20);
        this.size = Math.random() * 25 + 10;
        this.speedY = -(Math.random() * 1.5 + 0.5);
        this.speedX = Math.random() * 1 - 0.5;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.isEmber = Math.random() < 0.25; // 25% embers
        if (this.isEmber) {
          this.size = Math.random() * 3 + 1;
          this.speedY = -(Math.random() * 2.5 + 1);
          this.color = Math.random() < 0.5 ? '#E65100' : '#F59E0B';
        } else {
          this.color = 'rgba(200, 190, 180, ';
        }
      }

      update() {
        this.y += this.speedY;
        this.x += this.speedX + Math.sin(this.y * 0.02) * 0.5;
        this.size += 0.2;
        this.opacity -= 0.003;

        if (this.opacity <= 0 || this.y < 0) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        if (this.isEmber) {
          ctx.fillStyle = this.color;
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = `${this.color}${this.opacity})`;
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }

    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }

  /* ------------------------------------------------------------------------
     5. WEB AUDIO SYNTHESIZER (AMBIENT MESQUITE FIRE SIZZLE)
     ------------------------------------------------------------------------ */
  const soundToggleBtn = document.getElementById('sound-toggle');
  let audioCtx = null;
  let noiseNode = null;
  let gainNode = null;
  let isPlayingSound = false;

  function createSizzleNoise() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }

    const bufferSize = audioCtx.sampleRate * 2;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1; // Pinkish white noise
    }

    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // Filter to sound like sizzle / crackle
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 3500;
    filter.Q.value = 1.2;

    gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.08; // Comfortable ambient level

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    noiseNode.start();
  }

  soundToggleBtn?.addEventListener('click', () => {
    if (!isPlayingSound) {
      createSizzleNoise();
      isPlayingSound = true;
      soundToggleBtn.classList.add('playing');
      const label = soundToggleBtn.querySelector('.sound-label');
      if (label) label.textContent = 'SOUND: ON';
      showToast("🔥 Ambient Mesquite Fire Sizzle Playing!");
    } else {
      if (noiseNode) {
        noiseNode.stop();
        noiseNode.disconnect();
      }
      isPlayingSound = false;
      soundToggleBtn.classList.remove('playing');
      const label = soundToggleBtn.querySelector('.sound-label');
      if (label) label.textContent = 'SOUND: OFF';
    }
  });

  /* ------------------------------------------------------------------------
     6. TRUCK HOTSPOTS
     ------------------------------------------------------------------------ */
  const hsGrill = document.getElementById('hs-grill');
  const hsWindow = document.getElementById('hs-window');

  hsGrill?.addEventListener('click', () => {
    showToast("🔥 The plow disc is sizzlin' at 600°F over mesquite coals!");
    if (!isPlayingSound && soundToggleBtn) {
      soundToggleBtn.click();
    }
  });

  hsWindow?.addEventListener('click', () => {
    openModal('order-modal');
  });

  /* ------------------------------------------------------------------------
     7. INTERACTIVE DISC PROCESS TABS
     ------------------------------------------------------------------------ */
  const tabBtns = document.querySelectorAll('.disc-tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(targetTab)?.classList.add('active');
    });
  });

  /* ------------------------------------------------------------------------
     8. TACO FLAVOR CUSTOMIZER
     ------------------------------------------------------------------------ */
  const sliderMeat = document.getElementById('slider-meat');
  const sliderSpice = document.getElementById('slider-spice');
  const sliderZest = document.getElementById('slider-zest');

  const valMeat = document.getElementById('val-meat');
  const valSpice = document.getElementById('val-spice');
  const valZest = document.getElementById('val-zest');

  const fillSmoke = document.getElementById('fill-smoke');
  const fillHeat = document.getElementById('fill-heat');
  const fillUmami = document.getElementById('fill-umami');

  const customOrderBtn = document.getElementById('custom-taco-order-btn');

  const spiceLabels = ["1 - Mild Smokey", "2 - Medium", "3 - Medium (Hot)", "4 - Fire Habanero", "5 - MAFIA HEAT"];

  function updateCustomizer() {
    if (!sliderMeat || !sliderSpice || !sliderZest) return;

    const meat = parseInt(sliderMeat.value);
    const spice = parseInt(sliderSpice.value);
    const zest = parseInt(sliderZest.value);

    if (valMeat) valMeat.textContent = `${meat}%`;
    if (valSpice) valSpice.textContent = spiceLabels[spice - 1];
    if (valZest) valZest.textContent = zest > 3 ? "Extra Squeeze" : "Standard";

    // Calculate flavor meter bars
    const smokeVal = Math.min(100, Math.round(meat * 0.7 + spice * 5));
    const heatVal = Math.min(100, Math.round(spice * 20));
    const umamiVal = Math.min(100, Math.round(meat * 0.8 + zest * 4));

    if (fillSmoke) fillSmoke.style.width = `${smokeVal}%`;
    if (fillHeat) fillHeat.style.width = `${heatVal}%`;
    if (fillUmami) fillUmami.style.width = `${umamiVal}%`;
  }

  [sliderMeat, sliderSpice, sliderZest].forEach(s => s?.addEventListener('input', updateCustomizer));

  customOrderBtn?.addEventListener('click', () => {
    const spiceText = valSpice?.textContent || 'Medium';
    addToCart(`Custom Discada Taco Box (${spiceText}) - $16.50`, 16.50);
    openModal('order-modal');
  });

  /* ------------------------------------------------------------------------
     9. CART & ORDER SYSTEM
     ------------------------------------------------------------------------ */
  const cartState = [];
  const cartList = document.getElementById('cart-items-list');
  const cartSubtotal = document.getElementById('cart-subtotal');
  const cartTax = document.getElementById('cart-tax');
  const cartTotal = document.getElementById('cart-total');

  function addToCart(title, price) {
    cartState.push({ title, price });
    updateCartUI();
    showToast(`Added "${title}" to your order!`);
  }

  function updateCartUI() {
    if (!cartList) return;

    if (cartState.length === 0) {
      cartList.innerHTML = `<p class="empty-cart-msg">Your basket is currently empty. Add signature tacos from the menu!</p>`;
      if (cartSubtotal) cartSubtotal.textContent = '$0.00';
      if (cartTax) cartTax.textContent = '$0.00';
      if (cartTotal) cartTotal.textContent = '$0.00';
      return;
    }

    cartList.innerHTML = '';
    let subtotal = 0;

    cartState.forEach((item, index) => {
      subtotal += item.price;
      const row = document.createElement('div');
      row.className = 'cart-item-row';
      row.innerHTML = `
        <span>${item.title}</span>
        <div>
          <span>$${item.price.toFixed(2)}</span>
          <button class="cart-item-remove" data-index="${index}" title="Remove">✕</button>
        </div>
      `;
      cartList.appendChild(row);
    });

    const tax = subtotal * 0.0825; // 8.25% Austin Tax
    const total = subtotal + tax;

    if (cartSubtotal) cartSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    if (cartTax) cartTax.textContent = `$${tax.toFixed(2)}`;
    if (cartTotal) cartTotal.textContent = `$${total.toFixed(2)}`;

    // Rebind remove buttons
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'));
        cartState.splice(idx, 1);
        updateCartUI();
      });
    });
  }

  // Bind menu card buttons
  document.querySelectorAll('.card-order-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemStr = btn.getAttribute('data-item');
      if (itemStr) {
        const parts = itemStr.split(' - $');
        const title = parts[0];
        const price = parseFloat(parts[1]) || 15.00;
        addToCart(title, price);
      }
    });
  });

  const checkoutBtn = document.getElementById('checkout-btn');
  checkoutBtn?.addEventListener('click', () => {
    if (cartState.length === 0) {
      showToast("Please add tacos to your basket first!");
      return;
    }
    const pickupTime = document.getElementById('pickup-time')?.value || 'ASAP';
    alert(`🔥 Taco Mafia Order Placed!\n\nYour order is sent to the East 6th Street food truck!\nPickup Estimate: ${pickupTime}\n\nSee you at 1308 E 6th St!`);
    cartState.length = 0;
    updateCartUI();
    closeModal('order-modal');
  });

  /* ------------------------------------------------------------------------
     10. INTERACTIVE GRAFFITI CANVAS
     ------------------------------------------------------------------------ */
  const canvas = document.getElementById('graffitiCanvas');
  let isDrawing = false;
  let currentColor = '#E65100';
  let currentSize = 12;

  if (canvas) {
    const ctx = canvas.getContext('2d');

    // Color buttons
    document.querySelectorAll('.color-dot').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.color-dot').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentColor = btn.getAttribute('data-color') || '#E65100';
      });
    });

    // Size buttons
    document.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSize = parseInt(btn.getAttribute('data-size')) || 12;
      });
    });

    // Clear canvas
    document.getElementById('clear-canvas-btn')?.addEventListener('click', () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      showToast("Canvas cleared! Draw a new street tag!");
    });

    // Sticker Slap onto Canvas
    document.querySelectorAll('.sticker-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stickerText = btn.getAttribute('data-sticker') || 'TACO MAFIA';
        const rx = Math.random() * (canvas.width - 200) + 50;
        const ry = Math.random() * (canvas.height - 100) + 50;

        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate((Math.random() - 0.5) * 0.4);
        ctx.fillStyle = 'var(--mustard)';
        ctx.fillRect(-80, -25, 160, 50);
        ctx.strokeStyle = '#1E1E24';
        ctx.lineWidth = 3;
        ctx.strokeRect(-80, -25, 160, 50);

        ctx.fillStyle = '#1E1E24';
        ctx.font = 'bold 18px "Bebas Neue", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(stickerText, 0, 6);
        ctx.restore();

        showToast(`Slapped "${stickerText}" sticker onto the mural wall!`);
      });
    });

    // Spray paint drawing physics
    function spray(x, y) {
      ctx.fillStyle = currentColor;
      const density = currentSize * 2;
      for (let i = 0; i < density; i++) {
        const offsetX = (Math.random() - 0.5) * currentSize * 2;
        const offsetY = (Math.random() - 0.5) * currentSize * 2;
        if (offsetX * offsetX + offsetY * offsetY <= currentSize * currentSize) {
          ctx.fillRect(x + offsetX, y + offsetY, 1.5, 1.5);
        }
      }
    }

    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const coords = getCanvasCoords(e);
      spray(coords.x, coords.y);
    });

    canvas.addEventListener('mousemove', (e) => {
      if (isDrawing) {
        const coords = getCanvasCoords(e);
        spray(coords.x, coords.y);
      }
    });

    window.addEventListener('mouseup', () => { isDrawing = false; });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
      isDrawing = true;
      const coords = getCanvasCoords(e);
      spray(coords.x, coords.y);
    });
    canvas.addEventListener('touchmove', (e) => {
      if (isDrawing) {
        const coords = getCanvasCoords(e);
        spray(coords.x, coords.y);
      }
    });
    canvas.addEventListener('touchend', () => { isDrawing = false; });
  }

  /* ------------------------------------------------------------------------
     11. GALLERY FILTERS & LIGHTBOX
     ------------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.getAttribute('data-filter');

      galleryCards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-cat') === cat) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.getAttribute('data-img');
      const title = card.getAttribute('data-title');

      const lightboxImg = document.getElementById('lightbox-img');
      const lightboxCaption = document.getElementById('lightbox-caption');

      if (lightboxImg) lightboxImg.src = imgSrc || '';
      if (lightboxCaption) lightboxCaption.textContent = title || '';

      openModal('lightbox-modal');
    });
  });

  /* ------------------------------------------------------------------------
     12. MODALS & BUTTON TRIGGERS
     ------------------------------------------------------------------------ */
  function openModal(modalId) {
    document.getElementById(modalId)?.classList.add('open');
  }

  function closeModal(modalId) {
    document.getElementById(modalId)?.classList.remove('open');
  }

  // Open order modal
  document.getElementById('open-order-btn')?.addEventListener('click', () => openModal('order-modal'));
  document.getElementById('close-order-modal')?.addEventListener('click', () => closeModal('order-modal'));

  // Close lightbox
  document.getElementById('close-lightbox')?.addEventListener('click', () => closeModal('lightbox-modal'));

  // VIP Pass modal
  document.getElementById('vip-pass-btn')?.addEventListener('click', () => openModal('vip-modal'));
  document.getElementById('close-vip-modal')?.addEventListener('click', () => closeModal('vip-modal'));

  document.getElementById('copy-code-btn')?.addEventListener('click', () => {
    const codeText = document.getElementById('vip-code-text')?.textContent || 'MAFIA2025';
    navigator.clipboard?.writeText(codeText);
    showToast("📋 Copy Success! 10% OFF code saved to clipboard.");
  });

  // Catering modal
  document.getElementById('catering-modal-btn')?.addEventListener('click', () => openModal('catering-modal'));
  document.getElementById('close-catering-modal')?.addEventListener('click', () => closeModal('catering-modal'));

  document.getElementById('catering-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    alert("🔥 Catering Request Submitted!\nOur team will contact you within 24 hours to plan your Discada open-fire party!");
    closeModal('catering-modal');
  });

  // Mafia Form
  document.getElementById('mafia-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    openModal('vip-modal');
    showToast("🎉 Welcome to the Taco Mafia! Here is your VIP Pass!");
  });

  // Close modal on outside click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
      }
    });
  });

  /* ------------------------------------------------------------------------
     13. HELPER TOAST NOTIFICATION
     ------------------------------------------------------------------------ */
  function showToast(message) {
    const existing = document.querySelector('.street-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'street-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--burnt-orange);
      color: var(--cream);
      border: 2px solid var(--cream);
      font-family: var(--font-code);
      font-size: 0.9rem;
      padding: 12px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.6), 4px 4px 0px var(--charcoal);
      z-index: 10000;
      animation: toastSlide 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

});
