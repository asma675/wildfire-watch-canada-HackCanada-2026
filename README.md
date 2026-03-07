# Wildfire Watch Canada

A real-time wildfire monitoring, emergency response, and AI-assisted coordination platform built for Canada.

Wildfire Watch Canada brings together satellite fire detection, drone fleet operations, wearable health alerts, air quality monitoring, multilingual emergency guidance, and operational dashboards into one unified system. It is designed to support wildfire prevention, detection, triage, evacuation guidance, and rescue coordination across all Canadian provinces and territories.

---

## Overview

Wildfire Watch Canada is a comprehensive emergency management platform that helps organizations monitor wildfire threats, assess risk, respond faster, and guide people safely during wildfire events.

The platform combines:

- real-time wildfire hotspot detection
- geotagged field image uploads with AI fire analysis
- drone fleet dispatch and rescue coordination
- wearable-based distress and health alerts
- multilingual AI guidance
- air quality and smoke severity monitoring
- historical intelligence and predictive analytics
- operational dashboards for agencies and response teams

This project is being built on **Base44** for rapid application development, with a growing backend layer in **TypeScript** for mission-critical processing, integrations, and automation.

---

## Mission

To create a modern, intelligent wildfire response platform for Canada that helps emergency teams detect threats earlier, coordinate faster, communicate more clearly, and protect lives more effectively.

---

## Key Capabilities

### 1. Wildfire Monitoring & Detection

- **Real-time fire hotspot detection** using NASA FIRMS satellite data
- **Geotagged image uploads** from field teams for visual fire confirmation
- **AI-powered image analysis** using Gemini to detect wildfire presence and assign confidence scores
- **Dynamic zone risk scoring** based on weather, vegetation dryness, and historical patterns
- **Air quality tracking** including PM2.5, AQI, and smoke severity

### 2. Drone Fleet Management

- Full **drone lifecycle management**:
  - standby
  - scanning
  - rescue
  - returning
  - charging
  - offline
- Real-time tracking of:
  - location
  - altitude
  - battery
  - mission type
- Support for:
  - fire scan missions
  - thermal scanning
  - rescue assistance
- Equipment inventory tracking:
  - first aid kits
  - AED
  - oxygen masks
  - thermal cameras
  - two-way audio

### 3. Wearable Health & Distress Integration

- Monitors data from supported devices such as:
  - Fitbit
  - Persage
  - Apple Watch
  - Garmin
- Tracks:
  - heart rate
  - SpO2
  - respiratory rate
  - body temperature
  - CO exposure levels
- Detects critical events such as:
  - falls
  - seizures
  - cardiac distress
  - loss of consciousness
  - carbon monoxide poisoning
- Enables **automatic drone dispatch** for urgent rescue support

### 4. AI-Powered Emergency Guidance

- AI-assisted:
  - fire scan tactical briefings
  - rescue guidance
  - thermal image interpretation
  - evacuation support
- Optimized route guidance using:
  - hazard awareness
  - direction-based navigation
  - fire zone avoidance
- Drone voice support powered by **ElevenLabs**
- Language-aware communication where AI:
  - detects the user’s spoken or typed language
  - responds in that same language
  - delivers voice output accordingly

### 5. Emergency Response Coordination

- Province-based alert thresholds:
  - LOW
  - MODERATE
  - HIGH
  - EXTREME
- Alert history with delivery status:
  - sent
  - failed
  - pending
- Multi-organization coordination with responder directories
- Notifications system with threat levels, unread count, and action links

### 6. Data & Intelligence Layers

- Historical wildfire records
- Burn severity and area metrics
- Environmental impact context
- Forest loss and ecosystem disruption tracking
- Fire department registry across municipal, provincial, federal, and volunteer groups
- Weather-linked risk context
- Vegetation health scoring using NDVI

### 7. User Experience & Accessibility

- Multi-language support:
  - English
  - French
  - Spanish
  - Russian
  - Ukrainian
  - Hindi
- Responsive desktop and mobile layout
- Dark monitoring UI with amber-accented threat styling
- Interactive Leaflet maps with wildfire hotspots and monitored zones
- Real-time dashboards, charts, alerts, and zone cards

### 8. Knowledge & Decision Support

- RAG-based wildfire knowledge support
- Threat analysis and recommendations
- Zone summaries and AI-generated guidance
- Public safety education for:
  - smoke exposure
  - health effects
  - mental health during wildfire crises

---

## What Has Been Built

The current platform already includes a strong application layer with core workflows across wildfire intelligence, drone operations, wearables, and response dashboards.

### Current Progress Includes

- real-time fire data integration
- monitored zone management
- captured image workflows
- Cloudinary image upload pipeline
- Gemini-based wildfire image analysis
- drone fleet entity management
- wearable alert tracking
- notification and alert management
- map-based zone and hotspot visualization
- multilingual interface support
- Base44 entity models and subscriptions
- AI-assisted guidance workflows

---

## Current Architecture

### Frontend

- **React**
- **React Router**
- **Tailwind CSS**
- **Lucide React**
- **React Leaflet**
- **React Hook Form**
- **Recharts**
- **Framer Motion**
- **React Query**
- **React Markdown**

### Platform / App Layer

- **Base44**
  - entities
  - auth
  - storage
  - real-time subscriptions
  - backend functions

### AI / External Services

- **Gemini API** for image analysis and multilingual guidance
- **ElevenLabs API** for text-to-speech and voice responses
- **Cloudinary API** for geotagged image storage
- **NASA FIRMS API** for wildfire hotspot data
- **Persage API** for wearable health data
- **Backchannel API** for RAG-based knowledge workflows

### Planned / In Progress Infrastructure

- **Backboard.io integration**
- **TypeScript backend services**
- additional coordination and analytics pipelines

---

## New Priorities Being Integrated

### 1. Backboard.io Integration

Backboard.io will be integrated as part of the operational intelligence and workflow layer to improve orchestration, data visibility, and action routing. This will support more structured emergency coordination and reduce fragmentation across monitoring, alerts, and field response workflows.

Planned use cases include:

- centralized incident workflow visibility
- task and response orchestration
- team coordination support
- integration touchpoints for alerts, drone dispatch, and operational status

### 2. Improved Image Upload + AI Analysis Flow

The image pipeline is being upgraded to make field uploads and AI interpretation more robust.

#### Planned improvements

- streamlined upload from client to Cloudinary
- tighter metadata handling for:
  - GPS coordinates
  - timestamp
  - submitting team/user
  - zone association
- improved Gemini prompts for:
  - wildfire detection
  - smoke classification
  - severity scoring
  - false-positive reduction
- storage of structured AI outputs for dashboard and reporting use

### 3. Smarter AI Chat + Voice Language Handling

The AI assistant will be upgraded so it can:

- detect which language the user is speaking or typing
- respond in the same language automatically
- generate voice output in that same language using ElevenLabs
- provide emergency guidance that is clearer and more natural for multilingual users in the field

This is especially important for high-stress scenarios where language mismatch can cost time.

### 4. Backend Migration / Expansion in TypeScript

Mission-critical backend logic is being implemented in **TypeScript** to improve maintainability, reliability, typing, and service organization.

The TypeScript backend will handle:

- dispatch logic
- risk calculations
- analytics pipelines
- alert delivery orchestration
- external API integrations
- route generation
- predictive modeling hooks
- reusable service modules for future expansion

---
