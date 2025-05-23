**Using Pycharm or VSCode IDE**
-->Run the script.py to generate 1 Million event data and to store in the generated db.json
-->Copy the db.json to event-management-app/data folder

**Harcoded User Credentials**

"users": [
    {
      "id": 10000000025435,
      "username": "admin",
      "password": "admin123",
      "name": "Ramoncito Pascua",
      "role": 1
    },
    {
      "id": 10000000000001,
      "username": "user1",
      "password": "user1",
      "name": "Gabriel Del Mundo",
      "role": 2
    },
    {
      "id": 10000000000002,
      "username": "user2",
      "password": "user2",
      "name": "Jerick Atchico",
      "role": 2
    },
    {
      "id": 10000000000003,
      "username": "user3",
      "password": "user3",
      "name": "Allen Garcia",
      "role": 2
    }
  ]

# event-management-app

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

event-management-app/
├── data/
│   └── db.json           # JSON Server database file
├── public/               # Static assets
├── src/
│   ├── assets/           # Static assets (images, etc.)
│   ├── components/       # Vue components
│   │   ├── EventForm.vue
│   │   └── EventItem.vue
│   ├── stores/           # Pinia stores
│   │   ├── auth.store.ts
│   │   └── event.store.ts
│   ├── views/            # Main views/pages
│   │   ├── EventListView.vue
│   │   └── LoginView.vue
│   ├── router/           # Vue Router configuration
│   │   └── index.ts
│   ├── App.vue           # Root component
│   └── main.ts           # Application entry point
├── package.json
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
└── (other config files)

