<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/stores/auth.store'

interface Event {
  name: string
  date: string
  created_by: string
  created_at: string
}

const props = defineProps({
  event: {
    type: Object,
    default: null
  }
})

const authStore = useAuthStore()
const user = authStore.getUserFromLocalStorage
const user_name = user[0].name

const emit = defineEmits(['submit', 'cancel'])

const eventData = ref<Event>({
  name: '',
  date: '',
  created_by: user_name,
  created_at: new Date().toISOString()
})

// Element references
const eventNameInput = ref<HTMLInputElement | null>(null)
const eventDateInput = ref<HTMLInputElement | null>(null)
const submitButton = ref<HTMLButtonElement | null>(null)

onMounted(() => {
  if (props.event) {
    eventData.value = {
      name: props.event.name,
      date: new Date(props.event.date).toISOString().slice(0, 10),
      created_by: props.event.created_by,
      created_at: new Date(props.event.created_at).toISOString().slice(0, 16)
    }
  }
  eventNameInput.value?.focus()
})

const handleSubmit = () => {
  if (!eventData.value.name || !eventData.value.date) {
    Swal.fire({
      icon: 'warning',
      title: 'Incomplete Fields',
      text: 'Please fill in all fields before submitting.'
    })
    return
  }
  emit('submit', eventData.value)
}

const handleCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="event-form-container">
    <div class="event-form">
      <h2>{{ event ? 'Edit Event' : 'Add New Event' }}</h2>

      <div class="form-group">
        <label for="event-name">Event Name</label>
        <input
          id="event-name"
          ref="eventNameInput"
          v-model="eventData.name"
          type="text"
          class="form-control"
          placeholder="Enter event name"
          @keydown.enter="eventDateInput?.focus()"
        />
      </div>

      <div class="form-group">
        <label for="event-date">Event Date</label>
        <input
          id="event-date"
          ref="eventDateInput"
          v-model="eventData.date"
          type="date"
          class="form-control"
          @keydown.enter="submitButton?.focus()"
        />
      </div>

      <div class="form-actions">
        <button class="cancel-button" @click="handleCancel">
          Cancel
        </button>
        <button
          id="submit-button"
          ref="submitButton"
          class="submit-button"
          @click="handleSubmit"
          @keydown.enter="handleSubmit"
        >
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .event-form-container {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .event-form {
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .event-form h2 {
    margin-bottom: 20px;
    font-size: 20px;
    color: #333;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 14px;
    color: #555;
    font-weight: 500;
  }

  .form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .form-control:focus {
    outline: none;
    border-color: #667eea;
  }

  .form-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 20px;
  }

  .cancel-button {
    padding: 8px 16px;
    background-color: #f5f5f5;
    color: #333;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
  }

  .cancel-button:hover {
    background-color: #e0e0e0;
  }

  .submit-button {
    padding: 8px 16px;
    background-color: #667eea;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s;
  }

  .submit-button:hover {
    background-color: #5a6fd1;
  }
</style>