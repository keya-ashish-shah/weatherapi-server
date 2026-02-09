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

