import { Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";

interface WebSocketClient {
  ws: WebSocket;
  userId?: number;
  portfolioId?: number;
}

class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Set<WebSocketClient> = new Set();
  private priceUpdateInterval: NodeJS.Timeout | null = null;

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocket();
    this.startPriceUpdates();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      const client: WebSocketClient = { ws };
      this.clients.add(client);

      ws.on('message', async (message: string) => {
        try {
          const data = JSON.parse(message);
          
          switch (data.type) {
            case 'subscribe_portfolio':
              client.userId = data.userId;
              client.portfolioId = data.portfolioId;
              // Send initial portfolio data
              await this.sendPortfolioUpdate(client);
              break;
              
            case 'subscribe_prices':
              // Send current stock prices
              await this.sendPriceUpdate(client);
              break;
              
            case 'ping':
              ws.send(JSON.stringify({ type: 'pong' }));
              break;
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(client);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(client);
      });

      // Send welcome message
      ws.send(JSON.stringify({ 
        type: 'connected', 
        message: 'Real-time updates connected' 
      }));
    });
  }

  private startPriceUpdates() {
    // Update prices every 5 seconds
    this.priceUpdateInterval = setInterval(async () => {
      await this.updateStockPrices();
      await this.broadcastPriceUpdates();
      await this.broadcastPortfolioUpdates();
    }, 5000);
  }

  private async updateStockPrices() {
    try {
      const stocks = await storage.getAllStocks();
      
      for (const stock of stocks) {
        // Simulate real-time price movement
        const currentPrice = parseFloat(stock.currentPrice);
        const volatility = 0.02; // 2% volatility
        const randomChange = (Math.random() - 0.5) * volatility;
        const newPrice = currentPrice * (1 + randomChange);
        
        // Update stock price
        await storage.updateStock(stock.id, {
          currentPrice: newPrice.toFixed(2),
          dayChange: ((newPrice - currentPrice) / currentPrice * 100).toFixed(2),
          dayChangePercent: ((newPrice - currentPrice) / currentPrice * 100).toFixed(2),
        });
      }
    } catch (error) {
      console.error('Error updating stock prices:', error);
    }
  }

  private async broadcastPriceUpdates() {
    const stocks = await storage.getAllStocks();
    const priceData = stocks.map(stock => ({
      symbol: stock.symbol,
      price: stock.currentPrice,
      change: stock.dayChange,
      changePercent: stock.dayChangePercent,
      timestamp: new Date().toISOString()
    }));

    this.broadcast({
      type: 'price_update',
      data: priceData
    });
  }

  private async broadcastPortfolioUpdates() {
    for (const client of this.clients) {
      if (client.portfolioId) {
        await this.sendPortfolioUpdate(client);
      }
    }
  }

  private async sendPortfolioUpdate(client: WebSocketClient) {
    try {
      if (!client.portfolioId) return;

      const portfolio = await storage.getPortfolio(client.portfolioId);
      if (!portfolio) return;

      const holdings = await storage.getPortfolioHoldings(client.portfolioId);
      const riskMetrics = await storage.getPortfolioRiskMetrics(client.portfolioId);

      // Calculate real-time portfolio value
      let totalValue = 0;
      const updatedHoldings = [];

      for (const holding of holdings) {
        const stock = await storage.getStockBySymbol(holding.symbol);
        if (stock) {
          const quantity = parseFloat(holding.quantity);
          const currentPrice = parseFloat(stock.currentPrice);
          const currentValue = quantity * currentPrice;
          totalValue += currentValue;

          updatedHoldings.push({
            ...holding,
            currentValue: currentValue.toFixed(2),
            currentPrice: stock.currentPrice,
            dayChange: stock.dayChange,
            dayChangePercent: stock.dayChangePercent
          });
        }
      }

      // Update portfolio total value
      if (totalValue > 0) {
        await storage.updatePortfolio(client.portfolioId, {
          totalValue: totalValue.toFixed(2)
        });
      }

      client.ws.send(JSON.stringify({
        type: 'portfolio_update',
        data: {
          portfolio: { ...portfolio, totalValue: totalValue.toFixed(2) },
          holdings: updatedHoldings,
          riskMetrics,
          timestamp: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Error sending portfolio update:', error);
    }
  }

  private async sendPriceUpdate(client: WebSocketClient) {
    const stocks = await storage.getAllStocks();
    const priceData = stocks.map(stock => ({
      symbol: stock.symbol,
      price: stock.currentPrice,
      change: stock.dayChange,
      changePercent: stock.dayChangePercent,
      timestamp: new Date().toISOString()
    }));

    client.ws.send(JSON.stringify({
      type: 'price_update',
      data: priceData
    }));
  }

  private broadcast(message: any) {
    const messageStr = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
      }
    });
  }

  public stop() {
    if (this.priceUpdateInterval) {
      clearInterval(this.priceUpdateInterval);
    }
    this.wss.close();
  }
}

export { WebSocketManager };