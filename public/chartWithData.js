// Alerts data
const alertsData = [
	{
		"symbol": "SOLUSDT.P",
		"tf": "12m",
		"direction": "Long",
		"price": "264.059",
		"tp": "264.34",
		"date": "2025-01-24T13:36:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "3m",
		"direction": "",
		"price": "265.514",
		"tp": "265.21",
		"date": "2025-01-24T13:39:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "3m",
		"direction": "",
		"price": "265.406",
		"tp": "265.59",
		"date": "2025-01-24T13:45:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "6m",
		"direction": "Long",
		"price": "265.903",
		"tp": "266.39",
		"date": "2025-01-24T13:48:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "8m",
		"direction": "Long",
		"price": "265.903",
		"tp": "266.45",
		"date": "2025-01-24T13:52:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "1H",
		"direction": "Long",
		"price": "266.674",
		"tp": "268.22",
		"date": "2025-01-24T14:00:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "3m",
		"direction": "",
		"price": "266.847",
		"tp": "266.54",
		"date": "2025-01-24T14:06:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "6m",
		"direction": "Long",
		"price": "266.847",
		"tp": "267.02",
		"date": "2025-01-24T14:12:00+0000",
		"situation": "1v1"
	}
];

// Price data array to store historical prices
const priceData = [];

// Initialize the chart with two datasets
const ctx = document.getElementById("priceChart").getContext("2d");
const chart = new Chart(ctx, {
	type: "line",
	data: {
		labels: [],
		datasets: [
			{
				label: "SOL-USD Price",
				data: [],
				borderColor: "grey",
				tension: 0.1,
			},
			{
				label: "Alerts",
				data: [],
				backgroundColor: function (context) {
					if (context.raw && context.raw.direction) {
						return context.raw.direction.toLowerCase() === "long" ? "rgba(0, 255, 0, 0.8)" : "rgba(255, 0, 0, 0.8)";
					}
					return "rgba(255, 0, 0, 0.8)";
				},
				borderColor: function (context) {
					if (context.raw && context.raw.direction) {
						return context.raw.direction.toLowerCase() === "long" ? "green" : "red";
					}
					return "red";
				},
				pointStyle: 'triangle',
				rotation: function (context) {
					if (context.raw && context.raw.direction) {
						return context.raw.direction.toLowerCase() === "long" ? 0 : 180;
					}
					return 180;
				},
				pointRadius: 10,
				showLine: false,
			},
		],
	},
	options: {
		responsive: true,
		scales: {
			y: {
				min: 230,
				max: 290,
				beginAtZero: false,
				grid: {
					color: "#333333",
					borderColor: "#444444",
				},
				ticks: {
					stepSize: 10,
					color: "#ffffff",
					callback: function (value, index, values) {
						const yZoom = parseFloat(
							document.getElementById("yZoomSlider").value
						);
						const overallZoom = parseFloat(
							document.getElementById("overallZoomSlider").value
						);
						const totalZoom = yZoom * overallZoom;

						if (totalZoom > 2) {
							return value.toFixed(3);
						} else if (totalZoom > 1) {
							return value.toFixed(2);
						} else {
							return value.toFixed(1);
						}
					},
				},
			},
			x: {
				type: "category",
				display: true,
				grid: {
					color: "#333333",
					borderColor: "#444444",
				},
				ticks: {
					maxRotation: 45,
					color: "#ffffff",
				},
			},
		},
		animation: {
			duration: 0,
		},
		plugins: {
			legend: {
				labels: {
					color: "#ffffff",
				},
			},
			tooltip: {
				backgroundColor: "#242424",
				titleColor: "#ffffff",
				bodyColor: "#ffffff",
				borderColor: "#444444",
				borderWidth: 1,
				callbacks: {
					label: function (context) {
						if (context.datasetIndex === 1) {
							const alert = context.raw;
							const alertTime = new Date(alert.date);
							const formattedTime = formatTimeForChart(alertTime);
							return `${alert.tf} | ${alert.direction} | TP: ${alert.tp} | ${formattedTime}`;
						}
						return `Price: $${context.raw}`;
					},
				},
			},
			zoom: {
				pan: {
					enabled: true,
					mode: "xy",
					modifierKey: null,
					threshold: 5,
					speed: 10,
				},
				zoom: {
					wheel: {
						enabled: true,
						modifierKey: "ctrl",
					},
					pinch: {
						enabled: true,
					},
					mode: "xy",
					drag: {
						enabled: false,
					},
				},
			},
		},
		backgroundColor: "#242424",
	},
});

