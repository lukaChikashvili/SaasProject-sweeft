import express from 'express'
import "dotenv/config"
const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({extended: true}));

import apiRoutes from './routes/api.js'

app.use("/api", apiRoutes);

app.listen(PORT, () => console.log(`server is running`))


