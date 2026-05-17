# *PulseGuard-AI* 🚑🤖

**PulseGuard AI** is a web-first, AI-powered cardiovascular risk and heart-rate monitoring platform built . It enables users to track vital health metrics directly from a browser—without requiring a mobile app or external hardware.

---

## 📌 Overview

PulseGuard AI focuses on preventive healthcare by combining user inputs, camera-based heart-rate detection, intelligent risk analysis, and emergency response features. It is designed for accessibility, scalability, and real-world healthcare impact—especially in rural and low-resource environments.

---

## 🚀 Key Features.

* 👤 **User Profile Creation**
  Store age, gender, weight, and lifestyle data for personalized insights.

* 📝 **Manual Health Logging**
  Track blood pressure, heart rate, and contextual notes (e.g., after exercise or medication).

* 📊 **Trend Visualization**
  Interactive charts with color-coded cardiovascular risk levels:

  * 🟢 Low
  * 🟡 Medium
  * 🔴 High

* 🔔 **Smart Health Reminders**
  Notifications for daily BP checks, medication, and healthy habits.

* 📄 **Exportable Reports**
  Download BP/HR history and risk reports as **PDF or CSV** for doctors.

* 📚 **Preventive Health Guidance**
  Personalized suggestions for:

  * 🥗 Diet (low sodium, heart-friendly foods)
  * 🏃 Lifestyle (exercise, sleep, stress reduction)
  * 🚭 Habit improvement

---

## ❤️ Heart Rate Monitoring (Camera-Based)

PulseGuard AI supports **hardware-free heart rate detection** using:

### 📱 Fingerprint (Rear Camera + Flash)

* User places finger on camera
* Detects blood flow via light absorption

### 🙂 Face Detection (Front Camera)

* Tracks subtle skin color changes
* Uses remote PPG (rPPG) techniques

### 🔬 Processing Pipeline

* Captures color intensity variations
* Converts into PPG-style signal
* Applies filtering + peak detection
* Outputs **heart rate in BPM**

---

## 🚨 Emergency Response System

* 📍 **Automatic Location Sharing**
  In high-risk situations, user location can be shared with:

  * 👨‍👩‍👧 Family members
  * 🚑 Nearby ambulance services

* ⚠️ **Risk-Based Alerts**
  Triggered when abnormal heart rate or BP patterns are detected

* 📞 Enables faster response in critical situations

---

## 🎯 Accuracy & Reliability

* Uses signal processing techniques to improve PPG accuracy
* Designed for **approximate real-time monitoring**, not clinical diagnosis
* Accuracy depends on:

  * Lighting conditions
  * Camera quality
  * User stability (minimal movement)

---


## ☁️ Tech Stack

### 🟦 Google Cloud Platform (Primary)

* **Firebase**

  * Authentication (user login)
  * Firestore / Realtime DB (health data storage)
  * Cloud Messaging (notifications)

* **Google Cloud Functions**

  * Backend logic and API handling

* **Google Cloud Storage**

  * Report storage (PDF/CSV)

* **Vertex AI (optional / extensible)**

  * Risk prediction & ML model hosting


### 🧠 Processing.

* JavaScript-based signal processing
* PPG / rPPG algorithms for HR detection

---

### 🔗 Platform Layer

* AntiGravity(full-stack generation & orchestration)

---

---

## 🌍 Use Cases

* 🏥 Rural health monitoring
* 🧑‍⚕️ Preventive healthcare programs
* 📊 Personal wellness tracking
* 🧪 Pilot projects for digital health ecosystems in India

---

## 📈 Impact

PulseGuard AI reduces dependency on expensive medical devices by:

* Making heart monitoring accessible via browser
* Enabling early detection of cardiovascular risks
* Supporting scalable, low-cost healthcare solutions

---

## 🔮 Future Improvements

* Wearable device integration
* Advanced AI-based risk prediction
* Real-time alerts and telemedicine integration
* Dashboard for clinics and health workers


## 📂 Project Structure

```
pulseguard-ai/
│── app/                # Core application logic
│── models/             # ML models
│── routes/             # API endpoints
│── services/           # Business logic
│── utils/              # Helper functions
│── config/             # Configuration files
│── requirements.txt    # Dependencies
│── main.py / server.js # Entry point
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/jayanthdr07/pulseguard-ai.git
cd pulseguard-ai
```

### 2. Create virtual environment

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

---

## ▶️ Running the Application

```bash
python main.py
```

or (if using FastAPI):

```bash
uvicorn main:app --reload
```

---

## 🔌 API Endpoints (Example)

| Method | Endpoint | Description            |
| ------ | -------- | ---------------------- |
| GET    | /health  | Check API status       |
| POST   | /predict | Run AI prediction      |
| GET    | /metrics | Fetch health analytics |

---

## 🧠 AI Model

The system uses machine learning models to:

* Detect anomalies in heart rate patterns
* Predict potential cardiovascular risks
* Analyze time-series health data

---

## 🔒 Security

* Input validation on all endpoints
* Secure API handling
* Environment-based configuration

---

## 🧪 Testing

```bash
pytest
```

---

## 📈 Future Improvements

* Integration with wearable devices
* Advanced deep learning models
* Real-time streaming (Kafka/WebSockets)
* Dashboard & visualization

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Commit changes
4. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Jayanth DR**
GitHub: https://github.com/jayanthdr07

---

## ⭐ Support

If you like this project, give it a star ⭐ on GitHub!
