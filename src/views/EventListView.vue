<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useEventStore } from '@/stores/event.store'
import { useAuthStore } from '@/stores/auth.store'
import EventForm from '@/components/EventForm.vue'
import EventItem from '@/components/EventItem.vue'
import NavBar from '@/components/NavBar.vue';
import Swal from 'sweetalert2'

// Import FontAwesome CSS
// import '@fortawesome/fontawesome-free/css/all.css';

const eventStore = useEventStore()
const authStore = useAuthStore()
const showForm = ref(false)
const editingEvent = ref<Event | null>(null);

// Dropdown options for limit per page
const limitOptions = [5, 10, 25, 50, 100];

// Use the getUserFromLocalStorage getter to retrieve user data
const user = authStore.getUserFromLocalStorage;

const loading = ref(false);

const user_name = user[0].name; 

const searchQuery = ref(''); // Declare searchQuery as a ref
const searchName = ref('');
const searchDate = ref('');
const searchParticipant = ref('');

// Declare totalPages as a computed property based on filtered_count if searchQuery exists
const totalPages = computed(() => {
  const count = searchQuery.value ? eventStore.filtered_count : eventStore.total_count;
  return Math.ceil(count / eventStore.limit);
});

// Dynamic pagination range
const paginationRange = computed(() => {
  const maxButtons = eventStore.maxButtons;
  const currentPage = eventStore.page;
  const total = totalPages.value;

  const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  const endPage = Math.min(total, startPage + maxButtons - 1);

  const adjustedStartPage = Math.max(1, endPage - maxButtons + 1);

  return Array.from({ length: endPage - adjustedStartPage + 1 }, (_, i) => adjustedStartPage + i);
});


const startEntry = computed(() => {
  return (eventStore.page - 1) * eventStore.limit + 1;
});

const endEntry = computed(() => {
  const potentialEnd = eventStore.page * eventStore.limit;
  return potentialEnd > eventStore.filtered_count ? eventStore.filtered_count : potentialEnd;
});

const totalEntries = computed(() => {
  return (searchName.value || searchDate.value || searchParticipant.value)
    ? eventStore.filtered_count
    : eventStore.total_count;
});

// Perform limit change based on the selected option based on const limitOptions = [5, 10, 25, 50, 100];
const handleLimitChange = async () => {
  loading.value = true;
  try {
    eventStore.page = 1; // Go to the first page when limit changes
    await eventStore.fetchEvents(null, {
      name: searchName.value,
      date: searchDate.value,
      participant: searchParticipant.value,
    });
  } finally {
    loading.value = false;
  }
 
};

// Search functionality
const searchEvents = async (page: number) => {
  loading.value = true;
  try {
    if (page == null || page == 0){
      eventStore.page = page; // Reset to the first page when searching
    }else {
      eventStore.page = 1; // Reset to the first page when searching
    }
    
    await eventStore.fetchEvents(null, { 
      name: searchName.value,
      date: searchDate.value,
      participant: searchParticipant.value
    }); // Fetch events based on the search query
  } finally {
    loading.value = false;
  }
};


// Watch for changes in the search query and trigger search
// watch([searchQuery, searchName, searchDate, searchParticipant], () => {
//   searchEvents();
// });

const handleEnterKey = async (event) => {
  if (event.keyCode === 13) {
    loading.value = true;
    try {
      // Move to the current page after query
      eventStore.page = 1
      await eventStore.fetchEvents('first', { name: searchName.value,  date: searchDate.value, participant: searchParticipant.value });
      
    } finally {
      loading.value = false;
    }
  }
}

// Function to clear the search query
const clearSearchQuery = async () => {
  loading.value = true;
  
  searchName.value = '';
  searchDate.value = '';
  searchParticipant.value = '';
  try {   
    await eventStore.fetchEvents(null, { 
      name: '',
      date: null,
      participant: ''
    }); // Fetch events based on the search query
  } finally {
    loading.value = false;
  }
};


onMounted(async () => {
  clearSearchQuery();
})



// CRUD Functionalities on Event Form
const handleEdit = async (event: any) => {
  // Get event details
  editingEvent.value = event

  // console.log('Editing event:', event)
  showForm.value = true
}


// Save the event details based on the data provided in the form
const handleFormSubmit = async (eventData: any) => {
  loading.value = true;
  showForm.value = false // hide the form
  let submit_response = '';
  try {
    if (editingEvent.value) {
      await eventStore.updateEvent(editingEvent.value.id, eventData)
      submit_response = 'The event has been successfully updated!'
    } else {
      
      editingEvent.value = null      

      await eventStore.addEvent(eventData)
      // Move to the last page after adding a new event
      
      // Reset the search fields after adding a new event
      searchName.value = '';
      searchDate.value = '';
      searchParticipant.value = '';
      // eventStore.page = Math.ceil(eventStore.total_count / eventStore.limit) // Move to the last page after adding a new event
      eventStore.fetchEvents('last');
      submit_response = 'The event has been successfully added!'
    }
  } finally {
    loading.value = false;
    Swal.fire({
      icon: 'success',
      title: 'Event Updates',
      text: submit_response,
      timer: 2500,
      showConfirmButton: false,
    })
  }
}

