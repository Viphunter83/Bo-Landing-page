# 🏗 SaaS & White Label Architecture

Данный документ описывает архитектуру превращения проекта Bo Landing Page в универсальный шаблон для ресторанного бизнеса.

## 🎯 Концепция
Проект разработан как **Multi-Instance Template**. Каждый новый ресторан получает собственный экземпляр приложения на Vercel и собственную базу данных Firebase. Это обеспечивает максимальную изоляцию данных и простоту масштабирования.

## 🏗 Технический стек
- **Frontend**: Next.js 14 (App Router)
- **Deployment**: Vercel
- **Database/Auth**: Firebase (Firestore, Auth, Storage)
- **Payments**: Stripe (Connect/Standard)
- **Marketing**: Resend (Email), Telegram Bot API

## ⚙️ Процесс развертывания нового тенента (ресторана)

### 1. Инфраструктура
- Создать новый проект в [Firebase Console](https://console.firebase.google.com/).
- Создать новый проект в [Vercel](https://vercel.com/).
- Настроить Stripe Account для региона (например, Вьетнам).

### 2. Конфигурация (Branding)
Все настройки бренда управляются через `app/lib/config/tenant.ts`. 
Основные параметры:
- `brandName`: Название ресторана.
- `theme`: Цветовая палитра Tailwind.
- `features`: Флаги включения/выключения модулей (Доставка, Бронирование, AI-официант).
- `location`: Координаты, адрес, таймзона.

### 3. Переменные окружения (Environment Variables)
Для каждого проекта в Vercel должны быть заданы:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_TENANT_ID`
- `STRIPE_SECRET_KEY`
- `TELEGRAM_BOT_TOKEN`

## 🛠 Предстоящие задачи по рефакторингу
- [x] **Decoupling Branding**: Все основные упоминания бренда переведены на `tenantConfig`.
- [x] **Currency abstraction**: Валюта теперь подтягивается динамически в API Checkout и AI Prompts.
- [ ] **Security Rules Template**: Подготовить универсальный файл `firestore.rules`.
- [ ] **UI Theme Provider**: Внедрить переключение тем на основе конфига в Tailwind.

## 🚀 Управление через Vercel CLI
Для развертывания нового экземпляра используйте:
1. `vercel link --token [TOKEN]` (выбрать новый проект).
2. `vercel env add NEXT_PUBLIC_TENANT_ID luna_hcmc --token [TOKEN]`.
3. `vercel deploy --token [TOKEN]`.
