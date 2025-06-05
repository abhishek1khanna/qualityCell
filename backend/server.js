import express from "express";
import dotenv from 'dotenv';
import userRoutes from './routes/userRoutes.js';
import connectDB from "./config/conn.js";
import {errorHandler} from "./middleware/errorHandler.js";
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';

dotenv.config();
const app = express();
// app.use(express.json());
app.use(express.json({ limit: '10mb' }));
connectDB();

const port = process.env.PORT || 80;

const __dirname = path.resolve(path.dirname('')); 
const filePath = path.join(__dirname,'./uploads');
if (!fs.existsSync(filePath)) {
fs.mkdirSync(filePath);
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use(cors());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, XMLHttpRequest, ngsw-bypass, Lng, Lang');
    next();
});



app.use('/api',  userRoutes  );
app.use(express.static(path.join(__dirname, "dist")));


app.use((req, res, next) => {
    if (req.accepts('html') && req.path.indexOf('.') === -1) {
        res.sendFile('index.html', { root: path.join(__dirname, '/dist') });
    } else {
        next(); // Pass control to the static file handler
    }
});

app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
