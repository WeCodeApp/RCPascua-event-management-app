import json
import random
from datetime import datetime, timedelta

# Static users data
users = [
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

# Extract user names and preserve their IDs
user_id_map = {user["name"]: user["id"] for user in users}
user_names = list(user_id_map.keys())

# Additional participant names (not in users list)
additional_names = [
    "Maria Clara", "Juan Dela Cruz", "Andres Bonifacio", "Jose Rizal"
]

# Combine all participants
all_participant_names = user_names + additional_names

# Global participant ID store to ensure consistent ID per name
global_participant_ids = {name: user_id_map[name] for name in user_names}

# Assign unique IDs to extra participants
for name in additional_names:
    global_participant_ids[name] = random.randint(10000000010000, 10099999999999)

def random_created_at():
    # Generate a datetime within the last 30 days
    random_days_ago = random.randint(0, 30*12*10)
    random_seconds = random.randint(0, 86400)
    dt = datetime.now() - timedelta(days=random_days_ago, seconds=random_seconds)
    return dt.isoformat(timespec='milliseconds') + "Z"

def generate_random_event(event_id):
    # Future date for the event (within the next 30 days)
    future_date = datetime.now() + timedelta(days=random.randint(0, 30))

    # Random creator
    created_by = random.choice(all_participant_names)

    # Random participants (unique)
    participant_pool = all_participant_names.copy()
    random.shuffle(participant_pool)
    num_participants = random.randint(1, min(5, len(participant_pool)))

    participants = []
    added_names = set()

    for name in participant_pool:
        if name not in added_names:
            added_names.add(name)
            participants.append({
                "id": global_participant_ids[name],
                "name": name
            })
        if len(participants) == num_participants:
            break

    return {
        "name": f"Event {event_id}",
        "date": future_date.strftime('%Y-%m-%d'),
        "created_by": created_by,
        "created_at": random_created_at(),
        "participants": participants,
        "id": event_id
    }

# Generate 300,000 random events (as per your updated request)
events = [generate_random_event(i + 1) for i in range(1000001)]

# Final JSON structure
data = {
    "events": events,
    "users": users
}

# Save to a local JSON file
with open("db.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)

print("✅ 'db.json' has been generated with users and 1,000,001 events.")
