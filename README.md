# 🏴‍☠️ Shambles Seating

### **Your Berth. Your Crew. Your Voyage.**

> A realtime event RSVP and deterministic waitlist management system where every berth matters and every crew gets a fair chance to board.

**Frontend Roulette 1.0** · **PS-09 — Smart Event RSVP and Waitlist Management System**
**Team:** The Lost Poneglyph Files

---

## ⚓ The Problem

Event registration becomes messy when capacity is limited.

A simple **50-person capacity** can quickly turn into:

**50/50 → Cancellation → ???**

Who gets the released berth?

How do we prevent over-capacity registration?

How does a participant know their position in the queue?

What happens if the promoted participant doesn't claim their berth?

Shambles Seating turns this uncertainty into a **server-enforced, deterministic, realtime system**.

---

## 🗺️ What Shambles Seating Does

Shambles Seating manages the complete lifecycle of a limited-capacity event:

* 🎟️ Crew registration
* 🚢 Event capacity management
* 🛡️ Prevention of over-capacity registration
* 📜 Deterministic FIFO waitlist
* 🔢 Live queue position
* ❌ Participant cancellation
* 🔓 Automatic berth release
* ⏱️ Server-enforced 10-minute berth offers
* 💥 Offer expiration
* 🔄 Automatic promotion to the next eligible crew
* ⚡ Realtime state updates
* 🎫 Digital access passes
* 🧭 Admin Command Deck

The result is a system where a cancelled berth doesn't simply disappear.

**The Grand Line moves.**

---

# 🌊 Core Flow

```text
CREW REGISTERS
      │
      ▼
┌─────────────────┐
│  BERTH AVAILABLE │
└────────┬────────┘
         │
    ┌────▼────┐
    │ CONFIRM │
    └────┬────┘
         │
         ▼
   EVENT CAPACITY
         │
         │ Full?
         ▼
┌──────────────────┐
│ DETERMINISTIC    │
│ FIFO WAITLIST    │
└────────┬─────────┘
         │
         │ Cancellation
         ▼
┌──────────────────┐
│ BERTH RELEASED   │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ FIRST ELIGIBLE   │
│ WAITLISTED CREW  │
└────────┬─────────┘
         ▼
┌──────────────────┐
│ 10-MINUTE BERTH  │
│ OFFER            │
└────────┬─────────┘
         │
     ┌───┴────┐
     ▼        ▼
   CLAIM    EXPIRE
     │        │
     ▼        ▼
  CONFIRMED  NEXT CREW
```

---

# 🧭 Demo Event

### FRONTEND ROULETTE 1.0

| Detail        | Information          |
| ------------- | -------------------- |
| 📅 Date       | 28 September 2026    |
| ⏰ Time        | 9:30 AM – 4:10 PM    |
| 📍 Venue      | B4 UCRD Seminar Hall |
| 👥 Capacity   | 50                   |
| 🎟️ Confirmed | 47                   |
| 🪑 Available  | 3                    |
| ⏳ Waitlisted  | 8                    |

### Example Waitlist

```text
#01  Grand Line Coders
#02  Devil Fruit Devs
#03  The Lost Poneglyph Files
#04  Bug Hunters
#05  Straw Hat Stack
```

The queue is deterministic: **position matters**.

---

# ⚔️ The Signature Feature

## The 10-Minute Berth Offer

When a confirmed participant cancels:

```text
BERTH RELEASED
      ↓
FIRST ELIGIBLE CREW
      ↓
10:00 COUNTDOWN
      ↓
┌─────────────────┐
│ BOARDING PERMIT  │
│                 │
│     09:59       │
│                 │
│   CLAIM BERTH   │
└─────────────────┘
```

The offer is enforced using **server-side time**, rather than relying solely on the participant's device clock.

If the offer expires, the system automatically moves to the next eligible crew.

This prevents:

* manual queue management
* duplicate allocation
* arbitrary promotion
* stale offers
* over-capacity registration

---

# 🧠 System Architecture

```text
                  ┌─────────────────────┐
                  │        USER         │
                  │ Participant / Admin │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │     NEXT.JS 15      │
                  │    TypeScript       │
                  │     Tailwind CSS    │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    SUPABASE AUTH    │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │     POSTGRESQL      │
                  └──────────┬──────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        FIFO WAITLIST   BERTH ENGINE   ACCESS CONTROL
              │              │
              ▼              ▼
        QUEUE POSITION   10-MIN OFFER
                             │
                             ▼
                  ┌─────────────────────┐
                  │ SUPABASE REALTIME   │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │    LIVE UI STATE    │
                  └─────────────────────┘
```

---

# 🛠️ Tech Stack

### Frontend

