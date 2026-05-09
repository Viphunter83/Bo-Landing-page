import { TenantConfig } from '../lib/config/tenant';

export function getContent(tenantConfig: TenantConfig) {
  const boContent = {
    en: {
      nav: { menu: "Menu", location: "Location", story: "Our Story", book: "Book a Table" },
      hero: {
        tagline: tenantConfig.brand.description.en.split('.')[0],
        sub: tenantConfig.brand.description.en.split('.')[1] || "",
        cta: "Reserve Your Table",
        location: tenantConfig.contact.address
      },
      vibe: {
        title: "What's your vibe today?",
        options: [
          { id: 'classic', label: "🍜 Traditional Soul", icon: "Leaf", desc: "Classic flavors & timeless recipes" },
          { id: 'spicy', label: "🔥 Spicy & Bold", icon: "Flame", desc: "For those who love the heat" },
          { id: 'fresh', label: "🥗 Fresh & Light", icon: "Heart", desc: "Healthy, green, and vibrant" }
        ]
      },
      menu: {
        title: "Signature Experience",
        items: [
          { name: "Chef's Special", price: `65 ${tenantConfig.localization.currency.symbol}`, desc: "12-hour simmered bone broth with premium ingredients.", tag: "Bestseller" },
          { name: "Crispy Rolls", price: `45 ${tenantConfig.localization.currency.symbol}`, desc: "Traditional style, crispy and flavorful.", tag: "Must Try" },
          { name: "Signature Drink", price: `35 ${tenantConfig.localization.currency.symbol}`, desc: "Fresh seasonal fruits, blended to perfection.", tag: "Refresh" }
        ]
      },
      social: {
        title: `Vibes @ ${tenantConfig.brand.name}`,
        follow: "Follow us"
      },
      footer: {
        address: tenantConfig.contact.address,
        hours: "Daily: 10:00 AM - 12:00 AM",
        rights: `© ${new Date().getFullYear()} ${tenantConfig.brand.name}. All rights reserved.`
      }
    },
    ru: {
      nav: { menu: "Меню", location: "Локация", story: "О нас", book: "Бронь стола" },
      hero: {
        tagline: tenantConfig.brand.description.ru.split('.')[0],
        sub: tenantConfig.brand.description.ru.split('.')[1] || "",
        cta: "Забронировать стол",
        location: tenantConfig.contact.address
      },
      vibe: {
        title: "Какое настроение сегодня?",
        options: [
          { id: 'classic', label: "🍜 Классика", icon: "Leaf", desc: "Традиции и вкус" },
          { id: 'spicy', label: "🔥 Остро и ярко", icon: "Flame", desc: "Для любителей погорячее" },
          { id: 'fresh', label: "🥗 Свежесть", icon: "Heart", desc: "Легко, полезно, зелено" }
        ]
      },
      menu: {
        title: "Хиты Меню",
        items: [
          { name: "Фирменное блюдо", price: `65 ${tenantConfig.localization.currency.symbol}`, desc: "12-часовой бульон из премиальных ингредиентов.", tag: "Хит" },
          { name: "Хрустящие роллы", price: `45 ${tenantConfig.localization.currency.symbol}`, desc: "Традиционный стиль и яркий вкус.", tag: "Must Try" },
          { name: "Авторский напиток", price: `35 ${tenantConfig.localization.currency.symbol}`, desc: "Свежие сезонные фрукты идеальной консистенции.", tag: "Освежает" }
        ]
      },
      social: {
        title: `Атмосфера @ ${tenantConfig.brand.name}`,
        follow: "Подписаться"
      },
      footer: {
        address: tenantConfig.contact.address,
        hours: "Ежедневно: 10:00 - 00:00",
        rights: `© ${new Date().getFullYear()} ${tenantConfig.brand.name}. Все права защищены.`
      }
    },
    vn: {
      nav: { menu: "Thực đơn", location: "Vị trí", story: "Câu chuyện", book: "Đặt bàn" },
      hero: {
        tagline: tenantConfig.brand.description.vn.split('.')[0],
        sub: tenantConfig.brand.description.vn.split('.')[1] || "",
        cta: "Đặt bàn ngay",
        location: tenantConfig.contact.address
      },
      vibe: {
        title: "Cảm xúc của bạn hôm nay?",
        options: [
          { id: 'classic', label: "🍜 Truyền thống", icon: "Leaf", desc: "Hương vị cổ điển & công thức vượt thời gian" },
          { id: 'spicy', label: "🔥 Cay nồng", icon: "Flame", desc: "Dành cho những người thích vị cay" },
          { id: 'fresh', label: "🥗 Tươi ngon", icon: "Heart", desc: "Khỏe mạnh, xanh và đầy sức sống" }
        ]
      },
      menu: {
        title: "Món đặc trưng",
        items: [
          { name: "Đặc sản của Bếp trưởng", price: `65 ${tenantConfig.localization.currency.symbol}`, desc: "Nước dùng ninh xương 12 giờ với nguyên liệu cao cấp.", tag: "Bán chạy nhất" },
          { name: "Chả giò giòn", price: `45 ${tenantConfig.localization.currency.symbol}`, desc: "Phong cách truyền thống, giòn và đậm đà.", tag: "Phải thử" },
          { name: "Thức uống đặc trưng", price: `35 ${tenantConfig.localization.currency.symbol}`, desc: "Trái cây tươi theo mùa, pha trộn hoàn hảo.", tag: "Giải nhiệt" }
        ]
      },
      social: {
        title: `Không gian @ ${tenantConfig.brand.name}`,
        follow: "Theo dõi chúng tôi"
      },
      footer: {
        address: tenantConfig.contact.address,
        hours: "Mỗi ngày: 10:00 AM - 12:00 AM",
        rights: `© ${new Date().getFullYear()} ${tenantConfig.brand.name}. Bảo lưu mọi quyền.`
      }
    }
  };

  const lunaContent = {
    en: {
      nav: { menu: "Cocktails", location: "Rooftop", story: "Story", book: "Reserve" },
      hero: {
        tagline: tenantConfig.brand.description.en.split('.')[0],
        sub: tenantConfig.brand.description.en.split('.')[1] || "",
        cta: "Reserve a Spot",
        location: tenantConfig.contact.address
      },
      vibe: {
        title: "Choose your atmosphere",
        options: [
          { id: 'cocktails', label: "🍸 Signature Mix", icon: "Glass", desc: "Crafted by master mixologists" },
          { id: 'privacy', label: "🌙 Private Corner", icon: "Moon", desc: "Intimate space for deep talks" },
          { id: 'party', label: "🎵 Social Night", icon: "Music", desc: "Vibrant energy and best beats" }
        ]
      },
      menu: {
        title: "Curated Selections",
        items: [
          { name: "Signature Cocktail", price: `180,000 ${tenantConfig.localization.currency.symbol}`, desc: "Dragon fruit infusion with premium gin.", tag: "Luna Favorite" },
          { name: "Sparkling Wine", price: `220,000 ${tenantConfig.localization.currency.symbol}`, desc: "Elegant bubbles for special moments.", tag: "Premium" },
          { name: "Cheese Platter", price: `350,000 ${tenantConfig.localization.currency.symbol}`, desc: "Gourmet cheese selection with honey.", tag: "Shareable" }
        ]
      },
      social: {
        title: `Moments @ ${tenantConfig.brand.name}`,
        follow: "Follow Luna"
      },
      footer: {
        address: tenantConfig.contact.address,
        hours: "Daily: 5:00 PM - 2:00 AM",
        rights: `© ${new Date().getFullYear()} ${tenantConfig.brand.name}. Premium Experiences.`
      }
    },
    ru: {
      nav: { menu: "Коктейли", location: "Крыша", story: "История", book: "Бронь" },
      hero: {
        tagline: tenantConfig.brand.description.ru.split('.')[0],
        sub: tenantConfig.brand.description.ru.split('.')[1] || "",
        cta: "Занять столик",
        location: tenantConfig.contact.address
      },
      vibe: {
        title: "Ваша атмосфера на вечер",
        options: [
          { id: 'cocktails', label: "🍸 Миксология", icon: "Glass", desc: "Шедевры от наших барменов" },
          { id: 'privacy', label: "🌙 Приватность", icon: "Moon", desc: "Уединенные уголки для бесед" },
          { id: 'party', label: "🎵 Вечеринка", icon: "Music", desc: "Энергия и лучшие биты" }
        ]
      },
      menu: {
        title: "Наш выбор",
        items: [
          { name: "Авторский коктейль", price: `180,000 ${tenantConfig.localization.currency.symbol}`, desc: "Настойка на питахайе с премиальным джином.", tag: "Хит Луны" },
          { name: "Игристое вино", price: `220,000 ${tenantConfig.localization.currency.symbol}`, desc: "Элегантные пузырьки для особых моментов.", tag: "Премиум" },
          { name: "Сырная тарелка", price: `350,000 ${tenantConfig.localization.currency.symbol}`, desc: "Гурманский выбор сыров с медом.", tag: "Для компании" }
        ]
      },
      social: {
        title: `Моменты @ ${tenantConfig.brand.name}`,
        follow: "Следите за нами"
      },
      footer: {
        address: tenantConfig.contact.address,
        hours: "Ежедневно: 17:00 - 02:00",
        rights: `© ${new Date().getFullYear()} ${tenantConfig.brand.name}. Премиальный отдых.`
      }
    },
    vn: {
      nav: { menu: "Cocktail", location: "Rooftop", story: "Câu chuyện", book: "Đặt chỗ" },
      hero: {
        tagline: tenantConfig.brand.description.vn.split('.')[0],
        sub: tenantConfig.brand.description.vn.split('.')[1] || "",
        cta: "Đặt chỗ ngay",
        location: tenantConfig.contact.address
      },
      vibe: {
        title: "Không gian của bạn",
        options: [
          { id: 'cocktails', label: "🍸 Mixology", icon: "Glass", desc: "Kiệt tác từ các chuyên gia pha chế" },
          { id: 'privacy', label: "🌙 Riêng tư", icon: "Moon", desc: "Góc nhỏ ấm cúng cho cuộc trò chuyện" },
          { id: 'party', label: "🎵 Sôi động", icon: "Music", desc: "Năng lượng và nhịp điệu tuyệt vời" }
        ]
      },
      menu: {
        title: "Lựa chọn tinh tế",
        items: [
          { name: "Cocktail đặc trưng", price: `180,000 ${tenantConfig.localization.currency.symbol}`, desc: "Sự kết hợp giữa thanh long và rượu gin cao cấp.", tag: "Yêu thích nhất" },
          { name: "Rượu vang nổ", price: `220,000 ${tenantConfig.localization.currency.symbol}`, desc: "Những bọt sủi thanh lịch cho khoảnh khắc đặc biệt.", tag: "Cao cấp" },
          { name: "Khay phô mai", price: `350,000 ${tenantConfig.localization.currency.symbol}`, desc: "Lựa chọn phô mai sành điệu với mật ong.", tag: "Chia sẻ" }
        ]
      },
      social: {
        title: `Khoảnh khắc @ ${tenantConfig.brand.name}`,
        follow: "Theo dõi Luna"
      },
      footer: {
        address: tenantConfig.contact.address,
        hours: "Mỗi ngày: 5:00 PM - 2:00 AM",
        rights: `© ${new Date().getFullYear()} ${tenantConfig.brand.name}. Trải nghiệm đẳng cấp.`
      }
    }
  };

  return tenantConfig.id === 'luna_hcmc' ? lunaContent : boContent;
}
