import express from "express";
import { createDraft, getDraft, makePick } from './routes';
import bodyParser from 'body-parser';


// Configure and start the HTTP server.
const port = 8088;
const app = express();
app.use(bodyParser.json());
app.get("/api/getDraft", getDraft);
app.post("/api/createDraft", createDraft);
app.post("/api/makePick", makePick);
app.listen(port, () => console.log(`Server listening on ${port}`));
