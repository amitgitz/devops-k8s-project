const { app, initDb } = require('./app');
const port = process.env.PORT || 5000;

initDb();

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
