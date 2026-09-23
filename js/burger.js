class BurgerMenu {
  #isOpen = false;

  constructor({ button, panel, mediaQuery = '(max-width: 768px)' }) {
    this.button = button;
    this.panel = panel;
    this.media = window.matchMedia(mediaQuery);
    this.openIcon = button.querySelector('[data-burger-open]');
    this.closeIcon = button.querySelector('[data-burger-close]');
    this.links = [...panel.querySelectorAll('a')];

    this.#bind();
    this.close({ silent: true });
  }

  #bind() {
    this.button.addEventListener('click', () => this.toggle());

    this.links.forEach((link) => {
      link.addEventListener('click', () => this.close({ silent: true }));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.#isOpen) {
        this.close();
      }
    });

    this.media.addEventListener('change', (event) => {
      if (!event.matches && this.#isOpen) {
        this.close({ silent: true });
      }
    });
  }

  toggle() {
    if (this.#isOpen) {
      this.close();
      return;
    }

    this.open();
  }

  open() {
    if (!this.media.matches) {
      return;
    }

    this.#isOpen = true;
    this.panel.classList.add('is-open');
    this.panel.setAttribute('aria-hidden', 'false');
    this.panel.removeAttribute('inert');
    document.body.classList.add('is-menu-open');
    this.button.setAttribute('aria-expanded', 'true');
    this.button.setAttribute('aria-label', 'Close menu');
    this.#syncIcons();
  }

  close({ silent = false } = {}) {
    this.#isOpen = false;
    this.panel.classList.remove('is-open');
    this.panel.setAttribute('aria-hidden', 'true');
    this.panel.setAttribute('inert', '');
    document.body.classList.remove('is-menu-open');
    this.button.setAttribute('aria-expanded', 'false');
    this.button.setAttribute('aria-label', 'Open menu');
    this.#syncIcons();

    if (!silent) {
      this.button.focus();
    }
  }

  #syncIcons() {
    if (this.openIcon) {
      this.openIcon.hidden = this.#isOpen;
    }

    if (this.closeIcon) {
      this.closeIcon.hidden = !this.#isOpen;
    }
  }
}

const burgerButton = document.querySelector('[data-burger]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (burgerButton && mobileNav) {
  new BurgerMenu({ button: burgerButton, panel: mobileNav });
}