// Initialize IndexedDB
let db;
const dbName = "tradingViewDB";
const request = indexedDB.open(dbName, 1);

request.onerror = (event) => {
	console.error("Database error:", event.target.error);
};

request.onupgradeneeded = (event) => {
	db = event.target.result;

	// Create stores if they don't exist
	if (!db.objectStoreNames.contains('priceData')) {
		const priceStore = db.createObjectStore('priceData', { keyPath: 'time' });
		priceStore.createIndex('time', 'time', { unique: true });
	}

	if (!db.objectStoreNames.contains('alerts')) {
		const alertStore = db.createObjectStore('alerts', { keyPath: 'date' });
		alertStore.createIndex('date', 'date', { unique: true });
	}
};

request.onsuccess = (event) => {
	db = event.target.result;
	loadPriceData();
	loadAllAlerts();
};

// Save price data to IndexedDB
function savePriceData(pricePoint) {
	if (!db) return;

	const transaction = db.transaction(['priceData'], 'readwrite');
	const store = transaction.objectStore('priceData');
	store.put(pricePoint);
}

// Load price data from IndexedDB
function loadPriceData() {
	if (!db) return;

	const transaction = db.transaction(['priceData'], 'readonly');
	const store = transaction.objectStore('priceData');
	const request = store.getAll();

	request.onsuccess = () => {
		const savedPriceData = request.result;
		if (savedPriceData.length > 0) {
			// Sort by time
			savedPriceData.sort((a, b) => new Date(a.time) - new Date(b.time));

			// Update chart data
			chart.data.labels = savedPriceData.map(data => data.formattedTime);
			chart.data.datasets[0].data = savedPriceData.map(data => data.price);
			chart.update();
		}
	};
}

// Function to format time consistently
function formatTimeForChart(date) {
	const d = new Date(date);
	const hours = d.getHours().toString().padStart(2, '0');
	const minutes = d.getMinutes().toString().padStart(2, '0');
	const seconds = d.getSeconds().toString().padStart(2, '0');
	return `${hours}:${minutes}:${seconds}`;
}

// Load all alerts from IndexedDB
function loadAllAlerts() {
	if (!db) return;

	const transaction = db.transaction(['alerts'], 'readonly');
	const store = transaction.objectStore('alerts');
	const request = store.getAll();

	request.onsuccess = () => {
		const alerts = request.result;
		// Also load alerts from alertsData array
		const combinedAlerts = [...alerts, ...alertsData];

		// Remove duplicates based on date
		const uniqueAlerts = Array.from(new Map(combinedAlerts.map(alert => [alert.date, alert])).values());

		if (uniqueAlerts.length > 0) {
			// Clear existing alerts from chart
			chart.data.datasets[1].data = new Array(chart.data.labels.length).fill(null);

			uniqueAlerts.forEach((alert) => {
				const formattedTime = formatTimeForChart(alert.date);
				const baseTP = Number(alert.tp);
				const offset = alert.direction && alert.direction.toLowerCase() === "long" ? -2.0 : 2.0;

				const alertData = {
					y: baseTP + offset,
					tp: baseTP,
					tf: alert.tf || "N/A",
					direction: alert.direction || "N/A",
					date: alert.date,
				};

				// Find the index where this alert should be inserted
				const alertTime = formattedTime;
				let insertIndex = chart.data.labels.indexOf(alertTime);

				if (insertIndex === -1) {
					// If the exact time isn't found, find the closest time
					const times = chart.data.labels.map(label => {
						const [hours, minutes, seconds] = label.split(':').map(Number);
						return hours * 3600 + minutes * 60 + seconds;
					});

					const alertTimeParts = alertTime.split(':').map(Number);
					const alertSeconds = alertTimeParts[0] * 3600 + alertTimeParts[1] * 60 + alertTimeParts[2];

					// Find the closest time
					insertIndex = times.findIndex(time => time >= alertSeconds);
					if (insertIndex === -1) insertIndex = chart.data.labels.length - 1;
				}

				// Add the alert at the correct position
				if (insertIndex >= 0 && insertIndex < chart.data.labels.length) {
					chart.data.datasets[1].data[insertIndex] = alertData;
				}
			});

			chart.update();
		}
	};
}

