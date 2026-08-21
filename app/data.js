/* Каталог NEBULA — 20 товаров, 4 категории */
const PRODUCTS = [
    // Стулья
    { id: 1,  name: "Стул Helix",      price: 14900,  category: "стулья", image: "assets/img/chair-helix.jpg",   inStock: true  },
    { id: 2,  name: "Стул Orbit",      price: 12900,  category: "стулья", image: "assets/img/chair-orbit.jpg",   inStock: true  },
    { id: 3,  name: "Кресло Nova",     price: 32900,  category: "стулья", image: "assets/img/chair-nova.jpg",    inStock: true  },
    { id: 4,  name: "Стул Vertex",     price: 16500,  category: "стулья", image: "assets/img/chair-vertex.jpg",  inStock: false },
    { id: 5,  name: "Табурет Puck",    price: 8900,   category: "стулья", image: "assets/img/stool-puck.jpg",    inStock: true  },
    // Столы
    { id: 6,  name: "Стол Monolith",   price: 64900,  category: "столы",  image: "assets/img/table-monolith.jpg", inStock: true  },
    { id: 7,  name: "Стол Flux",       price: 38900,  category: "столы",  image: "assets/img/table-flux.jpg",    inStock: true  },
    { id: 8,  name: "Консоль Edge",    price: 24500,  category: "столы",  image: "assets/img/table-edge.jpg",    inStock: true  },
    { id: 9,  name: "Столик Terra",    price: 19900,  category: "столы",  image: "assets/img/table-terra.jpg",   inStock: true  },
    { id: 10, name: "Стол Grid",       price: 42000,  category: "столы",  image: "assets/img/table-grid.jpg",    inStock: false },
    // Свет
    { id: 11, name: "Торшер Halo",     price: 21900,  category: "свет",   image: "assets/img/lamp-halo.jpg",     inStock: true  },
    { id: 12, name: "Лампа Dot",       price: 9900,   category: "свет",   image: "assets/img/lamp-dot.jpg",      inStock: true  },
    { id: 13, name: "Торшер Beam",     price: 18400,  category: "свет",   image: "assets/img/lamp-beam.jpg",     inStock: true  },
    { id: 14, name: "Подвес Orbe",     price: 13700,  category: "свет",   image: "assets/img/lamp-orbe.jpg",     inStock: true  },
    { id: 15, name: "Лампа Pebble",    price: 11400,  category: "свет",   image: "assets/img/lamp-pebble.jpg",   inStock: true  },
    // Диваны
    { id: 16, name: "Диван Cloud",     price: 89900,  category: "диваны", image: "assets/img/sofa-cloud.jpg",    inStock: true  },
    { id: 17, name: "Диван Atlas",     price: 129000, category: "диваны", image: "assets/img/sofa-atlas.jpg",    inStock: true  },
    { id: 18, name: "Кушетка Drift",   price: 64500,  category: "диваны", image: "assets/img/sofa-drift.jpg",    inStock: false },
    { id: 19, name: "Диван Pivot",     price: 109000, category: "диваны", image: "assets/img/sofa-pivot.jpg",    inStock: true  },
    { id: 20, name: "Пуф Moss",        price: 15900,  category: "диваны", image: "assets/img/pouf-moss.jpg",     inStock: true  },
];
