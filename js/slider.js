const SLIDES = [
  {
    name: "S'mores Frappuccino",
    description:
      'This new drink takes an espresso and mixes it with brown sugar and cinnamon before being topped with oat milk.',
    price: '5.50',
    image: 'assets/icons/coffee-slider-1.svg',
  },
  {
    name: 'Caramel Macchiato',
    description:
      'Fragrant and unique classic espresso with rich caramel-peanut syrup, with cream under whipped thick foam.',
    price: '5.00',
    image: 'assets/icons/coffee-slider-2.svg',
  },
  {
    name: 'Ice coffee',
    description:
      'A popular summer drink that tones and invigorates. Prepared from coffee, milk and ice.',
    price: '4.50',
    image: 'assets/icons/coffee-slider-3.svg',
  },
];

const SWIPE_PX = 50;
const SWIPE_MEDIA = '(max-width: 768px)';

class FavoritesSlider {
  #root;
  #viewport;
  #track;
  #dotsRoot;
  #dots = [];
  #index = 1;
  #locked = false;
  #queued = 0;
  #hover = false;
  #hold = false;
  #dragging = false;
  #startX = 0;
  #deltaX = 0;
  #pointerId = null;
  #moveTimer = 0;
  #swipeMedia = window.matchMedia(SWIPE_MEDIA);

  constructor(root) {
    this.#root = root;
    this.#viewport = root.querySelector('[data-slider-viewport]');
    this.#track = root.querySelector('[data-slider-track]');
    this.#dotsRoot = root.querySelector('[data-slider-dots]');

    if (!this.#viewport || !this.#track || !this.#dotsRoot) {
      return;
    }

    this.#render();
    this.#bind();
    this.#apply(true);
    this.#syncDots(true);
  }

