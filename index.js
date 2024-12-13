import app from "./app.js";
import connectDB from './db/index.js';

const PORT = process.env.PORT || 8000;

// Connect to MongoDB and start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running at port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });