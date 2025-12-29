# Bo Restaurant Landing Page

Современный лендинг для ресторана Bo в Дубае с поддержкой трех языков (EN/RU/AR) и адаптивным дизайном.

## 🚀 Технологии

- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - Типизация
- **Tailwind CSS** - Стилизация
- **Lucide React** - Иконки
- **Next/Image** - Оптимизация изображений

## 📦 Установка

```bash
npm install
```

## 🛠️ Разработка

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) в браузере.

## 🏗️ Сборка для продакшена

```bash
npm run build
npm start
```

## 🚢 Деплой на Vercel

### Вариант 1: Через Vercel Dashboard

1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите "New Project"
3. Подключите ваш Git репозиторий
4. Vercel автоматически определит Next.js и настроит проект

### Вариант 2: Через Vercel CLI

```bash
npm i -g vercel
vercel
```

### Вариант 3: Через MCP (если доступно)

Проект готов к деплою через Vercel MCP инструменты.

## ✨ Особенности (Features)

### 🎮 RPG Loyalty System
- **Shake-to-Win**: Геймифицированная механика получения скидок с использованием акселерометра.
- **Coupon Wallet**: Встроенный кошелек для хранения и применения выигранных купонов.
- **Smart Cooldowns**: Система ограничений (24ч) для предотвращения абуза.

### 📊 Professional Analytics
- **Financial Dashboard**: EBITDA, Revenue, COGS в реальном времени.
- **Interactive Charts**: Визуализация трендов продаж и популярных позиций.

### 🌍 Core Features
- **Мультиязычность**: Полная поддержка EN, RU, AR (RTL).
- **Payments**: Интеграция Stripe (Test Mode) и наличных расчетов.
- **Telegram Native**: Глубокая интеграция с Telegram Mini Apps.

## 🗺️ Статус и Дорожная Карта

Подробный статус проекта и план разработки доступны в файле [ROADMAP.md](./ROADMAP.md).

Текущий статус: **Production Safe Beta** 🚀

## 📁 Структура проекта

```
├── app/
│   ├── admin/          # Админ-панель (Защищена)
│   ├── api/            # Backend API (Checkout, Webhooks)
│   ├── components/     # UI Components (Shadcn + Custom)
│   ├── lib/            # Утилиты, DB Logic, Types
│   └── ...
├── public/            # Статика
└── ...
```

## 📝 Лицензия

© 2025 Bo Restaurant. All rights reserved.

