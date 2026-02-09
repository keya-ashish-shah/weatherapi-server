# WeatherAPI Server

This is the **Node.js + Express backend** for the **WeatherAPI Project**.  
It serves as the API layer for the `weatherapi-client`, handling user authentication, weather data fetching, and caching to optimize performance.

---

##  Overview

The WeatherAPI Server is responsible for:
- Managing user authentication and routes (`/user`, `/admin`)
- Fetching and caching weather data (`/weather`)
- Storing search history for logged-in users
- Communicating with MongoDB for persistent storage

It interacts with the frontend React app (`weatherapi-client`) and external weather APIs like **OpenMeteo**.

---

## ⚙️ Tech Stack

| Category | Technology |
|-----------|-------------|
| **Runtime** | Node.js **v22.14.0+** |
| **Package Manager** | npm **v11.3.0** |
| **Framework** | Express.js **4.18.2** |
| **Database** | MongoDB atlas |
| **Caching** | MongoDB TTL (WeatherCache) |
| **Environment Config** | dotenv |
| **HTTP Client** | Axios |

---

---

## 📦 Dependencies

### Main dependencies:
```json
"dependencies": {
  "axios": "^1.6.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "mongoose": "^7.5.0",
  "morgan": "^1.10.0"
}


###Getting Started 
### Create a .env file at the root of the project:
MONGODB_URI=mongodb+srv://keyaashishshah_db_user:LSOo2oDw9PmEDXxT@cluster0.jidhtul.mongodb.net/weathervision?retryWrites=true&w=majority
PORT=5000
CACHE_TTL_MINUTES=30


###Steps to Run
# 1. Clone repository
git clone https://github.com/keya-ashish-shah/weatherapi-server.git
cd weatherapi-server

# 2. Install dependencies
npm install

# 3. Create environment file (.env)
#    Paste the required variables shown above

# 4. Run server (development mode)
node server.js 