// Function to add new alert
function addAlert(alertData) {
	if (!alertData.date || !alertData.tp) {
		console.error('Invalid alert data:', alertData);
		return;
	}

	const formattedTime = formatTimeForChart(alertData.date);
	const baseTP = Number(alertData.tp);
	const offset = alertData.direction && alertData.direction.toLowerCase() === "long" ? -2.0 : 2.0;

	// Create alert data in the same format as price data
	const chartAlertData = {
		y: baseTP + offset,
		tp: baseTP,
		tf: alertData.tf || "N/A",
		direction: alertData.direction || "N/A",
		date: alertData.date,
	};

	// Check if alert already exists in chart
	const exists = chart.data.datasets[1].data.some(existing => existing.date === alertData.date);
	if (!exists) {
		// Find the index where this alert should be inserted in the labels array
		const alertTime = formattedTime;
		let insertIndex = chart.data.labels.indexOf(alertTime);

		if (insertIndex === -1) {
			// If the exact time isn't found, find the closest time
			const times = chart.data.labels.map(label => {
				const [hours, minutes, seconds] = label.split(':').map(Number);
				return hours * 3600 + minutes * 60 + seconds;
			});

			const alertTimeParts = alertTime.split(':').map(Number);
			const alertSeconds = alertTimeParts[0] * 3600 + alertTimeParts[1] * 60 + alertTimeParts[2];

			// Find the closest time
			insertIndex = times.findIndex(time => time >= alertSeconds);
			if (insertIndex === -1) insertIndex = chart.data.labels.length;
		}

		// Add the alert at the correct position
		chart.data.datasets[1].data[insertIndex] = chartAlertData;
		chart.update();

		// Save to IndexedDB
		saveAlert(alertData);
	}
}

// WebSocket connection for new alerts
const alertSocket = new WebSocket('ws://localhost:3000');
alertSocket.onmessage = (event) => {
	try {
		const alertData = JSON.parse(event.data);
		addAlert(alertData);
	} catch (error) {
		console.error('Error processing WebSocket alert:', error);
	}
};

let lastMinute = new Date().getMinutes();
let currentMinutePrices = [];
let lastFetchTime = 0;

// WebSocket connection
const currentPriceDiv = document.getElementById("currentPrice");
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
		currentPriceDiv.innerHTML = `SOL/USD Coinbase: $${price.toFixed(2)}`;
		updateChart(price, trade.time);
	}
};

ws.onerror = (error) => console.error("WebSocket error:", error);
ws.onclose = () => console.log("WebSocket connection closed");

// Save data periodically
setInterval(saveChartData, 60000);

