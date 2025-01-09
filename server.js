const dotenv = require('dotenv');
const mongoose = require('mongoose');

// process.on('uncaughtException', (err) => {
//   console.log(err.name, err.message);
//   console.log('Uncaught Rejection... Shutting down...');
// });

dotenv.config({
  path: './config.env',
});

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then(() => {
  console.log(`MongoDB Connected`);
});

const port = process.env.PORT;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('Unhandled Rejection... Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
