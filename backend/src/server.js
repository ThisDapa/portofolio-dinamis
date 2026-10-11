import { app } from "./app.js";
import { config } from "./config.js";
app.listen(config.PORT, (error) => {
  if (error) throw error;
  console.log(`API ready at ${config.PUBLIC_API_URL}`);
});
