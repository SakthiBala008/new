import { storage } from "./storage";

class PriceSimulator {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log("🔄 Starting price simulator for dynamic market data");
    
    // Update prices every 5 seconds
    this.intervalId = setInterval(async () => {
      await this.updatePrices();
    }, 5000);

    // Initial price update
    this.updatePrices();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log("⏹️ Price simulator stopped");
  }

  private async updatePrices() {
    try {
      const stocks = await storage.getAllStocks();
      
      for (const stock of stocks) {
        const currentPrice = parseFloat(stock.currentPrice);
        
        // Simulate price movement with realistic volatility
        const volatility = this.getVolatility(stock.symbol);
        const randomChange = (Math.random() - 0.5) * 2 * volatility;
        const newPrice = Math.max(currentPrice * (1 + randomChange), 1); // Ensure price stays positive
        
        const change = newPrice - currentPrice;
        const changePercent = (change / currentPrice) * 100;
        
        // Update stock price
        await storage.updateStock(stock.id, {
          currentPrice: newPrice.toFixed(2),
          change: change >= 0 ? `+${change.toFixed(2)}` : change.toFixed(2),
          changePercent: changePercent >= 0 ? `+${changePercent.toFixed(2)}` : changePercent.toFixed(2),
        });
      }
      
      console.log(`📊 Updated prices for ${stocks.length} stocks`);
    } catch (error) {
      console.error("Error updating stock prices:", error);
    }
  }

  private getVolatility(symbol: string): number {
    // Different volatilities for different types of assets
    const volatilities: Record<string, number> = {
      'TCS': 0.015,      // 1.5% volatility
      'RIL': 0.020,      // 2.0% volatility  
      'INFY': 0.018,     // 1.8% volatility
      'HDFCBANK': 0.025, // 2.5% volatility
      'WIPRO': 0.022,    // 2.2% volatility
      'ICICIBANK': 0.028, // 2.8% volatility
      'LT': 0.020,       // 2.0% volatility
      'BHARTIARTL': 0.018, // 1.8% volatility
      'GOLD': 0.012,     // 1.2% volatility (lower for gold)
      'CASH': 0.001,     // 0.1% volatility (very low for cash)
    };
    
    return volatilities[symbol] || 0.020; // Default 2% volatility
  }
}

export const priceSimulator = new PriceSimulator();