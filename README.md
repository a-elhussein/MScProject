# Smart Food Label Analyzer
A fullstack web application that helps users make faster and smarter nutrition decisions by analysing food products against personalised dietary goals.

---

## Overview
Smart Food Label Analyzer transforms complex nutrition label data into simple, actionable feedback tailored to individual goals such as fat loss, muscle gain, or maintenance.

Instead of just displaying calories and macros, the system evaluates how a food item impacts the user's daily targets and provides real-time, colour-coded recommendations.

<img width="1076" height="792" alt="SC3" src="https://github.com/user-attachments/assets/a04b20cd-80e4-4e84-abcc-c2347e01916d" />
---

## Key Features
- 📷 Barcode scanning using OpenFoodFacts API
- 🎯 Personalised calorie & macronutrient targets
- ⚡ Real-time nutrition impact feedback (green / amber / red)
- 🍽 Flexible serving size scaling (1g, 100g, or serving)
- 📊 Progress tracking with charts and analytics
- 🎮 Gamification (XP, streaks, levels)
- 🔐 Secure authentication using JWT

---

## How It Works
1. User creates a profile (age, weight, height, activity level, goal)
2. The system calculates personalised calorie and macro targets
3. User scans a food product
4. Nutrition data is retrieved and scaled based on serving size
5. The system evaluates how the food impacts daily goals
6. A colour-coded result is shown:
- **Green** → within target  
- **Amber** → approaching limit  
- **Red** → exceeding target

  <img width="834" height="710" alt="SC1" src="https://github.com/user-attachments/assets/bbb6d40f-cf68-4c45-9209-82267347020f" />


<img width="1504" height="959" alt="SC6" src="https://github.com/user-attachments/assets/79d35c66-1a1c-4a92-bb85-f0e16e54df07" />

<img width="1524" height="957" alt="SC7" src="https://github.com/user-attachments/assets/7df1e28d-dd06-4b46-88c3-d813920f683e" />

---

## Core Logic (What Makes This Different)

### Personalised Nutrition Engine
Calorie and macronutrient targets are generated using the **Mifflin-St Jeor equation** combined with activity multipliers and goal adjustments (cut, bulk, maintain).

### Real-Time Decision Feedback
Instead of static labels, the system evaluates food **in the context of the user's current daily progress**, providing dynamic feedback.

### Serving Size Scaling
All nutrition values are accurately scaled based on user input (grams or serving size), ensuring precise tracking rather than fixed assumptions.

### Traffic-Light System (Goal-Based)
Inspired by UK nutrition labels, but adapted to be:
- personalised
- goal-driven
- real-time

---

## Tech Stack
**Frontend**
- React + TypeScript
- Vite
- Tailwind CSS
- React Query

**Backend**
- ASP.NET Core (.NET 8 Web API)
- Entity Framework Core

**Database**
- PostgreSQL

**External API**
- OpenFoodFacts

**Auth**
- JWT (stateless authentication)

---

## Architecture
- 3-tier architecture:
  - Presentation (React SPA)
  - Application (REST API)
  - Data (PostgreSQL)

Designed for scalability, maintainability, and separation of concerns.

---

## Challenges
- Translating nutrition science into usable logic
- Handling unreliable external API data
- Implementing real-time feedback without overwhelming the user
- Ensuring accuracy with flexible serving sizes

---

## Future Improvements
- Mobile-first version (better barcode scanning)
- AI-based adaptive nutrition recommendations
- Food search (not just barcode)
- Advanced analytics and predictions
- Enhanced gamification (badges, challenges)

---

## Why I Built This
Most nutrition apps show data but don't help users interpret it.
This project focuses on **decision-making**, not just tracking, helping users understand whether a food actually aligns with their goal in real time.

---

## Running Locally

### 1. Clone the repository
git clone https://github.com/a-elhussein/MScProject.git

cd MScProject

### 2. Start the backend API
cd Backend
dotnet restore
dotnet run --project Backend.API

### 3. Start the frontend
cd Frontend
npm install
npm run dev

### 4. Open the app
Frontend: http://localhost:5173
Make sure the backend is running before using the frontend.
