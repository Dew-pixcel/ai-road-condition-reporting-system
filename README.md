AI-Based Road Condition Reporting and Repair Optimization System for Sri Lanka

## Overview

This project is an AI-powered road damage detection and reporting system developed to improve road maintenance management in Sri Lanka. The system allows citizens to report road damages by uploading images, while the AI model automatically detects potholes and cracks using YOLOv8. The platform also calculates damage severity, determines road priority, and provides an officer dashboard for monitoring and managing reports.


## Features

### Citizen Features

* User Registration and Login
* Upload Road Damage Images
* Automatic GPS Coordinate Extraction
* AI-Based Road Damage Detection
* View Submitted Reports
* Track Report Status

### AI Features

* Pothole Detection
* Crack Detection
* Bounding Box Generation
* Damage Area Calculation
* Severity Classification
* Priority Assignment
* Duplicate Report Prevention

### Officer Features

* Officer Dashboard
* View All Reports
* Filter Reports by Status and City
* Update Report Status
* Priority-Based Report Management
* Interactive Map Visualization


## Technologies Used

### Frontend

* React.js
* React Router
* Axios
* Leaflet Maps

### Backend

* Flask
* Python
* Flask-CORS

### Artificial Intelligence

* YOLOv8
* Ultralytics
* Computer Vision

### Database

* SQLite

### APIs

* OpenStreetMap Overpass API



## System Architecture

Citizen → React Frontend → Flask Backend → YOLOv8 Model → SQLite Database

Officer Dashboard → Flask Backend → Database → Map Visualization



## Project Structure

ROAD_AI

├── backend

│   ├── app.py

│   ├── database.py

│   ├── requirements.txt

│

└── road-ai-system


├── src

├── public

├── package.json

└── ...
```



## Installation

### Backend

```bash
cd backend
pip install -r requirements.txt
python app.py
```

### Frontend

```bash
cd road-ai-system
npm install
npm run dev
```

---

## Research Objectives

* Detect road damages automatically using AI.
* Improve accuracy of road damage reporting.
* Prioritize repair activities based on damage severity.
* Support authorities with efficient road maintenance decisions.

---

## Note

The trained YOLO model file (`best.pt`) and dataset files are excluded from this repository due to file size limitations.

---

## Developer

Dewmi Punsara

BSc Software Engineering

AIBS Campus

---

## License

This project was developed for academic research and educational purposes.
