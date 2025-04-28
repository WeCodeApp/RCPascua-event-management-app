<script setup lang="ts">
  import Swal from 'sweetalert2';
  import { defineProps } from 'vue';

  defineProps({
    event: {
      type: Object,
      required: true,
    },
  });

  const emit = defineEmits(['edit', 'delete', 'join', 'delete-participant']);

  const handleParticipantClick = (eventId: number, participantId: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this participant from the event?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        emit('delete-participant', { eventId, participantId });
      }
    });
  };
</script>

<template>
  <div class="event-card">
    <div class="event-details">
      <h3 class="event-name">{{ event.name }}</h3>
      <p class="event-date">Date: {{ new Date(event.date).toLocaleDateString() }}</p>
      <div class="participants" v-if="event.participants.length > 0">
        <span class="participants-label">Participants:&nbsp;</span>
        <span class="participant-names">
          <span 
            v-for="(participant, index) in event.participants" 
            :key="index" 
            class="participant-name" 
            @click="handleParticipantClick(event.id, participant.id)" 
            title="Click to remove"
          >
            {{ participant.name }}
          </span>
        </span>
      </div>
      <p v-else class="no-participants">No participants yet</p>
      <div class="creation-info">
      Event Created by: {{ event.created_by }} on {{ new Date(event.created_at).toLocaleString('en-PH', { timeZone: 'Asia/Manila' }) }}
    </div>
    </div>
    
    <div class="event-actions">
      <button class="join-button" @click="emit('join', event.id)">
        <i class="fa fa-calendar" aria-hidden="true"></i> Join
      </button>
      <button class="edit-button" @click="emit('edit', event)">
        <i class="fa fa-edit" aria-hidden="true"></i> Edit
      </button>
      <button class="delete-button" @click="emit('delete', event.id)">
        <i class="fa fa-trash" aria-hidden="true"></i> Delete
      </button>
    </div>
  </div>
</template>

<style scoped>
.creation-info{
  margin-top: 10px;
  font-size: 10px;
}

.event-card {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  transition: transform 0.2s;
  cursor: pointer;
}
.event-card:hover {
  transform: scale(1.02);
}
.event-details {
  flex-grow: 1;
  margin-right: 20px;
}
.event-name {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}
.event-date {
  font-size: 18px;
  color: #666;
}
.participants {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}
.participants-label {
  font-weight: bold;
}
.participant-names {
  display: flex;
  flex-wrap: wrap;
  gap: 8px; /* Add gap between participant names */
}
.participant-name {
  padding: 4px 8px;
  border-radius: 4px;
  background-color: #2196f3;
  color: white;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.3s;
}
.participant-name:hover {
  transform: scale(1.1);
  background-color: #555; /* Change background color on hover */
}
.no-participants {
  font-size: 14px;
  color: #999;
  margin-top: 5px;
}
.event-actions {
  display: flex;
  gap: 10px;
}

.join-button,
.edit-button,
.delete-button {
  width: 100px; /* Fixed width for all buttons */
  padding: 12px 0; /* Adjust padding for consistent height */
  font-size: 14px;
  text-align: center;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

/* Join Button Styling */
.join-button {
  background-color: #4caf50;
  color: white;
}
.join-button:hover {
  background-color: #45a049;
}

/* Edit Button Styling */
.edit-button {
  background-color: #2196f3;
  color: white;
}
.edit-button:hover {
  background-color: #1976d2;
}

/* Delete Button Styling */
.delete-button {
  background-color: #f44336;
  color: white;
}
.delete-button:hover {
  background-color: #d32f2f;
}
</style>