// Zoom control functions
function updateZoom() {
	const overallZoom = parseFloat(
		document.getElementById("overallZoomSlider").value
	);
	const xZoom = parseFloat(document.getElementById("xZoomSlider").value);
	const yZoom = parseFloat(document.getElementById("yZoomSlider").value);

	document.getElementById(
		"overallZoomValue"
	).textContent = `${overallZoom.toFixed(1)}x`;
	document.getElementById("xZoomValue").textContent = `${xZoom.toFixed(1)}x`;
	document.getElementById("yZoomValue").textContent = `${yZoom.toFixed(1)}x`;

	const lastPrice =
		chart.data.datasets[0].data[chart.data.datasets[0].data.length - 1];
	const yCenter = lastPrice || 260;
	const yRange = 15;

	const totalYZoom = yZoom * overallZoom;
	const newYRange = yRange / totalYZoom;

	chart.options.scales.y.min = yCenter - newYRange;
	chart.options.scales.y.max = yCenter + newYRange;

	if (totalYZoom > 100) {
		chart.options.scales.y.ticks.stepSize = 0.0001;
	} else if (totalYZoom > 50) {
		chart.options.scales.y.ticks.stepSize = 0.0005;
	} else if (totalYZoom > 20) {
		chart.options.scales.y.ticks.stepSize = 0.001;
	} else if (totalYZoom > 10) {
		chart.options.scales.y.ticks.stepSize = 0.01;
	} else if (totalYZoom > 5) {
		chart.options.scales.y.ticks.stepSize = 0.1;
	} else if (totalYZoom > 1) {
		chart.options.scales.y.ticks.stepSize = 1;
	} else {
		chart.options.scales.y.ticks.stepSize = 10;
	}

	chart.options.scales.y.ticks.callback = function (value) {
		if (totalYZoom > 100) {
			return value.toFixed(6);
		} else if (totalYZoom > 50) {
			return value.toFixed(5);
		} else if (totalYZoom > 20) {
			return value.toFixed(4);
		} else if (totalYZoom > 10) {
			return value.toFixed(3);
		} else if (totalYZoom > 5) {
			return value.toFixed(2);
		} else {
			return value.toFixed(1);
		}
	};

	const lastIndex = chart.data.labels.length - 1;
	if (lastIndex >= 0) {
		const visiblePoints = Math.floor(
			chart.data.labels.length / (xZoom * overallZoom)
		);
		const startIndex = Math.max(0, lastIndex - visiblePoints);

		chart.options.scales.x.min = chart.data.labels[startIndex];
		chart.options.scales.x.max = chart.data.labels[lastIndex];
	}

	chart.update();
}

function updateYRange() {
	const yMin = parseFloat(document.getElementById("yMin").value);
	const yMax = parseFloat(document.getElementById("yMax").value);

	if (!isNaN(yMin) && !isNaN(yMax) && yMin < yMax) {
		chart.options.scales.y.min = yMin;
		chart.options.scales.y.max = yMax;

		const yCenter = (yMax + yMin) / 2;
		const yRange = (yMax - yMin) / 2;

		const overallZoom = parseFloat(
			document.getElementById("overallZoomSlider").value
		);
		const yZoom = parseFloat(document.getElementById("yZoomSlider").value);
		const totalYZoom = yZoom * overallZoom;
		const newYRange = yRange / totalYZoom;

		chart.options.scales.y.min = yCenter - newYRange;
		chart.options.scales.y.max = yCenter + newYRange;

		chart.update();
	}
}

function resetZoom() {
	document.getElementById("overallZoomSlider").value = 1;
	document.getElementById("xZoomSlider").value = 1;
	document.getElementById("yZoomSlider").value = 1;
	document.getElementById("overallZoomValue").textContent = "1.0x";
	document.getElementById("xZoomValue").textContent = "1.0x";
	document.getElementById("yZoomValue").textContent = "1.0x";

	document.getElementById("yMin").value = "230";
	document.getElementById("yMax").value = "290";

	chart.options.scales.y.min = 230;
	chart.options.scales.y.max = 290;
	chart.options.scales.y.ticks.stepSize = 10;
	chart.resetZoom();
}

// Clean up old data on page load
window.addEventListener("load", () => {
	const savedData = JSON.parse(localStorage.getItem("chartData") || "{}");
	if (savedData.timestamp) {
		const oneWeekAgo = new Date().getTime() - 7 * 24 * 60 * 60 * 1000;
		if (savedData.timestamp < oneWeekAgo) {
			localStorage.removeItem("chartData");
		}
	}
});

// Update chart function
function updateChart(price, timestamp) {
	const currentMinute = new Date(timestamp).getMinutes();

	if (currentMinute !== lastMinute) {
		const avgPrice = currentMinutePrices.reduce((a, b) => a + b, 0) / currentMinutePrices.length;
		const timeStr = formatTimeForChart(timestamp);

		const pricePoint = {
			time: timestamp,
			price: avgPrice,
			formattedTime: timeStr
		};

		// Save to IndexedDB
		savePriceData(pricePoint);

		// Update chart
		chart.data.labels.push(timeStr);
		chart.data.datasets[0].data.push(avgPrice);

		if (chart.data.labels.length > 10080) {
			chart.data.labels.shift();
			chart.data.datasets[0].data.shift();
		}

		chart.update();
		currentMinutePrices = [price];
		lastMinute = currentMinute;
	} else {
		currentMinutePrices.push(price);
	}
}
