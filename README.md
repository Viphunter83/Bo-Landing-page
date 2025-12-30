# Bo Dubai - Restaurant Platform 🍜

Современная платформа для ресторана с поддержкой PWA, Telegram Mini App и продвинутой системой управления (KDS, Inventory, CRM).

## 🚀 Быстрые ссылки

| Ресурс | Ссылка | Описание |
| :--- | :--- | :--- |
| **🌐 Web / PWA** | [bo-restuarant.vercel.app](https://bo-restuarant.vercel.app) | Основной сайт и мобильное приложение |
| **🖥️ Admin** | [/admin](https://bo-restuarant.vercel.app/admin) | Панель управления (Кухня, Склад, Маркетинг) |
| **💻 Code** | [GitHub Repo](https://github.com/Viphunter83/Bo-Landing-page.git) | Исходный код |
| **🤖 Telegram** | [@Bo_FCC_bot](https://t.me/Bo_FCC_bot) | Mini App & Admin Alerts |

---

## 🏗️ Архитектура и Модули

Проект построен как монорепозиторий на **Next.js 14**, объединяющий 4 независимых интерфейса:

### 1. 📲 Progressive Web App (PWA)
Полноценное мобильное приложение, которое устанавливается прямо из браузера.
- **Особенности**: Оффлайн-режим, Push-уведомления, Native-like UI.
- **Установка**: Нажмите "Поделиться" -> "На экран Домой" (iOS) или через баннер (Android).

### 2. 🌐 Public Website
Адаптивный лендинг для привлечения трафика и SEO.
- **Pay-at-Table**: QR-меню для заказа за столиком без официанта (`/?table=5`).
- **Геймификация**: Shake-to-Win лотерея купонов.

### 3. 🤖 Telegram Ecosystem (Bot + Mini App)
Единая точка входа через `@Bo_FCC_bot`.
- **Mini App**: Полнофункциональное приложение внутри Telegram.
- **Admin Alerts**: Бот отправляет уведомления о новых заказах в чат персонала.
- **Seamless Auth**: Мгновенный вход по Telegram ID.

### 4. 🛡️ Operations Center (Admin)
Профессиональный инструмент для управления рестораном. Работает и в Web, и внутри Telegram.
- **Smart KDS**: Кухонный экран со звуковыми оповещениями.
- **AI Inventory**: Складской учет с прогнозированием закупок и авто-списанием.
- **Waiter Mode**: Терминал официанта с PIN-авторизацией.

---

## 🛠️ Технический Стек
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: Firebase Firestore (NoSQL)
- **Payments**: Stripe Integration
- **State**: React Context + LocalStorage Persistence

## 📦 Установка и Запуск

```bash
# Клонирование
git clone https://github.com/Viphunter83/Bo-Landing-page.git

# Установка зависимостей
npm install

# Запуск локально
npm run dev
# Открыть http://localhost:3000
```

## 🗺️ Статус Разработки
Полная история изменений и план развития доступны в [ROADMAP.md](./ROADMAP.md).

**Текущая версия**: v2.0 (Production Ready) ✅

## 📝 Лицензия
© 2025 Bo Restaurant. All rights reserved.
