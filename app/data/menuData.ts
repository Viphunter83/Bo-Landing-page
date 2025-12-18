export interface MenuItem {
  id: string
  name: string
  nameRu: string
  nameAr: string
  price: string
  desc: string
  descRu: string
  descAr: string
  tag?: string
  tagRu?: string
  tagAr?: string
  category: 'classic' | 'spicy' | 'fresh' | 'drinks' | 'desserts'
  image: string
  ingredients?: string[]
  spicy?: boolean
  vegetarian?: boolean
  glutenFree?: boolean
}

export const fullMenu: MenuItem[] = [
  // Classic / Traditional
  {
    id: 'pho-bo-special',
    name: 'Pho Bo Special',
    nameRu: 'Фо Бо Спешл',
    nameAr: 'فو بو المميز',
    price: '65 AED',
    desc: '12-hour simmered bone broth, wagyu slices, fresh herbs, rice noodles.',
    descRu: 'Бульон 12-часовой варки, слайсы вагю, свежая зелень, рисовая лапша.',
    descAr: 'مرق عظم مطهو ببطء لمدة 12 ساعة، شرائح واغيو، أعشاب طازجة، نودلز الأرز.',
    tag: 'Bestseller',
    tagRu: 'Хит',
    tagAr: 'الأكثر مبيعاً',
    category: 'classic',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=1000&q=80',
    ingredients: ['Wagyu beef', 'Bone broth', 'Rice noodles', 'Thai basil', 'Bean sprouts', 'Lime'],
    spicy: false,
    glutenFree: true
  },
  {
    id: 'pho-ga',
    name: 'Pho Ga (Chicken)',
    nameRu: 'Фо Га (Курица)',
    nameAr: 'فو جا (دجاج)',
    price: '55 AED',
    desc: 'Traditional chicken pho with aromatic broth, tender chicken, fresh herbs.',
    descRu: 'Традиционный куриный фо с ароматным бульоном, нежным мясом, свежей зеленью.',
    descAr: 'فو دجاج تقليدي مع مرق عطري، دجاج طري، أعشاب طازجة.',
    category: 'classic',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1000&q=80',
    ingredients: ['Chicken breast', 'Chicken broth', 'Rice noodles', 'Cilantro', 'Green onions'],
    spicy: false,
    glutenFree: true
  },
  {
    id: 'bun-cha',
    name: 'Bun Cha Hanoi',
    nameRu: 'Бун Ча Ханой',
    nameAr: 'بون تشا هانوي',
    price: '58 AED',
    desc: 'Grilled pork patties, vermicelli noodles, fresh herbs, nuoc cham sauce.',
    descRu: 'Жареные котлеты из свинины, вермишель, свежая зелень, соус ныок чам.',
    descAr: 'كباب لحم الخنزير المشوي، نودلز الشعيرية، أعشاب طازجة، صلصة نووك تشام.',
    tag: 'Must Try',
    tagRu: 'Must Try',
    tagAr: 'يجب تجربته',
    category: 'classic',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&q=80',
    ingredients: ['Pork patties', 'Rice vermicelli', 'Lettuce', 'Mint', 'Cilantro', 'Nuoc cham'],
    spicy: false,
    glutenFree: true
  },
  {
    id: 'banh-mi',
    name: 'Banh Mi Classic',
    nameRu: 'Бань Ми Классик',
    nameAr: 'بان مي الكلاسيكي',
    price: '42 AED',
    desc: 'Crispy baguette, grilled pork, pate, pickled vegetables, cilantro, chili.',
    descRu: 'Хрустящий багет, жареная свинина, паштет, маринованные овощи, кинза, чили.',
    descAr: 'خبز فرنسي مقرمش، لحم خنزير مشوي، باتيه، خضار مخللة، كزبرة، فلفل حار.',
    category: 'classic',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000&q=80',
    ingredients: ['Baguette', 'Grilled pork', 'Pate', 'Pickled carrots', 'Cilantro', 'Chili'],
    spicy: false
  },

  // Spicy & Bold
  {
    id: 'nem-ran',
    name: 'Nem Ran (Spicy)',
    nameRu: 'Нэм Ран (Острый)',
    nameAr: 'نيم ران (حار)',
    price: '45 AED',
    desc: 'Crispy crab spring rolls, traditional Hanoi style, served with spicy sauce.',
    descRu: 'Хрустящие спринг-роллы с крабом по-ханойски, подаются с острым соусом.',
    descAr: 'سبرينغ رولز مقرمشة بالسلطعون، على طريقة هانوي، تقدم مع صلصة حارة.',
    tag: 'Must Try',
    tagRu: 'Must Try',
    tagAr: 'يجب تجربته',
    category: 'spicy',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=1000&q=80',
    ingredients: ['Crab meat', 'Rice paper', 'Vermicelli', 'Mint', 'Lettuce', 'Spicy sauce'],
    spicy: true
  },
  {
    id: 'bun-bo-hue',
    name: 'Bun Bo Hue',
    nameRu: 'Бун Бо Хюэ',
    nameAr: 'بون بو هوي',
    price: '68 AED',
    desc: 'Spicy beef noodle soup from Hue, lemongrass broth, beef shank, pork blood.',
    descRu: 'Острый суп с лапшой и говядиной из Хюэ, бульон с лемонграссом, говяжья голяшка, свиная кровь.',
    descAr: 'حساء نودلز لحم بقري حار من هوي، مرق الليمون الحامض، لحم بقري، دم الخنزير.',
    tag: 'Spicy',
    tagRu: 'Острое',
    tagAr: 'حار',
    category: 'spicy',
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1000&q=80',
    ingredients: ['Beef shank', 'Pork blood', 'Lemongrass', 'Rice noodles', 'Chili', 'Lime'],
    spicy: true,
    glutenFree: true
  },
  {
    id: 'tom-yum-pho',
    name: 'Tom Yum Pho',
    nameRu: 'Том Ям Фо',
    nameAr: 'توم يام فو',
    price: '62 AED',
    desc: 'Fusion pho with tom yum flavors, shrimp, mushrooms, spicy lemongrass broth.',
    descRu: 'Фьюжн фо с ароматом том ям, креветки, грибы, острый бульон с лемонграссом.',
    descAr: 'فو بانكه مع نكهات توم يام، جمبري، فطر، مرق ليمون حامض حار.',
    category: 'spicy',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1000&q=80',
    ingredients: ['Shrimp', 'Mushrooms', 'Lemongrass', 'Kaffir lime', 'Chili', 'Rice noodles'],
    spicy: true,
    glutenFree: true
  },
  {
    id: 'spicy-wings',
    name: 'Vietnamese Spicy Wings',
    nameRu: 'Вьетнамские Острые Крылышки',
    nameAr: 'أجنحة فيتنامية حارة',
    price: '48 AED',
    desc: 'Crispy chicken wings marinated in Vietnamese spices, served with chili sauce.',
    descRu: 'Хрустящие куриные крылышки, маринованные во вьетнамских специях, подаются с острым соусом.',
    descAr: 'أجنحة دجاج مقرمشة متبلة بالبهارات الفيتنامية، تقدم مع صلصة الفلفل الحار.',
    category: 'spicy',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&q=80',
    ingredients: ['Chicken wings', 'Vietnamese spices', 'Garlic', 'Chili', 'Fish sauce'],
    spicy: true
  },

  // Fresh & Light
  {
    id: 'goi-cuon',
    name: 'Goi Cuon (Fresh Rolls)',
    nameRu: 'Гой Куон (Свежие Роллы)',
    nameAr: 'غوي كوون (رولز طازجة)',
    price: '38 AED',
    desc: 'Fresh spring rolls with shrimp, pork, vermicelli, herbs, peanut sauce.',
    descRu: 'Свежие спринг-роллы с креветками, свининой, вермишелью, зеленью, арахисовым соусом.',
    descAr: 'سبرينغ رولز طازجة مع جمبري، لحم خنزير، شعيرية، أعشاب، صلصة الفول السوداني.',
    category: 'fresh',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=1000&q=80',
    ingredients: ['Shrimp', 'Pork', 'Rice paper', 'Vermicelli', 'Lettuce', 'Mint', 'Peanut sauce'],
    spicy: false,
    glutenFree: true
  },
  {
    id: 'papaya-salad',
    name: 'Green Papaya Salad',
    nameRu: 'Салат из Зеленой Папайи',
    nameAr: 'سلطة البابايا الخضراء',
    price: '42 AED',
    desc: 'Shredded green papaya, carrots, herbs, peanuts, tangy dressing.',
    descRu: 'Тертая зеленая папайя, морковь, зелень, арахис, пикантная заправка.',
    descAr: 'بابايا خضراء مبشورة، جزر، أعشاب، فول سوداني، صلصة منعشة.',
    category: 'fresh',
    image: 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1000&q=80',
    ingredients: ['Green papaya', 'Carrots', 'Peanuts', 'Lime', 'Fish sauce', 'Chili'],
    spicy: false,
    vegetarian: true,
    glutenFree: true
  },
  {
    id: 'mango-shake',
    name: 'Mango Shake',
    nameRu: 'Манго Шейк',
    nameAr: 'مانجو شيك',
    price: '35 AED',
    desc: 'Fresh majestic mangoes, blended to perfection, served chilled.',
    descRu: 'Спелое манго, взбитое до идеальной текстуры, подается охлажденным.',
    descAr: 'مانجو طازج، ممزوج للكمال، يقدم بارداً.',
    tag: 'Refresh',
    tagRu: 'Освежает',
    tagAr: 'منعش',
    category: 'fresh',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1000&q=80',
    ingredients: ['Fresh mango', 'Ice', 'Condensed milk'],
    spicy: false,
    vegetarian: true,
    glutenFree: true
  },
  {
    id: 'coconut-smoothie',
    name: 'Coconut Smoothie',
    nameRu: 'Кокосовый Смузи',
    nameAr: 'سموذي جوز الهند',
    price: '32 AED',
    desc: 'Fresh coconut, coconut milk, ice, sweet and refreshing.',
    descRu: 'Свежий кокос, кокосовое молоко, лед, сладкий и освежающий.',
    descAr: 'جوز هند طازج، حليب جوز الهند، ثلج، حلو ومنعش.',
    category: 'fresh',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=1000&q=80',
    ingredients: ['Fresh coconut', 'Coconut milk', 'Ice', 'Sugar'],
    spicy: false,
    vegetarian: true,
    glutenFree: true
  },

  // Drinks
  {
    id: 'vietnamese-coffee',
    name: 'Vietnamese Iced Coffee',
    nameRu: 'Вьетнамский Кофе со Льдом',
    nameAr: 'قهوة فيتنامية مثلجة',
    price: '28 AED',
    desc: 'Strong dark roast coffee, condensed milk, served over ice.',
    descRu: 'Крепкий темный кофе, сгущенное молоко, подается со льдом.',
    descAr: 'قهوة داكنة قوية، حليب مكثف، تقدم مع الثلج.',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1000&q=80',
    ingredients: ['Dark roast coffee', 'Condensed milk', 'Ice'],
    spicy: false,
    vegetarian: true,
    glutenFree: true
  },
  {
    id: 'lemongrass-tea',
    name: 'Lemongrass Tea',
    nameRu: 'Чай с Лемонграссом',
    nameAr: 'شاي الليمون الحامض',
    price: '22 AED',
    desc: 'Fresh lemongrass, ginger, honey, served hot or iced.',
    descRu: 'Свежий лемонграсс, имбирь, мед, подается горячим или со льдом.',
    descAr: 'ليمون حامض طازج، زنجبيل، عسل، يقدم ساخناً أو مثلجاً.',
    category: 'drinks',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=1000&q=80',
    ingredients: ['Lemongrass', 'Ginger', 'Honey'],
    spicy: false,
    vegetarian: true,
    glutenFree: true
  },

  // Desserts
  {
    id: 'che-ba-mau',
    name: 'Che Ba Mau',
    nameRu: 'Че Ба Мау',
    nameAr: 'تشي با ماو',
    price: '38 AED',
    desc: 'Three-color dessert with mung beans, red beans, coconut cream, ice.',
    descRu: 'Трехцветный десерт с машем, красной фасолью, кокосовыми сливками, льдом.',
    descAr: 'حلوى ثلاثية الألوان مع الفاصوليا الخضراء، الفاصوليا الحمراء، كريمة جوز الهند، ثلج.',
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1000&q=80',
    ingredients: ['Mung beans', 'Red beans', 'Coconut cream', 'Ice', 'Sugar'],
    spicy: false,
    vegetarian: true,
    glutenFree: true
  },
  {
    id: 'banana-fritters',
    name: 'Banana Fritters',
    nameRu: 'Банановые Оладьи',
    nameAr: 'فطائر الموز',
    price: '42 AED',
    desc: 'Crispy fried bananas, coconut, sesame seeds, served with ice cream.',
    descRu: 'Хрустящие жареные бананы, кокос, кунжут, подаются с мороженым.',
    descAr: 'موز مقلي مقرمش، جوز هند، بذور السمسم، يقدم مع الآيس كريم.',
    category: 'desserts',
    image: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=1000&q=80',
    ingredients: ['Bananas', 'Coconut', 'Sesame seeds', 'Ice cream'],
    spicy: false,
    vegetarian: true
  }
]

export const getMenuByCategory = (category: string): MenuItem[] => {
  if (category === 'all') return fullMenu
  return fullMenu.filter(item => item.category === category)
}

export const getMenuItemById = (id: string): MenuItem | undefined => {
  return fullMenu.find(item => item.id === id)
}

