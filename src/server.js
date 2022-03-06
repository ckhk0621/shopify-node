const app = require('./app.js');

const port = process.env.PORT || 3001;

const server = app;

server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})