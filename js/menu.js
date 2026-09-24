const MENU = new Map([
  [
    'coffee',
    [
      {
        name: 'Irish coffee',
        description:
          'Fragrant black coffee with Jameson Irish whiskey and whipped milk',
        price: '7.00',
        image: 'assets/images/coffee/coffee-1.jpg',
      },
      {
        name: 'Kahlua coffee',
        description:
          'Classic coffee with milk and Kahlua liqueur under a cap of frothed milk',
        price: '7.00',
        image: 'assets/images/coffee/coffee-2.jpg',
      },
      {
        name: 'Honey raf',
        description: 'Espresso with frothed milk, cream and aromatic honey',
        price: '5.50',
        image: 'assets/images/coffee/coffee-3.jpg',
      },
      {
        name: 'Ice cappuccino',
        description:
          'Cappuccino with soft thick foam in summer version with ice',
        price: '5.00',
        image: 'assets/images/coffee/coffee-4.jpg',
      },
      {
        name: 'Espresso',
        description: 'Classic black coffee',
        price: '4.50',
        image: 'assets/images/coffee/coffee-5.jpg',
      },
      {
        name: 'Latte',
        description:
          'Espresso coffee with the addition of steamed milk and dense milk foam',
        price: '5.50',
        image: 'assets/images/coffee/coffee-6.jpg',
      },
      {
        name: 'Latte macchiato',
        description: 'Espresso with frothed milk and chocolate',
        price: '5.50',
        image: 'assets/images/coffee/coffee-7.jpg',
      },
      {
        name: 'Coffee with cognac',
        description: 'Fragrant black coffee with cognac and whipped cream',
        price: '6.50',
        image: 'assets/images/coffee/coffee-8.jpg',
      },
    ],
  ],
  [
    'tea',
    [
      {
        name: 'Moroccan',
        description:
          'Fragrant black tea with the addition of tangerine, cinnamon, honey, lemon and mint',
        price: '4.50',
        image: 'assets/images/tea/tea-1.png',
      },
      {
        name: 'Ginger',
        description: 'Original black tea with fresh ginger, lemon and honey',
        price: '5.00',
        image: 'assets/images/tea/tea-2.png',
      },
      {
        name: 'Cranberry',
        description: 'Invigorating black tea with cranberry and honey',
        price: '5.00',
        image: 'assets/images/tea/tea-3.png',
      },
      {
        name: 'Sea buckthorn',
        description:
          'Toning sweet black tea with sea buckthorn, fresh thyme and cinnamon',
        price: '5.50',
        image: 'assets/images/tea/tea-4.png',
      },
    ],
  ],
  [
    'dessert',
    [
      {
        name: 'Marble cheesecake',
        description:
          'Philadelphia cheese with lemon zest on a light sponge cake and red currant jam',
        price: '3.50',
        image: 'assets/images/dessert/dessert-1.png',
      },
      {
        name: 'Red velvet',
        description: 'Layer cake with cream cheese frosting',
        price: '4.00',
        image: 'assets/images/dessert/dessert-2.png',
      },
      {
        name: 'Cheesecakes',
        description:
          'Soft cottage cheese pancakes with sour cream and fresh berries and sprinkled with powdered sugar',
        price: '4.50',
        image: 'assets/images/dessert/dessert-3.png',
      },
      {
        name: 'Creme brulee',
        description:
          'Delicate creamy dessert in a caramel basket with wild berries',
        price: '4.00',
        image: 'assets/images/dessert/dessert-4.png',
      },
      {
        name: 'Pancakes',
        description:
          'Tender pancakes with strawberry jam and fresh strawberries',
        price: '4.50',
        image: 'assets/images/dessert/dessert-5.png',
      },
      {
        name: 'Honey cake',
        description: 'Classic honey cake with delicate custard',
        price: '4.50',
        image: 'assets/images/dessert/dessert-6.png',
      },
      {
        name: 'Chocolate cake',
        description:
          'Cake with hot chocolate filling and nuts with dried apricots',
        price: '5.50',
        image: 'assets/images/dessert/dessert-7.png',
      },
      {
        name: 'Black forest',
        description:
          'A combination of thin sponge cake with cherry jam and light chocolate mousse',
        price: '6.50',
        image: 'assets/images/dessert/dessert-8.png',
      },
    ],
  ],
]);

class MenuCatalog {
  #category = 'coffee';
  #expanded = false;

  constructor({ root, data }) {
    this.root = root;
    this.data = data;
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

const menuRoot = document.querySelector('[data-menu]');

if (menuRoot) {
  new MenuCatalog({ root: menuRoot, data: MENU });
}
