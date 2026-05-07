export interface MenuItem {
  id: string
  name: string
  nameRu: string
  nameAr?: string
  nameVn?: string
  price: string
  desc: string
  descRu: string
  descAr?: string
  descVn?: string
  tag?: string
  tagRu?: string
  tagAr?: string
  tagVn?: string
  category: 'classic' | 'spicy' | 'fresh' | 'drinks' | 'desserts' | 'cocktails' | 'snacks'
  image: string
  ingredients?: string[]
  spicy?: boolean
  vegetarian?: boolean
  glutenFree?: boolean
}

export const boMenu: MenuItem[] = [
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
    desc: 'Grilled beef patties, vermicelli noodles, fresh herbs, nuoc cham sauce.',
    descRu: 'Жареные котлеты из говядины, вермишель, свежая зелень, соус ныок чам.',
    descAr: 'كباب لحم بقري مشوي، نودلز الشعيرية، أعшاب طازجة، صلصة نووك تشام.',
    tag: 'Must Try',
    tagRu: 'Must Try',
    tagAr: 'يجب تجربته',
    category: 'classic',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1000&q=80',
    ingredients: ['Beef patties', 'Rice vermicelli', 'Lettuce', 'Mint', 'Cilantro', 'Nuoc cham'],
    spicy: false,
    glutenFree: true
  },
  {
    id: 'banh-mi',
    name: 'Banh Mi Chicken',
    nameRu: 'Бань Ми Курица',
    nameAr: 'بان مي دجاج',
    price: '42 AED',
    desc: 'Crispy baguette, grilled chicken, pate, pickled vegetables, cilantro, chili.',
    descRu: 'Хрустящий багет, жареная курица, паштет, маринованные овощи, кинза, чили.',
    descAr: 'خبز فرنسي مقرمш, دجاج مشوي, باتيه, خضار مخللة, كزبرة, فلفل حار.',
    category: 'classic',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1000&q=80',
    ingredients: ['Baguette', 'Grilled chicken', 'Pate', 'Pickled carrots', 'Cilantro', 'Chili'],
    spicy: false
  },
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
    id: 'mango-shake',
    name: 'Mango Shake',
    nameRu: 'Манго Шейк',
    nameAr: 'مانجو шيك',
    price: '35 AED',
    desc: 'Fresh majestic mangoes, blended to perfection, served chilled.',
    descRu: 'Спелое манго, взбитое до идеальной текстуры, подается охлажденным.',
    descAr: 'مانجو طازج، ممزوج للكمال، يقدم بارداً.',
    tag: 'Refresh',
    tagRu: 'Освежает',
    tagAr: 'منعш',
    category: 'fresh',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=1000&q=80',
    ingredients: ['Fresh mango', 'Ice', 'Condensed milk'],
    spicy: false,
    vegetarian: true,
    glutenFree: true
  },
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
  }
];

export const lunaMenu: MenuItem[] = [
  {
    id: 'signature-cocktail',
    name: 'Luna Signature',
    nameRu: 'Авторский Луна',
    nameVn: 'Luna Signature',
    price: '180,000 VND',
    desc: 'Gin, dragon fruit, lime, and a touch of secret spice.',
    descRu: 'Джин, питахайя, лайм и секретные специи.',
    descVn: 'Gin, thanh long, chanh và một chút gia vị bí mật.',
    tag: 'Signature',
    tagRu: 'Фирменный',
    tagVn: 'Đặc trưng',
    category: 'cocktails',
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1000&q=80',
    ingredients: ['Gin', 'Dragon fruit', 'Lime', 'Spice syrup'],
    spicy: false
  },
  {
    id: 'sunset-sparkling',
    name: 'Sunset Sparkling',
    nameRu: 'Игристое Сансет',
    nameVn: 'Vang nổ Sunset',
    price: '220,000 VND',
    desc: 'Premium sparkling wine with a dash of peach schnapps.',
    descRu: 'Премиальное игристое вино с персиковым шнапсом.',
    descVn: 'Rượu vang nổ cao cấp với một chút rượu đào.',
    category: 'cocktails',
    image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1000&q=80',
    ingredients: ['Sparkling wine', 'Peach schnapps', 'Fresh peach'],
    spicy: false
  },
  {
    id: 'premium-cheese-platter',
    name: 'Premium Cheese Platter',
    nameRu: 'Сырная тарелка Премиум',
    nameVn: 'Khay phô mai cao cấp',
    price: '350,000 VND',
    desc: 'Selection of local and imported cheeses, nuts, and honey.',
    descRu: 'Ассорти местных и импортных сыров, орехи, мед.',
    descVn: 'Lựa chọn các loại phô mai nội địa và nhập khẩu, các loại hạt và mật ong.',
    category: 'snacks',
    image: 'https://images.unsplash.com/photo-1631451095765-2c91616fc9e6?w=1000&q=80',
    ingredients: ['Brie', 'Gorgonzola', 'Cheddar', 'Walnuts', 'Honey'],
    spicy: false,
    vegetarian: true
  }
];

// Determine which menu to use
export const fullMenu = process.env.NEXT_PUBLIC_TENANT_ID === 'luna_hcmc' ? lunaMenu : boMenu;

export const getMenuByCategory = (category: string): MenuItem[] => {
  if (category === 'all') return fullMenu
  return fullMenu.filter(item => item.category === category)
}

export const getMenuItemById = (id: string): MenuItem | undefined => {
  return fullMenu.find(item => item.id === id)
}
