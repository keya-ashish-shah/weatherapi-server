// // // require("dotenv").config();
// // // const express = require("express");
// // // const cors = require("cors");
// // // const mongoose = require("mongoose");
// // // const weatherRoutes = require("./routes/weatherRoutes");
// // // const adminRoutes = require("./routes/adminRoutes");
// // // const userRoutes = require("./routes/userRoutes");


// // // const app = express();
// // // app.use(cors());
// // // app.use(express.json());

// // // const MONGODB_URI =
// // //   process.env.MONGODB_URI || "mongodb://localhost:27017/weathervision";

// // // mongoose
// // //   .connect(MONGODB_URI, {
// // //     useNewUrlParser: true,
// // //     useUnifiedTopology: true,
// // //   })
// // //   .then(() => console.log("Connected to MongoDB"))
// // //   .catch((err) =>
// // //     console.error("MongoDB connection error:", err.message)
// // //   );

// // // app.use("/api/weather", weatherRoutes);
// // // // app.use("/api/admin", adminRoutes);
// // // // app.use("/api/users", userRoutes);

// // // // app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// // // const PORT = process.env.PORT || 5000;
// // // app.listen(PORT, () =>
// // //   console.log(` Server running on port ${PORT}`)
// // // );
// // require("dotenv").config();
// // const express = require("express");
// // const cors = require("cors");
// // const mongoose = require("mongoose");
// // const weatherRoutes = require("./routes/weatherRoutes");

// // const app = express();
// // app.use(cors());
// // app.use(express.json());

// // const MONGODB_URI =
// //   process.env.MONGODB_URI || "mongodb://localhost:27017/weathervision";

// // mongoose
// //   .connect(MONGODB_URI)
// //   .then(() => console.log("Connected to MongoDB"))
// //   .catch((err) => console.error(err.message));

// // app.use("/api/weather", weatherRoutes);

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () =>
// //   console.log(`Server running on port ${PORT}`)
// // );
// require("dotenv").config();
// const express = require("express");
// const cors = require("cors");
// const mongoose = require("mongoose");

// const weatherRoutes = require("./routes/weatherRoutes");
// const userRoutes = require("./routes/userRoutes");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const MONGODB_URI =
//   process.env.MONGODB_URI || "mongodb://localhost:27017/weathervision";

// mongoose
//   .connect(MONGODB_URI)
//   .then(() => console.log("Connected to MongoDB"))
//   .catch((err) => console.error(err.message));

// app.use("/api/weather", weatherRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/register", userRoutes);


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () =>
//   console.log(`Server running on port ${PORT}`)
// );
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const weatherRoutes = require("./routes/weatherRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/weathervision";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB error:", err.message));

app.use("/api/weather", weatherRoutes);
app.use("/api/users", userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));