const handleDelete = async (id: number) => {
  const result = await Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to delete this event?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel',
  });

  if (result.isConfirmed) {
    loading.value = true;
    try {
      await eventStore.deleteEvent(id);
      // Move to the current page after deleting an event
      const currentPage = Math.min(eventStore.page, Math.ceil(eventStore.total_count / eventStore.limit));
      eventStore.page = currentPage;
      await eventStore.fetchEvents(null, { name: searchName.value,  date: searchDate.value, participant: searchParticipant.value });
      
    } finally {
      loading.value = false;
      Swal.fire('Deleted!', 'The event has been deleted.', 'success');
    }
  }
};

const handleJoin = async (eventId: number) => {
  if (!user) {
    alert('User not found...');
    return;
  }

  loading.value = true;
  try {
    let participantId = user[0].id;
    let participantName = user[0].name;

    await eventStore.joinEvent(eventId, participantName, participantId)
    
  } finally {
    loading.value = false;
  }

}

const handleDeleteParticipant = async ({ eventId, participantId }: { eventId: number; participantId: number }) => {
  loading.value = true;
  try {
    await eventStore.deleteParticipant(eventId, participantId)
  } finally {
    loading.value = false;
    Swal.fire('Removed!', 'The participant has been removed.', 'success');
  }
 
}

// Perform Pagination Navigation
const handleNext = async () => {
  loading.value = true;
  try {
    if (eventStore.page < totalPages.value) {
      eventStore.page++;
      await eventStore.fetchEvents(null, { 
        name: searchName.value,  
        date: searchDate.value, 
        participant: searchParticipant.value 
      });
    }
  } finally {
    loading.value = false;
  }
  
}

const handlePrev = async () => {
  loading.value = true;
  try {
    if (eventStore.page > 1) {
      eventStore.page--;
      await eventStore.fetchEvents(null, { 
        name: searchName.value,  
        date: searchDate.value, 
        participant: searchParticipant.value 
      });
    }
  } finally {
    loading.value = false;
  }
  
}

const handleFirstPage = async () => {
  loading.value = true;
  try {
    if(searchQuery){
      await eventStore.fetchEvents('first', { 
        name: searchName.value,  
        date: searchDate.value, 
        participant: searchParticipant.value 
      });
    }else{
      await eventStore.fetchEvents('first');
    }
  } finally {
    loading.value = false;
  }  
};

const handleLastPage = async () => {
  loading.value = true;
  try {
    if(searchQuery){
      eventStore.page = Math.ceil(eventStore.filtered_count / eventStore.limit)
      await eventStore.fetchEvents(null, { 
        name: searchName.value,  
        date: searchDate.value, 
        participant: searchParticipant.value 
      });
    }else{
      await eventStore.fetchEvents('last');
    }
  } finally {
    loading.value = false;
  }
};

