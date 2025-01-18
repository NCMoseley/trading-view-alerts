const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());

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

		appendToJsonFile(alertData, 'alerts.json');
		res.status(200).send('Alert received');
	} catch (error) {
		console.error('Error processing alert:', error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.use('*', (req, res) => {
	res.status(404).json({
		error: 'Not Found',
		message: `The requested path ${req.originalUrl} does not exist on this server`
	});
});

app.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});