  get #count() {
    return SLIDES.length;
  }

  #realIndex() {
    if (this.#index === 0) {
      return this.#count - 1;
    }

    if (this.#index === this.#count + 1) {
      return 0;
    }

    return this.#index - 1;
  }

  #createSlide(item) {
    const slide = document.createElement('article');
    slide.className = 'slider__slide';

    const image = document.createElement('img');
    image.className = 'slider__image';
    image.src = item.image;
    image.alt = item.name;
    image.draggable = false;

    const name = document.createElement('h3');
    name.className = 'slider__name';
    name.textContent = item.name;

    const description = document.createElement('p');
    description.className = 'slider__description';
    description.textContent = item.description;

    const price = document.createElement('p');
    price.className = 'slider__price';
    price.textContent = `$${item.price}`;

    slide.append(image, name, description, price);
    return slide;
  }

  #render() {
    const slides = SLIDES.map((item) => this.#createSlide(item));
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    this.#track.replaceChildren(lastClone, ...slides, firstClone);

    this.#dots = SLIDES.map((item, index) => {
      const dot = document.createElement('button');
      dot.className = 'slider__dot';
      dot.type = 'button';
      dot.setAttribute('aria-label', `Go to ${item.name}`);
      dot.addEventListener('click', () => this.#go(index + 1));
      return dot;
    });

    this.#dotsRoot.replaceChildren(...this.#dots);
  }

  #bind() {
    this.#root
      .querySelector('[data-slider-prev]')
      ?.addEventListener('click', () => this.#go(this.#index - 1));
    this.#root
      .querySelector('[data-slider-next]')
      ?.addEventListener('click', () => this.#go(this.#index + 1));

    this.#track.addEventListener('transitionend', (event) => {
      if (event.propertyName === 'transform' && event.target === this.#track) {
        this.#onMoved();
      }
    });

    this.#dotsRoot.addEventListener('animationend', (event) => {
      if (
        event.pseudoElement === '::after' &&
        event.target.classList.contains('slider__dot--active')
      ) {
        this.#go(this.#index + 1);
      }
    });

    this.#root.addEventListener('mouseenter', () => {
      this.#hover = true;
      this.#syncPaused();
    });
    this.#root.addEventListener('mouseleave', () => {
      this.#hover = false;
      this.#syncPaused();
    });

    this.#viewport.addEventListener('pointerdown', (event) => {
      if (this.#locked || event.button || !this.#canSwipe()) {
        return;
      }

      this.#dragging = true;
      this.#hold = true;
      this.#pointerId = event.pointerId;
      this.#startX = event.clientX;
      this.#deltaX = 0;
      this.#track.classList.add('is-instant');
      this.#viewport.setPointerCapture(event.pointerId);
      this.#syncPaused();
    });

    this.#viewport.addEventListener('pointermove', (event) => {
      if (!this.#dragging || event.pointerId !== this.#pointerId) {
        return;
      }

      this.#deltaX = event.clientX - this.#startX;
      this.#apply(false);
    });

    const endDrag = (event) => {
      if (!this.#dragging || event.pointerId !== this.#pointerId) {
        return;
      }

      const delta = this.#deltaX;
      this.#stopDrag();

      if (Math.abs(delta) >= SWIPE_PX) {
        this.#go(this.#index + (delta < 0 ? 1 : -1));
        return;
      }

      this.#apply(false);
    };

    this.#viewport.addEventListener('pointerup', endDrag);
    this.#viewport.addEventListener('pointercancel', endDrag);

    window.addEventListener('resize', () => {
      if (this.#dragging) {
        if (!this.#canSwipe()) {
          this.#stopDrag();
        } else {
          return;
        }
      }

      this.#normalizeIndex();
      this.#apply(true);
      this.#unlock();
    });
  }

  #canSwipe() {
    return this.#swipeMedia.matches;
  }

  #stopDrag() {
    this.#dragging = false;
    this.#hold = false;
    this.#deltaX = 0;
    this.#pointerId = null;
    this.#track.classList.remove('is-instant');
    this.#syncPaused();
  }

  #syncPaused() {
    this.#root.classList.toggle('is-paused', this.#hover || this.#hold);
  }

  #apply(instant) {
    if (instant) {
      this.#track.classList.add('is-instant');
    }

    const width = this.#viewport.getBoundingClientRect().width;
    this.#track.style.transform = `translateX(${-this.#index * width + this.#deltaX}px)`;

    if (instant) {
      void this.#track.offsetWidth;
      this.#track.classList.remove('is-instant');
    }
  }

  #go(nextIndex) {
    if (nextIndex === this.#index) {
      return;
    }

    if (this.#locked) {
      this.#queued = Math.sign(nextIndex - this.#index);
      return;
    }

    this.#locked = true;
    this.#index = nextIndex;
    this.#apply(false);
    this.#syncDots(true);
    window.clearTimeout(this.#moveTimer);
    this.#moveTimer = window.setTimeout(() => this.#onMoved(), 700);
  }

  #normalizeIndex() {
    if (this.#index === 0) {
      this.#index = this.#count;
    } else if (this.#index === this.#count + 1) {
      this.#index = 1;
    }
  }

  #unlock() {
    this.#locked = false;
    const queued = this.#queued;
    this.#queued = 0;

    if (queued) {
      this.#go(this.#index + queued);
    }
  }

  #onMoved() {
    window.clearTimeout(this.#moveTimer);

    if (!this.#locked) {
      return;
    }

    const fromClone =
      this.#index === 0 || this.#index === this.#count + 1;

    this.#normalizeIndex();

    if (fromClone) {
      this.#apply(true);
      this.#syncDots(false);
    }

    this.#unlock();
  }

  #syncDots(restart) {
    const real = this.#realIndex();
    const active = this.#dots[real];

    if (!restart && active.classList.contains('slider__dot--active')) {
      return;
    }

    this.#dots.forEach((dot, index) => {
      dot.classList.remove('slider__dot--active');
      dot.removeAttribute('aria-current');
      if (index === real) {
        void dot.offsetWidth;
        dot.classList.add('slider__dot--active');
        dot.setAttribute('aria-current', 'true');
      }
    });
  }
}

const sliderRoot = document.querySelector('[data-slider]');

if (sliderRoot) {
  new FavoritesSlider(sliderRoot);
}
