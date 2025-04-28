<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  error.value = ''
  const success = await authStore.login(username.value, password.value, router) // Pass router here
  if (!success) {
    error.value = 'Invalid username or password'
  }
}

const handleKeyUp = (e: KeyboardEvent, nextField?: 'password' | 'submit') => {
  if (e.key === 'Enter') {
    if (nextField === 'password') {
      document.getElementById('password')?.focus()
    } else if (nextField === 'submit') {
      handleLogin()
    }
  }
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    router.push({ name: 'events' })
  }
})


</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Event Management App</h1>
      <p class="login-subtitle">Sign in to manage your events</p>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
      
      <div class="form-group">
        <label for="username">Username</label>
        <input
          id="username"
          v-model="username"
          type="text"
          class="form-control"
          placeholder="Enter your username"
          required
          @keyup="handleKeyUp($event, 'password')"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="form-control"
          placeholder="Enter your password"
          required
          @keyup="handleKeyUp($event, 'submit')"
        />
      </div>
      
      <button class="login-button" @click="handleLogin">
        Sign In
      </button>
      
      <div class="author-info" style="text-align: center;">
        <p>Developer: <strong>RAMONCITO C. PASCUA</strong></p>
        <p>Contact info: <strong>pascuarc@gmail.com</strong></p>
        <p>Philippine Copyright@2025</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
}

.login-subtitle {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #555;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  color: #e74c3c;
  background-color: #fdecea;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}

.login-button {
  width: 100%;
  padding: 14px;
  background-color: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-button:hover {
  background-color: #5a6fd1;
}

.author-info {
  margin-top: 10px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-size: 13px;
  color: #555;
}

.author-info p {
  margin-bottom: 5px;
}

.author-info strong {
  color: #333;
}
</style>