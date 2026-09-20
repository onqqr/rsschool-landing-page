class SectionNav {
  #links;
  #sections;

  constructor(linkSelector, sectionIds) {
    this.#links = [...document.querySelectorAll(linkSelector)];
    this.#sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!this.#links.length || !this.#sections.length) {
      return;
    }

    this.#observe();
    this.#syncFromHash();
    window.addEventListener('hashchange', () => this.#syncFromHash());
  }

  #hashOf(link) {
    const href = link.getAttribute('href') || '';
    const index = href.lastIndexOf('#');
    return index === -1 ? '' : href.slice(index);
  }

  #setActive(id) {
    this.#links.forEach((link) => {
      const isActive = this.#hashOf(link) === `#${id}`;
      link.classList.toggle('header__link--active', isActive);
    });
  }

  #syncFromHash() {
    const id = window.location.hash.replace('#', '');
    if (id && this.#sections.some((section) => section.id === id)) {
      this.#setActive(id);
    }
  }

  #observe() {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]) {
          this.#setActive(visible[0].target.id);
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5, 0.75],
      },
    );

    this.#sections.forEach((section) => observer.observe(section));
  }
}

new SectionNav('.header__link', [
  'favorites',
  'about',
  'mobile-app',
  'contacts',
]);
