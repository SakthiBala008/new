import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  optimizePortfolioSchema,
  insertPortfolioSchema,
  insertPortfolioHoldingSchema 
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Portfolio routes
  app.get("/api/portfolios/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const portfolios = await storage.getUserPortfolios(userId);
      res.json(portfolios);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolios" });
    }
  });

  app.get("/api/portfolio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const portfolio = await storage.getPortfolio(id);
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio" });
    }
  });

  app.post("/api/portfolio", async (req, res) => {
    try {
      const validatedData = insertPortfolioSchema.parse(req.body);
      const portfolio = await storage.createPortfolio(validatedData);
      res.json(portfolio);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid portfolio data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create portfolio" });
    }
  });

  // Stock routes
  app.get("/api/stocks", async (req, res) => {
    try {
      const stocks = await storage.getAllStocks();
      res.json(stocks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stocks" });
    }
  });

  app.get("/api/stocks/:symbol", async (req, res) => {
    try {
      const symbol = req.params.symbol;
      const stock = await storage.getStockBySymbol(symbol);
      if (!stock) {
        return res.status(404).json({ message: "Stock not found" });
      }
      res.json(stock);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock" });
    }
  });

  // Portfolio holdings routes
  app.get("/api/portfolio/:id/holdings", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const holdings = await storage.getPortfolioHoldings(portfolioId);
      res.json(holdings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch portfolio holdings" });
    }
  });

  app.post("/api/portfolio/:id/holdings", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const validatedData = insertPortfolioHoldingSchema.parse({
        ...req.body,
        portfolioId
      });
      const holding = await storage.createPortfolioHolding(validatedData);
      res.json(holding);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid holding data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create portfolio holding" });
    }
  });

  // ML Model performance routes
  app.get("/api/ml-models/performance", async (req, res) => {
    try {
      const performance = await storage.getLatestModelPerformance();
      res.json(performance);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ML model performance" });
    }
  });

  // Risk metrics routes
  app.get("/api/portfolio/:id/risk-metrics", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const riskMetrics = await storage.getPortfolioRiskMetrics(portfolioId);
      if (!riskMetrics) {
        return res.status(404).json({ message: "Risk metrics not found" });
      }
      res.json(riskMetrics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch risk metrics" });
    }
  });

  // Portfolio optimization endpoint
  app.post("/api/optimize-portfolio", async (req, res) => {
    try {
      const validatedData = optimizePortfolioSchema.parse(req.body);
      
      // This would typically call Python ML services
      // For now, return optimized allocation based on risk tolerance
      const optimizedAllocation = generateOptimizedAllocation(validatedData);
      
      // Create new portfolio with optimized allocation
      const portfolio = await storage.createPortfolio({
        userId: validatedData.userId,
        name: `Optimized Portfolio - ${validatedData.algorithm}`,
        totalValue: validatedData.investmentAmount.toString(),
        expectedReturn: optimizedAllocation.expectedReturn.toString(),
        riskScore: optimizedAllocation.riskScore.toString(),
        sharpeRatio: optimizedAllocation.sharpeRatio.toString(),
        allocation: optimizedAllocation.allocation,
      });

      // Store optimization result
      await storage.createOptimizationResult({
        portfolioId: portfolio.id,
        algorithm: validatedData.algorithm,
        parameters: validatedData,
        results: optimizedAllocation,
      });

      res.json({ portfolio, optimization: optimizedAllocation });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid optimization request", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to optimize portfolio" });
    }
  });

  // Export portfolio to Excel
  app.get("/api/portfolio/:id/export", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const portfolio = await storage.getPortfolio(portfolioId);
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      const holdings = await storage.getPortfolioHoldings(portfolioId);
      const riskMetrics = await storage.getPortfolioRiskMetrics(portfolioId);

      // This would generate an Excel file
      // For now, return JSON data that could be exported
      const exportData = {
        portfolio,
        holdings,
        riskMetrics,
        exportDate: new Date().toISOString(),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=portfolio-${portfolioId}-export.json`);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ message: "Failed to export portfolio" });
    }
  });

  // User dashboard data
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const portfolios = await storage.getUserPortfolios(userId);
      const stocks = await storage.getAllStocks();
      const mlPerformance = await storage.getLatestModelPerformance();

      // Calculate aggregate metrics
      const totalValue = portfolios.reduce((sum, p) => sum + parseFloat(p.totalValue), 0);
      const avgReturn = portfolios.length > 0 
        ? portfolios.reduce((sum, p) => sum + parseFloat(p.expectedReturn), 0) / portfolios.length 
        : 0;
      const avgRiskScore = portfolios.length > 0
        ? portfolios.reduce((sum, p) => sum + parseFloat(p.riskScore), 0) / portfolios.length 
        : 0;
      const avgSharpeRatio = portfolios.length > 0
        ? portfolios.reduce((sum, p) => sum + parseFloat(p.sharpeRatio), 0) / portfolios.length 
        : 0;

      res.json({
        totalValue: totalValue.toFixed(2),
        expectedReturn: avgReturn.toFixed(1),
        riskScore: avgRiskScore.toFixed(1),
        sharpeRatio: avgSharpeRatio.toFixed(2),
        portfolios,
        topStocks: stocks.slice(0, 5),
        mlPerformance,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Real-time stock prices endpoint
  app.get("/api/stocks/prices", async (req, res) => {
    try {
      const stocks = await storage.getAllStocks();
      const priceData = stocks.map(stock => ({
        symbol: stock.symbol,
        price: stock.currentPrice,
        change: stock.change,
        changePercent: stock.changePercent,
        name: stock.name,
        timestamp: new Date().toISOString()
      }));
      
      res.json(priceData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stock prices" });
    }
  });

  // Real-time portfolio value endpoint
  app.get("/api/portfolio/:id/realtime", async (req, res) => {
    try {
      const portfolioId = parseInt(req.params.id);
      const portfolio = await storage.getPortfolio(portfolioId);
      
      if (!portfolio) {
        return res.status(404).json({ message: "Portfolio not found" });
      }

      const holdings = await storage.getPortfolioHoldings(portfolioId);
      let totalValue = 0;
      let totalDayChange = 0;
      
      const realTimeHoldings = [];
      
      for (const holding of holdings) {
        const stock = await storage.getStockBySymbol(holding.symbol);
        if (stock) {
          const quantity = parseFloat(holding.quantity);
          const currentPrice = parseFloat(stock.currentPrice);
          const currentValue = quantity * currentPrice;
          const dayChange = currentValue * (parseFloat(stock.changePercent) / 100);
          
          totalValue += currentValue;
          totalDayChange += dayChange;
          
          realTimeHoldings.push({
            ...holding,
            currentValue: currentValue.toFixed(2),
            currentPrice: stock.currentPrice,
            dayChange: stock.change,
            dayChangePercent: stock.changePercent
          });
        }
      }
      
      // Update portfolio total value
      if (totalValue > 0) {
        await storage.updatePortfolio(portfolioId, {
          totalValue: totalValue.toFixed(2)
        });
      }
      
      const dayChangePercent = totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0;
      
      res.json({
        portfolio: {
          ...portfolio,
          totalValue: totalValue.toFixed(2),
          dayChange: totalDayChange >= 0 ? `+${totalDayChange.toFixed(2)}` : totalDayChange.toFixed(2),
          dayChangePercent: dayChangePercent >= 0 ? `+${dayChangePercent.toFixed(2)}` : dayChangePercent.toFixed(2)
        },
        holdings: realTimeHoldings,
        lastUpdate: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch real-time portfolio data" });
    }
  });

  // Dashboard route with real-time calculations
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      // Get user's portfolios
      const portfolios = await storage.getUserPortfolios(userId);
      
      // Calculate real-time totals across all portfolios
      let totalValue = 0;
      let totalReturn = 0;
      let totalDayChange = 0;
      
      for (const portfolio of portfolios) {
        const holdings = await storage.getPortfolioHoldings(portfolio.id);
        let portfolioValue = 0;
        let portfolioDayChange = 0;
        
        for (const holding of holdings) {
          const stock = await storage.getStockBySymbol(holding.symbol);
          if (stock) {
            const currentValue = parseFloat(holding.quantity) * parseFloat(stock.currentPrice);
            const dayChange = currentValue * (parseFloat(stock.changePercent) / 100);
            
            portfolioValue += currentValue;
            portfolioDayChange += dayChange;
          }
        }
        
        // Update portfolio with real-time value
        if (portfolioValue > 0) {
          await storage.updatePortfolio(portfolio.id, {
            totalValue: portfolioValue.toFixed(2)
          });
        }
        
        totalValue += portfolioValue;
        totalDayChange += portfolioDayChange;
        totalReturn += parseFloat(portfolio.expectedReturn);
      }
      
      const averageReturn = portfolios.length > 0 ? totalReturn / portfolios.length : 0;
      const dayChangePercent = totalValue > 0 ? (totalDayChange / totalValue) * 100 : 0;

      const dashboardData = {
        totalValue: totalValue.toFixed(2),
        expectedReturn: averageReturn.toFixed(2),
        portfolioCount: portfolios.length,
        riskScore: "7.8",
        dayChange: totalDayChange >= 0 ? `+${totalDayChange.toFixed(2)}` : totalDayChange.toFixed(2),
        dayChangePercent: dayChangePercent >= 0 ? `+${dayChangePercent.toFixed(2)}` : dayChangePercent.toFixed(2),
        lastUpdate: new Date().toISOString()
      };

      res.json(dashboardData);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generateOptimizedAllocation(request: any) {
  // Simple optimization logic based on risk tolerance
  let stockAllocation, goldAllocation, cashAllocation;
  let expectedReturn, riskScore, sharpeRatio;

  switch (request.riskTolerance) {
    case "conservative":
      stockAllocation = 40;
      goldAllocation = 35;
      cashAllocation = 25;
      expectedReturn = 8.5;
      riskScore = 4.2;
      sharpeRatio = 1.2;
      break;
    case "moderate":
      stockAllocation = 65;
      goldAllocation = 25;
      cashAllocation = 10;
      expectedReturn = 12.8;
      riskScore = 6.8;
      sharpeRatio = 1.6;
      break;
    case "aggressive":
      stockAllocation = 85;
      goldAllocation = 10;
      cashAllocation = 5;
      expectedReturn = 16.5;
      riskScore = 8.9;
      sharpeRatio = 1.9;
      break;
    default:
      stockAllocation = 65;
      goldAllocation = 25;
      cashAllocation = 10;
      expectedReturn = 12.8;
      riskScore = 6.8;
      sharpeRatio = 1.6;
  }

  return {
    allocation: {
      stocks: stockAllocation,
      gold: goldAllocation,
      cash: cashAllocation,
    },
    expectedReturn,
    riskScore,
    sharpeRatio,
    algorithm: request.algorithm,
  };
}