const handlePageClick = async (page: number) => {
  loading.value = true;
  try {
    eventStore.page = page;
    await eventStore.fetchEvents(null, {
      name: searchName.value,
      date: searchDate.value,
      participant: searchParticipant.value
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div v-if="loading" class="loader-overlay">
    <div class="loader"></div>
  </div>

  <NavBar />

  <div class="events-container">
    <h1 align="center">Event Management App</h1>

    <div class="events-actions">
      <!-- Add Event Button -->
      <button @click="showForm = true" class="add-event-button">
        <i class="fa fa-plus"></i> Add Event
      </button>

      <!-- Clear Filter Button -->
      <button class="clear-button" @click="clearSearchQuery">
        <i class="fa fa-remove"></i> Clear Filter
      </button>

      <!-- Search/Filter Button -->
      <button class="search-button" @click="searchEvents">
        <i class="fa fa-search"></i> Search/Filter
      </button>
    </div>

    <br />
    
    <EventForm
      class="event-form"
      v-if="showForm"
      :event="editingEvent"
      @submit="handleFormSubmit"
      @cancel="showForm = false; editingEvent = null"
    />

    <nav v-if="eventStore.total_count > 0 || eventStore.filtered_count > 0" class="pagination">
      <!-- Dropdown for setting limit per page -->
      <select v-model="eventStore.limit" @change="handleLimitChange" class="limit-dropdown">
        <option v-for="option in limitOptions" :key="option" :value="option">
          {{ option }} per page
        </option>
      </select>

      <button @click="handleFirstPage" :disabled="eventStore.page === 1">First</button>
      <button @click="handlePrev" :disabled="eventStore.page === 1">Prev</button>

      <!-- Dynamic Pagination Buttons -->
      <button
        v-for="page in paginationRange"
        :key="page"
        :class="{ active: eventStore.page === page }"
        @click="handlePageClick(page)"
      >
        {{ page.toLocaleString() }}
      </button>

      <button @click="handleNext" :disabled="eventStore.page === totalPages">Next</button>
      <button @click="handleLastPage" :disabled="eventStore.page === totalPages">Last</button>
        </nav>

        <!-- Display pagination count -->
        <div class="filtered_count">
      <p>Showing {{ startEntry.toLocaleString() }} to {{ endEntry.toLocaleString() }} of {{ totalEntries.toLocaleString() }} event(s)</p>
        </div>

        <span class="page-info">
      Page {{ eventStore.page.toLocaleString() }} of {{ (totalPages == 0 ? 1 : totalPages).toLocaleString() }}
        </span>

    <span class="label-search">Filter by: </span>
    <div class="search-container">
      <div class="search-box">
        <input
          type="text"
          @keyup="handleEnterKey"
          v-model="searchName"
          placeholder="Search events..."
        />
      </div>

      <div class="search-box">
        <input
          type="text"
          @keyup="handleEnterKey"
          v-model="searchParticipant"
          placeholder="Search by participant"
        />
      </div>

      <div class="search-box">
        <input type="date" @keyup="handleEnterKey" v-model="searchDate" />
      </div>
    </div>

    <div v-if="eventStore.events.length === 0" class="empty-state">
      <p>No events found. Create your first event!</p>
    </div>
    <div v-else class="events-list">
      <EventItem
        v-for="event in eventStore.events"
        :key="event.id"
        :event="event"
        @edit="handleEdit"
        @delete="handleDelete"
        @join="handleJoin"
        @delete-participant="handleDeleteParticipant"
      />
    </div>
  </div>
</template>

<style scoped>

.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.loader {
  width: 64px;
  height: 64px;
  border: 8px solid #d3d3d3;
  border-top: 8px solid #4c6ef5;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Navbar Styling */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #4CAF50;
  padding: 10px 20px;
  color: white;
  border-radius: 8px;
  margin-bottom: 20px;
}

.navbar-left p {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.navbar-right .logout-button {
  padding: 8px 16px;
  background-color: #4230e1;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
}

.navbar-right .logout-button:hover {
  background-color: #d32f2f;
}


.events-container {
  max-width: 820px;
  margin: 0 auto;
  padding: 20px;
  /* background-color: #45a049; */
}

.events-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.events-header h1 {
  font-size: 24px;
  color: #333;
}

.events-actions {
  display: flex;
  gap: 10px;
}

.add-event-button {
  position: fixed;
  width: 140px;
  right: 20px;
  bottom: 20px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  background-color:#0a0a23;
}

.add-event-button:hover {
  background-color: #45a049;
}

/* Styling for the buttons with icons */
.add-event-button i,
.clear-button i,
.search-button i {
  margin-right: 8px;
}

/* Styling for the clear button */
.clear-button {
  position: fixed;
  width: 140px;
  right: 20px;
  bottom: 70px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  background-color:#0a0a23;
}

.clear-button:hover {
  background-color: #d32f2f;
}

.search-button{
  position: fixed;
  width: 140px;
  right: 20px;
  bottom: 120px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  transition: background-color 0.3s;
  background-color:#0a0a23;
}

.search-button:hover {
  background-color: #2fd348;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background-color: #f8f9fa;
  border-radius: 8px;
  color: #666;
}

.events-list {
  display: grid;
  gap: 20px;
}

.filtered_count{
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -20px;
  margin-bottom: 30px;
}

.page-info {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -30px;
  margin-bottom: 30px;
}

/* Pagination  */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
  margin-bottom: 30px;
}

.pagination button {
  padding: 8px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s, transform 0.2s;
}

.pagination button:hover {
  background-color: #0056b3;
  transform: scale(1.05);
}

.pagination button.active {
  background-color: #28a745;
  color: white;
  font-weight: bold;
}

.pagination button:disabled {
  background-color: #cccccc;
  color: #666666;
  cursor: not-allowed;
}

/* Dropdown styling */
.limit-dropdown {
  margin-left: 20px;
  padding: 5px 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.limit-dropdown:focus {
  outline: none;
  border-color: #007bff;
}

/* Styling for the search container */
.search-container {
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.label-search {
  font-size: 16px;
  font-weight: bold;
  margin-right: 5px;
  color: #333;
  /* display: inline-block; */
  /* margin-bottom: 20px; */
}

.search-box {
  display: inline-block;
}

.search-box input {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 250px;
  transition: border-color 0.3s;
}

.search-box input:focus {
  outline: none;
  border-color: #007bff;
}


</style>