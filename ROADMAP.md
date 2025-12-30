# 🗺️ Roadmap & Status (Дорожная Карта)

Актуальный статус разработки проекта Bo Landing Page.

## ✅ Реализовано (Completed)

### 🛒 Checkout & Payments
- **Stripe Integration**: Подключена тестовая оплата (Sandbox Mode).
- **API Checkout**: Эндпоинт `/api/checkout` создает сессии и обрабатывает вебхуки.
- **Cart Drawer**: Полная интеграция корзины с выбором типа заказа (Доставка/Самовывоз).

### 🎮 Gamification & Loyalty (RPG System)
- **Shake-to-Win**: Игра "потряси телефон" с реальной физикой.
- **Cooldown System**: Ограничение игры (1 раз в 24 часа) через Firestore.
- **Coupon Wallet**: Персистентный кошелек купонов, привязанный к User ID / Guest ID.
- **Redemption**: Умное применение купонов в корзине (валидация, сроки действия).

### 📊 Analytics 2.0
- **Professional Dashboard**: EBITDA, Prime Cost, COGS метрики.
- **Visuals**: Графики Recharts (Revenue Trends, Category Mix).
- **Data**: Агрегация реальных данных из заказов.

### 🛡️ Security
- **RBAC**: Ролевая модель (Admin, Manager).
- **Middleware**: Защита `/admin` роутов.

### 🔍 SEO
- **Metadata**: Динамические Title/Description для EN/RU/AR.
- **Sitemap/Robots**: Автогенерация.

---

## 🚧 В работе (In Progress)

### Telegram Mini App
- **Deep Linking**: Отладка прямых ссылок `startapp=promo`.
- **Auth**: Стабилизация авторизации через Telegram WebApp Data.

---

## 📋 План (Backlog)

### 1. Operations
- [x] **Kitchen Display System (KDS)**: Базовая версия (Unified KDS).
- [x] **Inventory**: Складской учет, списания, техкарты.
- [x] **Waiter's Mode**: Мобильный интерфейс для официантов (Прием заказа -> KDS).
- [x] **Smart KDS**: Звуковые уведомления + Разделение на цеха (Бар/Кухня).

### 2. Marketing
- [x] **Winback Automation**: Авто-рассылка купонов "вернись" (Logic implementation).
- [x] **Referral System**: "Пригласи друга - получи 50 AED".
- [x] **Push Notifications**: Напоминания о забытой корзине.

### 3. Scaling
- [ ] **QR-Menu w/ Pay-at-Table**: Концепция (Research Phase).
- [ ] **Multi-branch**: Поддержка нескольких филиалов.
- [ ] **PWA**: Возможность установки как приложение на iOS/Android.

---

## 🛠️ Технический Долг (Technical Debt)
- [ ] **Tests**: Playwright E2E тесты для критических путей (Checkout).
- [ ] **Performance**: Оптимизация LCP для изображений.
