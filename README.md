# PulseGuard AI 🚑🤖

**PulseGuard AI** is a web-first, AI-powered cardiovascular risk and heart-rate monitoring platform built . It enables users to track vital health metrics directly from a browser—without requiring a mobile app or external hardware.

---

## 📌 Overview

PulseGuard AI focuses on preventive healthcare by combining simple user inputs, camera-based heart-rate detection, and intelligent insights. It is designed to be accessible, scalable, and especially useful for rural and low-resource healthcare environments.

---

## 🚀 Key Features

* 👤 **User Profile Creation**
  Store age, gender, weight, and lifestyle information for personalized tracking.

* 📝 **Manual Health Logging**
  Log blood pressure, heart rate, and contextual notes (e.g., after exercise or medication).

* 📊 **Trend Visualization**
  Interactive charts for BP and heart rate with color-coded risk levels:

  * 🟢 Low
  * 🟡 Medium
  * 🔴 High

* 🔔 **Health Reminders**
  Get prompts like “Take your BP today” via UI notifications.

* 📄 **Data Export**
  Download reports as **PDF or CSV** to share with doctors or clinics.

* 📚 **Educational Content**
  Learn about hypertension, heart health, and preventive habits.

---

## ❤️ Heart Rate Tracking (Camera-Based)

PulseGuard AI uses **camera-based PPG (Photoplethysmography)** techniques:

* 📱 Users can:

  * Place a finger over the rear camera (with flash), OR
  * Use the front camera for face-based detection

* 🔬 The system:

  * Captures subtle color changes caused by blood flow
  * Converts them into a PPG-style signal
  * Applies signal processing (filtering + peak detection)
  * Outputs **heart rate in BPM (beats per minute)**

This enables **hardware-free heart rate monitoring** using just a browser.

---

## 🏗️ Tech Stack

* ⚙️ **Platform**: Base44 AI App Builder
* 🌐 **Frontend + Backend**: Auto-generated full-stack system
* 🗄️ **Database**: Managed via Base44
* 🧠 **Processing**: Signal processing for PPG-based HR detection

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
