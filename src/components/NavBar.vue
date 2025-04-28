<template>
  <header class="navbar">
    <div class="navbar-left">
      <span class="navbar-title">User: {{ user_name }}</span>
    </div>
    <div class="navbar-right">
      <router-link to="/" class="nav-link">Home</router-link>
      <span>|</span>
      <router-link to="/about" class="nav-link">About</router-link>
      <span>|</span>
      <button class="logout-button" @click="handleLogout">Logout</button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

// Retrieve user data from local storage
const user = authStore.getUserFromLocalStorage
const user_name = user[0]?.name || 'Guest' // Fallback to 'Guest' if user data is unavailable

const handleLogout = () => {
  authStore.logout(router) // Perform logout and redirect
}
</script>

<style scoped>
/* Sticky Full Width Navbar */
.navbar {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 1.2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #3071d9;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-left {
  display: flex;
  align-items: center;
}

.navbar-title {
  font-size: 0.82rem;
  font-weight: bold;
  margin-left: 0.5rem;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  text-decoration: none;
  padding: 0.3rem 0.6rem;
  color: inherit;
}

.nav-link:hover {
  text-decoration: underline;
}

.logout-button {
  background-color: transparent;
  border: 1px solid #a4acb5;
  color: #93c5fd;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.logout-button:hover {
  background-color: #721909;
  color: #f6f6f7;
}
</style>
