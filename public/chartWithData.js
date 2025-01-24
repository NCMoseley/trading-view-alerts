// Alerts data
const alertsData = [
	{
		"symbol": "SOLUSD",
		"tf": "5m",
		"direction": "Short",
		"price": "264.39",
		"tp": "264.01",
		"date": "2025-01-24T08:50:04+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "9m",
		"direction": "Short",
		"price": "264.066",
		"tp": "263.55",
		"date": "2025-01-24T09:09:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "10m",
		"direction": "Short",
		"price": "263.914",
		"tp": "263.3",
		"date": "2025-01-24T09:10:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSD",
		"tf": "5m",
		"direction": "Long",
		"price": "263.87",
		"tp": "264.08",
		"date": "2025-01-24T09:15:10+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "6m",
		"direction": "Long",
		"price": "263.812",
		"tp": "264.07",
		"date": "2025-01-24T09:18:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "3m",
		"direction": "",
		"price": "263.915",
		"tp": "264.06",
		"date": "2025-01-24T09:21:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "9m",
		"direction": "Short",
		"price": "263.624",
		"tp": "263.08",
		"date": "2025-01-24T09:27:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "10m",
		"direction": "Short",
		"price": "263.522",
		"tp": "262.92",
		"date": "2025-01-24T09:30:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSD",
		"tf": "5m",
		"direction": "Short",
		"price": "263.72",
		"tp": "263.4",
		"date": "2025-01-24T09:30:05+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "12m",
		"direction": "Short",
		"price": "263.675",
		"tp": "263.17",
		"date": "2025-01-24T09:36:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "3m",
		"direction": "",
		"price": "263.086",
		"tp": "263.29",
		"date": "2025-01-24T09:36:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSD",
		"tf": "5m",
		"direction": "Long",
		"price": "263.32",
		"tp": "263.56",
		"date": "2025-01-24T09:40:06+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "9m",
		"direction": "Long",
		"price": "263.465",
		"tp": "263.92",
		"date": "2025-01-24T09:45:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSDT.P",
		"tf": "6m",
		"direction": "Short",
		"price": "263.394",
		"tp": "262.79",
		"date": "2025-01-24T09:48:00+0000",
		"situation": "1v1"
	},
	{
		"symbol": "SOLUSD",
		"tf": "5m",
		"direction": "Short",
		"price": "263.67",
		"tp": "263.55",
		"date": "2025-01-24T09:50:10+0000",
		"situation": "1v1"
	}
];

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
				data: [], // Start with empty data
				backgroundColor: function (context) {
					if (context.raw && context.raw.direction) {
						return context.raw.direction.toLowerCase() === "long"
							? "green"
							: "red";
					}
					return "red";
				},
				pointStyle: function (context) {
					return "triangle";
				},
				rotation: function (context) {
					if (context.raw && context.raw.direction) {
						return context.raw.direction.toLowerCase() === "long" ? 0 : 180;
					}
					return 0;
				},
				pointRadius: 8,
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
							return `${alert.tf} | ${alert.direction} | TP: ${alert.tp
								} | ${new Date(alert.date).toLocaleString()}`;
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

// Load saved data from localStorage
function loadSavedData() {
	try {
		const savedData = JSON.parse(localStorage.getItem("chartData") || "{}");
		if (savedData.labels) {
			chart.data.labels = savedData.labels;
			chart.data.datasets[0].data = savedData.priceData;
			chart.data.datasets[1].data = savedData.alertData;
			chart.update();
		}
	} catch (error) {
		console.error("Error loading saved data:", error);
	}
}

// Save data to localStorage
function saveChartData() {
	try {
		const dataToSave = {
			labels: chart.data.labels,
			priceData: chart.data.datasets[0].data,
			alertData: chart.data.datasets[1].data,
			timestamp: new Date().getTime(),
		};
		localStorage.setItem("chartData", JSON.stringify(dataToSave));
	} catch (error) {
		console.error("Error saving data:", error);
	}
}

