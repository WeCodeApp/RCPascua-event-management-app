import { defineStore } from 'pinia'
import { useAuthStore } from './auth.store'
import Swal from 'sweetalert2'

interface Participant {
  id: number
  name: string
}

interface Event {
  id: number // Auto increment id number
  name: string
  date: string
  created_by: string
  created_at: string
  participants: Participant[]
}

export const useEventStore = defineStore('event', {
  state: () => ({
    events: [] as Event[],
    BASE_URL: 'http://localhost:3000',
    loading: false as boolean,
    limit: 5,
    page: 1,
    total_count: 0 as number,
    cachedTotalCount: null as number | null,
    filtered_count: 0 as number, // New state property for filtered count
    maxButtons: 5 // Total buttons in the paginations
  }),
  getters: {
    getEventById: (state) => (id: number) => state.events.find((event) => event.id === id),

  },
  actions: {
    async fetchTotalCount(forceRefresh = false): Promise<number> {
      if (this.cachedTotalCount !== null && !forceRefresh) {
        return this.cachedTotalCount;
      }

      try {
        const response = await fetch(`${this.BASE_URL}/events`);
        const data = await response.json();
        this.total_count = data.length;
        this.cachedTotalCount = this.total_count;

        // Adjust limit based on total_count
        if (this.total_count > 0) {
          this.limit = this.total_count >= this.maxButtons ? this.limit : this.total_count;
        }

        return this.cachedTotalCount;
      } catch (error) {
        alert('Error fetching total count: ' + error);
        return 0;
      }
    },
    
    /**
     * Fetches a page of events, with optional pagination direction and search query.
     */
    async fetchEvents(
      direction: 'next' | 'prev' | 'first' | 'last' | null = null,
      searchQuery: { name?: string; date?: string; participant?: string } = {}
    ) {
      this.loading = true;
      try {
        // 1️⃣ Handle page navigation based on previous filtered_count
        const totalPages = this.limit > 0
          ? Math.ceil(this.filtered_count / this.limit)
          : 1;
    
        switch (direction) {
          case 'next':
            if (this.page < totalPages) this.page++;
            break;
          case 'prev':
            if (this.page > 1) this.page--;
            break;
          case 'first':
            this.page = 1;
            break;
          case 'last':
            this.page = totalPages;
            break;
        }
    
        // 2️⃣ Detect whether any search filter is active
        const hasFilter =
          !!searchQuery.name ||
          !!searchQuery.date ||
          !!searchQuery.participant;
    
        if (!hasFilter) {
          // —— No filters: let json‑server do the paging
          const resp = await fetch(
            `${this.BASE_URL}/events?_page=${this.page}&_limit=${this.limit}`
          );
          const data: Event[] = await resp.json();
    
          // JSON‑Server emits X-Total-Count header when using _page
          const totalHeader = resp.headers.get('X-Total-Count');
          const total = totalHeader ? parseInt(totalHeader) : data.length;
    
          this.events = data;
          this.filtered_count = this.total_count = total;
          // adjust “limit” if fewer total items than maxButtons
          this.limit = total >= this.maxButtons ? this.limit : total;
    
        } else {
          // —— With filters: fetch all matching name/date, then client‑filter + paginate
          const params = new URLSearchParams();
          if (searchQuery.name)  params.set('name_like',  searchQuery.name);
          if (searchQuery.date)  params.set('date',       searchQuery.date);
    

          // let all: Event[] | null = await (await fetch(
          //   `${this.BASE_URL}/events?${params.toString()}`
          // )).json() as Event[];

          let all = await (await fetch(
            `${this.BASE_URL}/events?${params.toString()}`
          )).json() as Event[];
    
          // participant filter must be done client‑side
          if (searchQuery.participant) {
            const q = searchQuery.participant.toLowerCase();
            all = all.filter(ev =>
              ev.participants?.some(p =>
                p.name.toLowerCase().includes(q)
              )
            );
          }
    
          this.filtered_count = this.total_count = all.length;
          // adjust limit based on new total
          this.limit = all.length >= this.maxButtons
            ? this.limit
            : all.length;
    
          // slice for current page
          const start = (this.page - 1) * this.limit;
          this.events = all.slice(start, start + this.limit);
          
          // Free up memory by setting `all` to null
          // all = null;
          
        }
    
      } catch (err) {
        alert('Error fetching events: ' + err);
      } finally {
        this.loading = false;
      }
    },
    
    /**
     * Adds a new event and refreshes count/limit.
     */
    async addEvent(event: Omit<Event, 'id'>) { //using Omit it exclude the id from Event type since id is autogenerated
      try {
      // Check if an event with the same name and date already exists
      const existingEvent = this.events.find(
        (e) => e.name === event.name && e.date === event.date
      )
      if (existingEvent) {
        Swal.fire({
        icon: 'warning',
        title: 'Duplicate Event',
        text: 'An event with the same name and date already exists.',
        timer: 3000,
        showConfirmButton: false,
        })
        return
      }

      const response = await fetch(this.BASE_URL + '/events', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        ...event,
        participants: [],
        }),
      })
      const newEvent = await response.json()
      this.events.push(newEvent)

      return newEvent
      } catch (error) {
      alert('Error adding event: ' + error)
      }
    },
    async updateEvent(id: number, event: Partial<Event>) { //The Partial<Event> allows you to only send the fields that were changed, which is efficient for updates. This requires the method: 'PATCH' instead of 'PUT'
      try {
        const response = await fetch(this.BASE_URL + `/events/${id}`, {
          method: 'PATCH', // PATCH is use for partial updates instead of PUT (Full update)
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event),
        })
        const updatedEvent = await response.json()
        const index = this.events.findIndex((e) => e.id === id)
        if (index !== -1) {
          this.events[index] = updatedEvent
        }

        return updatedEvent
      } catch (error) {
        alert('Error updating event: ' + error)
        
      }
    },
    async deleteEvent(id: number) {
      try {
        await fetch(this.BASE_URL + `/events/${id}`, {
          method: 'DELETE',
        })
        this.events = this.events.filter((event) => event.id !== id)
      } catch (error) {
        alert('Error deleting event: ' + error)
        
      }
    },
    async joinEventAnonymous(eventId: number, participantName: string) {
      
      try {

        const authStore = useAuthStore()
        const participant_name = authStore.user?.username || participantName || 'Anonymous'
        const participant_id = authStore.user?.id || Date.now() 
        
        const response = await fetch(`${this.BASE_URL}/events/${eventId}`)
        const event: Event = await response.json()
        const participants = event.participants

        // check participants first if included or not 
        if (participants.some((p) => p.name === participantName)) {
          // alert('Participant already added in this event.')
          Swal.fire({
          icon: 'warning',
          title: 'Duplicate Participant',
          text: 'Participant already added in this event.',
          timer: 3000,
          showConfirmButton: false,
          })
          return
        } else if (participantName === '') {
          alert('Please enter a name to join the event')
          return
        } else {
          
          const eventToUpdate = this.getEventById(eventId)
          if (!eventToUpdate){
            alert('Event not found')
            return
          } 

          const newParticipant = {
            id: participant_id,
            name: participant_name, // || authStore.user?.username || 'Anonymous',
          }

          const updatedEvent = {
            ...eventToUpdate, //copy or merge events
            participants: [
              ...eventToUpdate.participants, //copy or merge participants
              newParticipant
            ],
          }

          return await this.updateEvent(eventId, updatedEvent)
          
        }
      } catch (error) {
        alert('Error joining event: ' + error)
        
      }
    },
    async joinEvent(eventId: number, participantName: string, participantId: number) {
      try {

        const response = await fetch(`${this.BASE_URL}/events/${eventId}`)
        const event: Event = await response.json()
        const participants = event.participants

        // check participants first if included or not 
        if (participants.some((p) => p.id === participantId)) {
          Swal.fire({
          icon: 'warning',
          title: 'Duplicate Participant',
          text: 'Participant already added in this event.',
          timer: 3000,
          showConfirmButton: false,
          })
          return
        } 
       
    
        if (!participantId || !participantName) {
          alert('Incomplete user data');
          return;
        }
    
        // Get the event to update
        const eventToUpdate = this.getEventById(eventId);
        if (!eventToUpdate) {
          alert('Event not found');
          return;
        }
    
        // Create a new participant object
        const newParticipant = {
          id: participantId,
          name: participantName,
        };
    
        // Create an updated version of the event with the new participant
        const updatedEvent = {
          ...eventToUpdate,
          participants: [...eventToUpdate.participants, newParticipant],
        };

        // Update the event and return the result
        return await this.updateEvent(eventId, updatedEvent);
    
      } catch (error) {
        alert('Error joining event: ' + error);
      }
    },
    async deleteParticipant(eventId: number, participantId: number) {
      try {
          // Fetch the event with proper error handling
          const response = await fetch(`${this.BASE_URL}/events/${eventId}`);
          
          if (!response.ok) {
              alert(`Event not found - Status: ${response.status}`);
          }
  
          const event: Event = await response.json();
  
          // delete participant from the event
          const updatedParticipants = event.participants.filter(p => p.id !== participantId);
          
          // Create updated event object
          const updatedEvent = {
              ...event,
              participants: updatedParticipants
          };

          return await this.updateEvent(eventId, updatedEvent)
  
      } catch (error) {
          throw new Error(`Error deleting participant: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
     
  }, // actions
})