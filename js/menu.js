const IMAGE_EXT = {
  coffee: 'jpg',
  tea: 'png',
  dessert: 'png',
};

function attachImages(products) {
  const counters = { coffee: 0, tea: 0, dessert: 0 };

  return products.map((product) => {
    const category = product.category;
    counters[category] += 1;
    const index = counters[category];
    const ext = IMAGE_EXT[category] ?? 'png';

    return {
      ...product,
      image: `assets/images/${category}/${category}-${index}.${ext}`,
    };
  });
}

function groupByCategory(products) {
  const map = new Map([
    ['coffee', []],
    ['tea', []],
    ['dessert', []],
  ]);

  products.forEach((product) => {
    map.get(product.category)?.push(product);
  });

  return map;
}

class ProductModal {
  #product = null;
  #size = 's';
  #additives = new Set();

  constructor(root) {
    this.root = root;
    this.dialog = root.querySelector('[data-modal-dialog]');
    this.image = root.querySelector('[data-modal-image]');
    this.title = root.querySelector('[data-modal-title]');
    this.description = root.querySelector('[data-modal-description]');
    this.sizes = root.querySelector('[data-modal-sizes]');
    this.additives = root.querySelector('[data-modal-additives]');
    this.price = root.querySelector('[data-modal-price]');
    this.#bind();
  }

  #bind() {
    this.root.querySelectorAll('[data-modal-close]').forEach((node) => {
      node.addEventListener('click', () => this.close());
    });

    this.root
      .querySelector('[data-modal-backdrop]')
      ?.addEventListener('click', () => this.close());

    this.dialog?.addEventListener('click', (event) => event.stopPropagation());

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  get isOpen() {
    return !this.root.hidden;
  }

  open(product) {
    this.#product = product;
    this.#size = 's';
    this.#additives = new Set();
    this.#render();
    this.root.hidden = false;
    document.body.classList.add('is-modal-open');
    this.root.querySelector('[data-modal-close]')?.focus();
  }

  close() {
    this.root.hidden = true;
    document.body.classList.remove('is-modal-open');
    this.#product = null;
  }

  #render() {
    if (!this.#product) {
      return;
    }

    const product = this.#product;

    this.image.src = product.image;
    this.image.alt = product.name;
    this.title.textContent = product.name;
    this.description.textContent = product.description;

    this.sizes.replaceChildren(
      ...Object.entries(product.sizes).map(([key, value]) =>
        this.#choiceButton({
          mark: key.toUpperCase(),
          label: value.size,
          active: this.#size === key,
          onClick: () => {
            this.#size = key;
            this.#render();
          },
        }),
      ),
    );

    this.additives.replaceChildren(
      ...product.additives.map((additive, index) =>
        this.#choiceButton({
          mark: String(index + 1),
          label: additive.name,
          active: this.#additives.has(index),
          onClick: () => {
            if (this.#additives.has(index)) {
              this.#additives.delete(index);
            } else {
              this.#additives.add(index);
            }
            this.#render();
          },
        }),
      ),
    );

    this.price.textContent = `$${this.#total()}`;
  }

  #choiceButton({ mark, label, active, onClick }) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `modal__choice${active ? ' modal__choice--active' : ''}`;
    button.setAttribute('aria-pressed', String(active));

    const badge = document.createElement('span');
    badge.className = 'modal__choice-badge';
    badge.textContent = mark;

    const text = document.createElement('span');
    text.className = 'modal__choice-text';
    text.textContent = label;

    button.append(badge, text);
    button.addEventListener('click', onClick);

    return button;
  }

  #total() {
    const product = this.#product;
    const base = Number.parseFloat(product.price);
    const sizeExtra = Number.parseFloat(product.sizes[this.#size]['add-price']);
    const additivesExtra = [...this.#additives].reduce((sum, index) => {
      return sum + Number.parseFloat(product.additives[index]['add-price']);
    }, 0);

    return (base + sizeExtra + additivesExtra).toFixed(2);
  }
}

class MenuCatalog {
  #category = 'coffee';
  #expanded = false;

  constructor({ root, data, modal }) {
    this.root = root;
    this.data = data;
    this.modal = modal;
    this.grid = root.querySelector('[data-menu-grid]');
    this.panel = root.querySelector('[role="tabpanel"]');
    this.tabs = [...root.querySelectorAll('[data-category]')];
    this.moreButton = root.querySelector('[data-menu-more]');
    this.media = window.matchMedia('(max-width: 768px)');
    this.#bind();
    this.render();
  }

  #bind() {
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => this.select(tab.dataset.category));
    });

    this.moreButton?.addEventListener('click', () => {
      this.#expanded = true;
      this.render();
    });

    this.media.addEventListener('change', () => {
      this.#expanded = false;
      this.render();
    });
  }

  select(category) {
    if (!this.data.has(category)) {
      return;
    }

    this.#category = category;
    this.#expanded = false;
    this.render();
  }

  #items() {
    return this.data.get(this.#category) ?? [];
  }

  #visibleItems() {
    const items = this.#items();

    if (!this.media.matches || this.#expanded) {
      return items;
    }

    return items.slice(0, 4);
  }

  #card(item) {
    const li = document.createElement('li');
    const article = document.createElement('article');
    article.className = 'menu-card';
    article.tabIndex = 0;
    article.setAttribute('role', 'button');
    article.setAttribute('aria-label', `Open ${item.name}`);

    const open = () => this.modal.open(item);
    article.addEventListener('click', open);
    article.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        open();
      }
    });

    const media = document.createElement('div');
    media.className = 'menu-card__media';

    const image = document.createElement('img');
    image.className = 'menu-card__image';
    image.src = item.image;
    image.alt = item.name;
    image.width = 310;
    image.height = 310;
    media.append(image);

    const title = document.createElement('h2');
    title.className = 'menu-card__title';
    title.textContent = item.name;

    const description = document.createElement('p');
    description.className = 'menu-card__description';
    description.textContent = item.description;

    const price = document.createElement('p');
    price.className = 'menu-card__price';
    price.textContent = `$${item.price}`;

    article.append(media, title, description, price);
    li.append(article);

    return li;
  }

  render() {
    const all = this.#items();
    const visible = this.#visibleItems();

    this.grid.replaceChildren(...visible.map((item) => this.#card(item)));

    this.tabs.forEach((tab) => {
      const selected = tab.dataset.category === this.#category;
      tab.classList.toggle('menu__tab--active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;

      if (selected && this.panel && tab.id) {
        this.panel.setAttribute('aria-labelledby', tab.id);
      }
    });

    if (this.moreButton) {
      const canExpand =
        this.media.matches && !this.#expanded && all.length > visible.length;
      this.moreButton.hidden = !canExpand;
    }
  }
}

async function initMenu() {
  const menuRoot = document.querySelector('[data-menu]');
  const modalRoot = document.querySelector('[data-modal]');

  if (!menuRoot || !modalRoot) {
    return;
  }

  const response = await fetch('products.json');
  const products = attachImages(await response.json());
  const data = groupByCategory(products);
  const modal = new ProductModal(modalRoot);

  new MenuCatalog({ root: menuRoot, data, modal });
}

initMenu();