// Load all alerts from alerts data
function loadAllAlerts() {
	try {
		// Clear existing alerts
		chart.data.datasets[1].data = [];

		// Add all alerts from alertsData
		alertsData.forEach((alert) => {
			const alertTime = new Date(alert.date);
			const formattedTime = `${alertTime.getHours().toString().padStart(2, '0')}:${alertTime.getMinutes().toString().padStart(2, '0')}:${alertTime.getSeconds().toString().padStart(2, '0')}`;

			const baseTP = Number(alert.tp);
			const offset =
				alert.direction && alert.direction.toLowerCase() === "long"
					? 2.0
					: -2.0;

			const alertData = {
				x: formattedTime,
				y: baseTP + offset,
				tp: baseTP,
				tf: alert.tf || "N/A",
				direction: alert.direction || "N/A",
				date: alert.date,
			};

			chart.data.datasets[1].data.push(alertData);
		});

		// Sort alerts by time
		chart.data.datasets[1].data.sort(
			(a, b) => new Date(a.date) - new Date(b.date)
		);

		// Save to localStorage and update chart
		saveChartData();
		chart.update();
	} catch (error) {
		console.error('Error loading alerts:', error);
	}
}

// Initialize in the correct order
loadAllAlerts(); // Load alerts first
loadSavedData(); // Then load any saved data
chart.update(); // Make sure chart is updated

let lastMinute = new Date().getMinutes();
let currentMinutePrices = [];
let lastFetchTime = 0;

// Fetch and process new alerts
async function fetchNewAlerts() {
	try {
		const response = await fetch(
			"https://3c77-2a04-ee41-2-e136-7815-1a3c-10d5-15fe.ngrok-free.app/alerts"
		);
		const data = await response.json();

		if (data.alerts && Array.isArray(data.alerts)) {
			chart.data.datasets[1].data = [];
			data.alerts.forEach((alert) => {
				addAlertToChart(alert);
			});
			saveChartData();
			chart.update();
		}
	} catch (error) {
		console.error("Error fetching alerts:", error);
	}
}

function addAlertToChart(alert) {
	try {
		if (alert.tp) {
			const alertTime = new Date(alert.date);
			const formattedTime = `${alertTime.getHours().toString().padStart(2, '0')}:${alertTime.getMinutes().toString().padStart(2, '0')}:${alertTime.getSeconds().toString().padStart(2, '0')}`;

			const baseTP = Number(alert.tp);
			const offset =
				alert.direction && alert.direction.toLowerCase() === "long"
					? 2.0
					: -2.0;

			const alertData = {
				x: formattedTime,
				y: baseTP + offset,
				tp: baseTP,
				tf: alert.tf || "N/A",
				direction: alert.direction || "N/A",
				date: alert.date,
			};

			chart.data.datasets[1].data.push(alertData);
			chart.data.datasets[1].data.sort(
				(a, b) => new Date(a.date) - new Date(b.date)
			);
			chart.update();
		}
	} catch (error) {
		console.error("Error adding alert to chart:", error, alert);
	}
}

function updateChart(price, timestamp) {
	const currentMinute = new Date(timestamp).getMinutes();

	if (currentMinute !== lastMinute) {
		const avgPrice =
			currentMinutePrices.reduce((a, b) => a + b, 0) /
			currentMinutePrices.length;
		const timeStr = new Date(timestamp).toLocaleTimeString();

		chart.data.labels.push(timeStr);
		chart.data.datasets[0].data.push(avgPrice);

		if (chart.data.labels.length > 10080) {
			chart.data.labels.shift();
			chart.data.datasets[0].data.shift();
			const oldestTime = new Date(timestamp);
			oldestTime.setDate(oldestTime.getDate() - 7);
			chart.data.datasets[1].data = chart.data.datasets[1].data.filter(
				(alert) => new Date(alert.date) > oldestTime
			);
		}

		chart.update();
		saveChartData();
		currentMinutePrices = [price];
		lastMinute = currentMinute;
	} else {
		currentMinutePrices.push(price);
	}
}

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
		currentPriceDiv.innerHTML = `SOL/USD Binance: $${price.toFixed(2)}`;
		updateChart(price, trade.time);
	}
};

ws.onerror = (error) => console.error("WebSocket error:", error);
ws.onclose = () => console.log("WebSocket connection closed");

// Save data periodically
setInterval(saveChartData, 60000);

// Fetch new alerts periodically
setInterval(fetchNewAlerts, 30000);

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
