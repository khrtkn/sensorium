"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ioredis_1 = __importDefault(require("ioredis"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const sentiment_1 = __importDefault(require("sentiment"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY || '';
const LAT = process.env.LATITUDE || '0';
const LON = process.env.LONGITUDE || '0';
const redis = new ioredis_1.default({ host: REDIS_HOST, port: REDIS_PORT });
const sentiment = new sentiment_1.default();
async function fetchWeather() {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${OPENWEATHER_KEY}&units=metric`;
    const res = await (0, node_fetch_1.default)(url);
    if (!res.ok)
        throw new Error(`Weather fetch failed: ${res.statusText}`);
    return res.json();
}
async function fetchSNS() {
    // TODO: Integrate real SNS API (e.g., Twitter)
    return { text: 'sample SNS text for sentiment analysis' };
}
async function main() {
    setInterval(async () => {
        try {
            const weather = await fetchWeather();
            const sns = await fetchSNS();
            const { score } = sentiment.analyze(sns.text);
            const payload = { timestamp: new Date().toISOString(), weather, sns, sentimentScore: score };
            await redis.publish('sensorium', JSON.stringify(payload));
            console.log('Published:', payload);
        }
        catch (err) {
            console.error('Error in aggregator loop:', err);
        }
    }, 1000);
}
main();