* **Next.js 15**
* **TypeScript**
* **Tailwind CSS**
* **Framer Motion**

### 3D / Visual Experience

* **Three.js**
* **React Three Fiber**
* **Drei**

### Backend / Data

* **Supabase Auth**
* **PostgreSQL**
* **Supabase Realtime**

### Validation

* **Zod**

---

# 🔐 Technical Highlights

### Atomic Allocation

Berth allocation is designed around transactional state changes so that concurrent requests do not simply bypass capacity constraints.

### Deterministic FIFO

Waitlisted crews are processed according to their queue position rather than arbitrary manual selection.

### Server-Time Expiration

The 10-minute offer is based on server-side timing, reducing dependence on potentially inaccurate client clocks.

### Realtime State

Changes to registration, queue state, berth availability, and offers can propagate to the live interface.

### Validation

**Zod** is used for structured data validation at application boundaries.

### Role-Based Access

The system distinguishes between participant-facing functionality and administrative functionality.

### Row-Level Security

Supabase/PostgreSQL security mechanisms are used to restrict access to appropriate data.

---

# 🎨 The Experience

Shambles Seating isn't presented as a conventional registration form.

The interface creates a narrative-driven event experience inspired by:

### 🏆 Gran Tesoro

Luxury gala aesthetics, treasure-gold visual language, warm lighting and premium event presentation.

### 🏛️ World Government Reverie

Ceremonial architecture, parchment, burgundy and ivory tones.

### 🌊 Grand Line

Oceanic navigation, ships, routes and an adventurous journey between event states.

The thematic layer supports the product rather than replacing its functionality.

---

# 🖥️ Product Experience

The application is structured around several key experiences:

### Crew Registration

Participants can register their crew for an event while the system enforces available capacity.

### Live Queue

When capacity is reached, eligible crews enter the deterministic FIFO waitlist and can see their position.

### Boarding Permit

When a berth becomes available, the next eligible crew receives a time-limited opportunity to claim it.

### Digital Access Pass

Confirmed participants receive a digital representation of their event access.

### Admin Command Deck

Administrators can manage and observe the event's registration state.

---

# 🚀 Getting Started

## Prerequisites

Make sure you have:

* Node.js
* npm
* A Supabase project

## Installation

Clone the repository:

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <PROJECT_DIRECTORY>
```

Install dependencies:

```bash
npm install
```

Create your environment file:

```bash
.env.local
```

Add the required project configuration for your Supabase setup.

Then start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

> Replace the repository URL and environment variables with the actual project values before publishing this README.

---

# 📁 High-Level Architecture

```text
src/
│
├── app/
│   ├── ...
│
├── components/
│   ├── ...
│
├── lib/
│   ├── ...
│
├── ...
│
└── ...
```

The exact repository structure may vary depending on the implementation.

---

# 🧪 Demo Scenario

A simple demonstration of the core system:

```text
Current Event State

Capacity:       50
Confirmed:      47
Available:       3
Waitlisted:      8
```

Suppose a confirmed participant cancels.

### Before

```text
47 / 50
8 waiting
```

### Cancellation

```text
BERTH RELEASED
```

### Queue Processing

```text
#01 → Grand Line Coders
#02 → Devil Fruit Devs
#03 → The Lost Poneglyph Files
```

The first eligible crew receives:

```text
BOARDING PERMIT

09:59
```

### If claimed

```text
BERTH SECURED
```

### If expired

```text
OFFER EXPIRED
        ↓
NEXT ELIGIBLE CREW
```

The process continues automatically.

---

# 🏴‍☠️ Why "Shambles"?

The name references the idea of **rearranging positions**.

In the system, a cancellation changes the state of the event:

```text
ONE BERTH OPENS
       ↓
THE QUEUE SHIFTS
       ↓
A NEW CREW GETS ITS CHANCE
```

The interface turns that state transition into a visible journey rather than hiding it behind an admin panel.

---

# 🏆 Built For

**FRONTEND ROULETTE 1.0**

**Problem Statement:**
**PS-09 — Smart Event RSVP and Waitlist Management System**

**Team:**

### THE LOST PONEGLYPH FILES

---

# 🗺️ The Journey

```text
PROBLEM
   ↓
LIMITED CAPACITY
   ↓
WAITLIST
   ↓
DETERMINISTIC QUEUE
   ↓
BERTH RELEASE
   ↓
10-MINUTE OFFER
   ↓
REALTIME PROMOTION
   ↓
DIGITAL ACCESS
```

### Your Berth.

### Your Crew.

### Your Voyage.

---

## 👒 The Lost Poneglyph Files

Built for **Frontend Roulette 1.0**.

> **When a berth opens, the Grand Line moves.**
