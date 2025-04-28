import { defineStore } from 'pinia';

interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  role: number;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    BASE_URL: 'http://localhost:3000',
  }),
  getters: {
    getUsername: (state) => state.user?.username || '',
    getUserId: (state) => state.user?.id || '',
    getUserFromLocalStorage: () => {
      const userData = localStorage.getItem('user');
      return userData ? [JSON.parse(userData)] : [];
    },
  },
  actions: {
    async login(username: string, password: string, router: any) {
      try {
        const response = await fetch(this.BASE_URL + '/users');
        const users = await response.json();

        const foundUser = users.find(
          (u: User) => u.username === username && u.password === password
        );

        if (foundUser) {
          this.user = foundUser;
          this.isAuthenticated = true;
          localStorage.setItem('user', JSON.stringify(foundUser));
          router.push({ name: 'events' });
          return true;
        }
        return false;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },
    logout(router: any) {
      this.user = null;
      this.isAuthenticated = false;
      localStorage.removeItem('user');
      router.push({ name: 'login' });
    },
  },
});