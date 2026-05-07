# Технический рефакторинг для мультитеннтности

Чтобы превратить текущий проект в универсальную платформу, где данные разных ресторанов (например, Bo и Luna) не перемешиваются, необходимо выполнить следующие шаги:

## 1. Рефакторинг Firestore (Изоляция данных)

### Текущая проблема
Сейчас заказы сохраняются в общую коллекцию `orders`, а меню берется из `menu_items` без фильтрации по ресторану.
```typescript
// Сейчас
addDoc(collection(db, 'orders'), { ...data })
```

### Рекомендуемое решение: Иерархическая структура
Мы будем использовать `tenantId` как корневой документ для всех данных ресторана.
```typescript
// Было
collection(db, 'orders')

// Стало
collection(db, 'tenants', tenantId, 'orders')
```
Это позволит:
1. Легко настраивать правила безопасности (Security Rules).
2. Удалять все данные одного ресторана одним действием.
3. Избежать коллизий ID.

## 2. Обновление Firebase Security Rules

Правила должны гарантировать, что один ресторан не может прочитать заказы другого.
```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /tenants/{tenantId}/{document=**} {
      // Разрешаем доступ только если у пользователя есть права на этот tenantId
      allow read, write: if request.auth != null && (
        request.auth.token.tenantId == tenantId || 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.tenantId == tenantId
      );
    }
  }
}
```

## 3. Динамические справочники (Меню, Склады)

### Меню
Вместо статического файла `menuData.ts`, данные должны подтягиваться из Firestore:
`tenants/{tenantId}/menu_items`.

### Настройки
Все, что сейчас находится в `tenant.ts`, должно переехать в:
`tenants/{tenantId}/config` (или храниться в самом документе тенанта).

## 4. Middleware и Роутинг

Для удобства использования разных доменов:
- `bo-restaurant.com` -> `NEXT_PUBLIC_TENANT_ID=bo_dubai`
- `luna-hcmc.vn` -> `NEXT_PUBLIC_TENANT_ID=luna_hcmc`

Vercel позволяет настраивать это через Environment Variables для каждого проекта, что мы уже начали делать.

## 5. Чек-лист для разработчика
- [ ] Заменить все вызовы `collection(db, '...')` на обертку `getTenantCollection('...')`.
- [ ] Добавить поле `tenantId` в профиль пользователя в Firebase Auth (через Custom Claims).
- [ ] Реализовать миграцию текущих данных Bo в новую структуру `tenants/bo_dubai/...`.

---
Этот подход превратит проект в полноценную SaaS-платформу.
