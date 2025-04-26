import Redis from 'ioredis';
import fetch from 'node-fetch';
import Sentiment from 'sentiment';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379');
const OPENWEATHER_KEY = process.env.OPENWEATHER_API_KEY || '';
const LAT = process.env.LATITUDE || '0';
const LON = process.env.LONGITUDE || '0';

const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT });
const sentiment = new Sentiment();

async function fetchWeather() {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${OPENWEATHER_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather fetch failed: ${res.statusText}`);
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
    } catch (err) {
      console.error('Error in aggregator loop:', err);
    }
  }, 1000);
}

main();
