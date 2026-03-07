# Wildfire Watch Canada

Wildfire Watch Canada is a real-time wildfire monitoring and emergency response platform built to help people across Canada detect threats earlier, respond faster, and stay safer.

At its core, this project brings together wildfire detection, drone support, wearable health alerts, air quality tracking, multilingual emergency guidance, and live operational dashboards in one place. The goal is simple: make it easier for teams to understand what’s happening on the ground and act quickly when it matters most.

---

## What this project is

Wildfire Watch Canada was built as a smart, practical platform for wildfire monitoring and emergency coordination across all Canadian provinces and territories.

It combines several moving parts into one system:

- real-time wildfire hotspot detection
- AI analysis of field images
- drone fleet tracking and rescue support
- wearable-based distress monitoring
- air quality and smoke tracking
- multilingual emergency help
- maps, alerts, and response dashboards

This project is currently built on **Base44**, and the next big step is moving more of the backend logic into **TypeScript** so the platform can become more reliable, scalable, and easier to maintain.

---

## What’s already been built

A lot of the foundation is already in place.

### Wildfire monitoring and detection
The system can pull in real-time hotspot data from **NASA FIRMS** to identify active fires across Canada. It also supports **geotagged image uploads**, so field teams can take a photo, upload it, and have it analyzed by AI to check whether wildfire activity is present and how confident the system is.

### Risk scoring and threat awareness
Each monitored zone can be assigned a dynamic risk score based on factors like weather, vegetation dryness, and historical fire patterns. Air quality data is also tracked, including PM2.5, AQI, and smoke severity.

### Drone fleet management
There is a full drone command setup in the app, including status tracking for drones that are on standby, scanning, rescuing, returning, charging, or offline. Missions can be assigned, and the platform keeps track of things like GPS location, altitude, battery, and onboard equipment.

### Wearable health alerts
The platform also supports wearable-based monitoring. Alerts can come in from devices such as Fitbit, Persage, Apple Watch, or Garmin, and the system can track vital signs and detect dangerous situations like falls, seizures, CO exposure, or possible cardiac events.

### AI guidance
The AI side of the platform can help with things like:
- interpreting fire scan images
- helping with thermal rescue scenarios
- giving evacuation guidance
- generating recommendations for monitored zones

### Emergency coordination tools
Organizations can configure alert thresholds by province, manage emergency contacts, review alert history, and view notifications in real time.

### Maps, dashboards, and accessibility
The app includes live maps, charts, analytics cards, dark mode styling, and support for multiple languages including English, French, Spanish, Russian, Ukrainian, and Hindi.

---

## What makes this project special

This is not just a fire map.

The idea behind Wildfire Watch Canada is to build something that feels genuinely useful in a real emergency — something that helps connect detection, field awareness, rescue support, public safety, and decision-making in one system.

Instead of treating wildfire response as just a data problem, this project tries to make it an action problem too:
- What is happening?
- How risky is it?
- Who might be in danger?
- What should responders do next?
- How can the system communicate clearly, even across language barriers?

That’s where the drone workflows, wearable alerts, AI guidance, and multilingual support start to matter.

---

## What we’re adding next

There are three major priorities for the next phase of development.

### 1. Backboard.io integration
We want to integrate **Backboard.io** to improve coordination and workflow visibility. The goal here is to make operational response more organized, easier to track, and less fragmented when multiple actions are happening at once.

This can help support:
- incident workflow visibility
- team coordination
- task routing
- better operational awareness across alerts, drones, and monitored zones

### 2. Better image uploads + better AI analysis
The image upload flow is already useful, but it needs to be smoother and smarter.

We want to improve:
- image upload handling through **Cloudinary**
- GPS and metadata capture
- image-to-zone association
- AI analysis quality using **Gemini**
- confidence scoring
- false-positive reduction

The goal is to make field uploads faster, cleaner, and more reliable for wildfire detection.

### 3. Smarter multilingual AI chat and voice response
One of the most important improvements is making the AI assistant feel much more natural for real users in stressful situations.

We want the system to:
- detect which language the user is speaking or typing
- respond in that same language automatically
- generate voice output in that language using **ElevenLabs**

That way, someone can speak naturally, and the platform can respond clearly without forcing them into English first. In an emergency, that matters a lot.

### 4. Move backend logic into TypeScript
A big part of the next phase is building the backend properly in **TypeScript**.

Right now, the app has a strong frontend and platform foundation, but several important backend functions still need to be implemented in a cleaner, more structured way. Moving that work into TypeScript will make the platform easier to scale and much better organized.

---

## Backend work that still needs to be built

Here are some of the most important backend functions planned for the TypeScript layer.

### Highest priority
- `droneRescueDispatcher`  
  Find the nearest available drone and dispatch it to a person in distress.

- `evacuationRoutePlanner`  
  Generate safer evacuation routes based on wildfire zones and nearby hazards.

- `zoneRiskCalculator`  
  Update zone risk scores in real time using weather, NDVI, fire proximity, and historical patterns.

- `fireSpreadPredictor`  
  Estimate how a fire may spread using terrain, vegetation, and wind data.

- `droneFleetOptimizer`  
  Improve drone patrol coverage and mission efficiency.

### Additional backend features
- air quality aggregation
- environmental damage reports
- historical pattern analysis
- drone health and maintenance tracking
- multi-channel alert delivery
- fire department coordination
- public warning generation
- dashboard metric aggregation
- incident reporting
- risk forecasting
- export tools
- future video-based drone analysis
- weather integration
- official emergency coordination integrations

---

## Tech stack

### Frontend
- React
- React Router
- Tailwind CSS
- Lucide React
- React Leaflet
- React Hook Form
- Recharts
- Framer Motion
- React Query
- React Markdown

### Platform
- Base44 entities
- Base44 backend functions
- Base44 auth and permissions
- Base44 real-time subscriptions

### Integrations and APIs
- NASA FIRMS
- Gemini API
- ElevenLabs API
- Cloudinary API
- Persage API
- Backchannel API

### Planned backend direction
- TypeScript
- structured service layer
- integration modules
- dispatch and analytics logic
- language and communication services

---
