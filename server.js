const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(express.static('public'));

// Option 1: Enable CORS for all routes
app.use(cors({
	origin: '*',  // Allow all origins
	methods: ['GET', 'POST'],  // Allow GET and POST methods
	allowedHeaders: ['Content-Type']  // Allow Content-Type header
}));

// Save price data to file
let lastMinute = new Date().getMinutes();
let currentMinutePrices = [];

const updatePriceData = async (price, tradeTime) => {
	try {
		const currentMinute = new Date(tradeTime).getMinutes();

		if (currentMinute !== lastMinute) {
			// Calculate average price for the last minute
			const avgPrice = currentMinutePrices.reduce((a, b) => a + b, 0) / currentMinutePrices.length;

			const priceData = {
				price: avgPrice,
				time: tradeTime,
				formattedTime: new Date(tradeTime).toLocaleTimeString()
			};

			console.log("Average price for the last minute:", avgPrice);
			await appendToJsonFile(priceData, 'priceData.json');

			// Reset for next minute
			currentMinutePrices = [price];
			lastMinute = currentMinute;
		} else {
			// Collect prices within the minute
			currentMinutePrices.push(price);
		}
	} catch (error) {
		console.error('Error saving price data:', error);
	}
};

async function appendToJsonFile(newData, filename) {
	try {
		let data = [];
		try {
			const fileContent = await fs.readFile(filename, 'utf8');
			data = JSON.parse(fileContent);
		} catch (error) {
			data = [];
		}

		data.push(newData);
		await fs.writeFile(filename, JSON.stringify(data, null, 2));
		console.log('Successfully appended to file');
	} catch (error) {
		console.error('Error appending to file:', error);
	}
}

app.post('/tradingview-alert', (req, res) => {
	try {
		console.log('Received TradingView alert:', req.body);
		let alertData = req.body;
		if (alertData.alert_data) {
			try {
				const parsedAlertData = JSON.parse(alertData.alert_data);
				alertData = {
					...parsedAlertData,
					received_at: new Date().toISOString()
				};
			} catch (parseError) {
				console.error('Error parsing alert_data:', parseError);
			}
		}

		appendToJsonFile(alertData, 'public/alerts.json');
		res.status(200).send('Alert received');
	} catch (error) {
		console.error('Error processing alert:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.get('/alerts', async (req, res) => {
	try {
		const { limit = 10, offset = 0 } = req.query;
		const fileContent = await fs.readFile('public/alerts.json', 'utf8');
		const alerts = JSON.parse(fileContent);

		// Get subset of alerts based on limit and offset
		const paginatedAlerts = alerts.slice(offset, offset + parseInt(limit));

		res.json({
			total: alerts.length,
			alerts: paginatedAlerts
		});
	} catch (error) {
		console.error('Error reading alerts:', error);
		res.status(500).json({
			error: 'Internal server error',
			message: 'Could not retrieve alerts'
		});
	}
});

app.use('*', (req, res) => {
	res.status(404).json({
		error: 'Not Found',
		message: `The requested path ${req.originalUrl} does not exist on this server`
	});
});

function connectWebSocket() {
	const ws = new WebSocket("wss://ws-feed.exchange.coinbase.com");

	ws.onopen = () => {
		console.log("Connected to Coinbase WebSocket");
		ws.send(
			JSON.stringify({
				type: "subscribe",
				product_ids: ["SOL-USD"],
				channels: ["matches"],
			})
		);
	};

	ws.onmessage = (event) => {
		const trade = JSON.parse(event.data);
		if (trade.type === "match") {
			const price = parseFloat(trade.price);
			console.log(`Price update: ${price}`);
		}
	};

	ws.onerror = (error) => {
		console.error("WebSocket error:", error);
		setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
	};

	ws.onclose = () => {
		console.log("WebSocket connection closed");
		setTimeout(connectWebSocket, 5000); // Reconnect after 5 seconds
	};
}

connectWebSocket();

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});