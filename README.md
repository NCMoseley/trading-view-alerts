# Engulfing Strategy Alerts

This is a simple script to send alerts for the Engulfing Strategy to TradingView.

## How to use

1. Install

```sh
install.sh
```

If the script doesn't work, you can run the following commands manually:

```sh
npm i
node server.js
ngrok http 8080
```

2. Add the pine script Candle_Breaks_1v1_0.0.2 to your chart. See [TV Indicator](https://www.tradingview.com/script/sY3O4f3W-Engulfing-Candle-1v1-0-0-2/)

3. Copy the ngrok url and paste it into the TradingView alert webhook. Don't forget to add the `/trading-view-alerts` endpoint.
