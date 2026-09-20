# CivicFix — Community Issue Reporting & Resolution Platform

CivicFix is a hackathon prototype that helps citizens report local civic issues, track their progress, and allows administrators to review and update issue statuses through a simple dashboard.

## Core Workflow

Citizen → Report Issue → Location & Evidence → Issue ID → Track Issue → Admin Review → Status Update → Resolution

## Features

### Citizen Features

- Citizen issue reporting portal
- Automatic issue ID generation
- Issue title, category and description
- Browser geolocation using "Use My Location"
- Location selection on the map
- Evidence image upload with preview
- Similar-report warning
- Public issue board
- Search and category/status filtering
- Issue details modal
- Activity timeline
- Track reported issues
- Citizen dashboard

### Admin Features

- Admin dashboard
- Issue management queue
- View reported issues
- Update issue status
- Status workflow:
  - Open
  - In Progress
  - Resolved
- Resolution statistics and analytics

### Interactive Map

- Real interactive map using Leaflet
- OpenStreetMap map tiles
- Civic issue markers
- Status-based issue visualization
- Issue popups
- Zoom in/out and map navigation
- "Show on Map" functionality
- Location names for reported issues

### Data & Persistence

- Browser LocalStorage used for prototype data persistence
- Demo civic issues included for hackathon demonstration
- Issue updates remain available after page refresh in the same browser

## Technology Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Leaflet.js
- OpenStreetMap
- Browser Geolocation API
- LocalStorage API

## Project Structure

CivicFix/
├── index.html
├── style.css
├── script.js
└── README.md