import { 
  users, stocks, portfolios, portfolioHoldings, mlModelPerformance, 
  optimizationResults, riskMetrics,
  type User, type InsertUser, type Stock, type InsertStock,
  type Portfolio, type InsertPortfolio, type PortfolioHolding, type InsertPortfolioHolding,
  type MlModelPerformance, type InsertMlModelPerformance,
  type OptimizationResult, type InsertOptimizationResult,
  type RiskMetrics, type InsertRiskMetrics
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Stock operations
  getAllStocks(): Promise<Stock[]>;
  getStock(id: number): Promise<Stock | undefined>;
  getStockBySymbol(symbol: string): Promise<Stock | undefined>;
  createStock(stock: InsertStock): Promise<Stock>;
  updateStock(id: number, stock: Partial<InsertStock>): Promise<Stock>;

  // Portfolio operations
  getUserPortfolios(userId: number): Promise<Portfolio[]>;
  getPortfolio(id: number): Promise<Portfolio | undefined>;
  createPortfolio(portfolio: InsertPortfolio): Promise<Portfolio>;
  updatePortfolio(id: number, portfolio: Partial<InsertPortfolio>): Promise<Portfolio>;
  deletePortfolio(id: number): Promise<void>;

  // Portfolio holdings
  getPortfolioHoldings(portfolioId: number): Promise<PortfolioHolding[]>;
  createPortfolioHolding(holding: InsertPortfolioHolding): Promise<PortfolioHolding>;
  updatePortfolioHolding(id: number, holding: Partial<InsertPortfolioHolding>): Promise<PortfolioHolding>;
  deletePortfolioHoldings(portfolioId: number): Promise<void>;

  // ML Model performance
  getAllModelPerformance(): Promise<MlModelPerformance[]>;
  getLatestModelPerformance(): Promise<MlModelPerformance[]>;
  createModelPerformance(performance: InsertMlModelPerformance): Promise<MlModelPerformance>;

  // Optimization results
  getPortfolioOptimizations(portfolioId: number): Promise<OptimizationResult[]>;
  createOptimizationResult(result: InsertOptimizationResult): Promise<OptimizationResult>;

  // Risk metrics
  getPortfolioRiskMetrics(portfolioId: number): Promise<RiskMetrics | undefined>;
  createRiskMetrics(metrics: InsertRiskMetrics): Promise<RiskMetrics>;
  updateRiskMetrics(portfolioId: number, metrics: Partial<InsertRiskMetrics>): Promise<RiskMetrics>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private stocks: Map<number, Stock> = new Map();
  private portfolios: Map<number, Portfolio> = new Map();
  private portfolioHoldings: Map<number, PortfolioHolding> = new Map();
  private mlModelPerformance: Map<number, MlModelPerformance> = new Map();
  private optimizationResults: Map<number, OptimizationResult> = new Map();
  private riskMetrics: Map<number, RiskMetrics> = new Map();
  
  private currentUserId = 1;
  private currentStockId = 1;
  private currentPortfolioId = 1;
  private currentHoldingId = 1;
  private currentModelPerfId = 1;
  private currentOptResultId = 1;
  private currentRiskMetricId = 1;

  constructor() {
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample user
    const user: User = {
      id: 1,
      username: "john_investor",
      password: "hashed_password",
      riskTolerance: "moderate",
      createdAt: new Date(),
    };
    this.users.set(1, user);
    this.currentUserId = 2;

    // Sample stocks (Indian stocks)
    const sampleStocks: Stock[] = [
      { id: 1, symbol: "TCS", name: "Tata Consultancy Services", sector: "IT Services", currentPrice: "3245.00", change: "168.25", changePercent: "5.47", updatedAt: new Date() },
      { id: 2, symbol: "RIL", name: "Reliance Industries", sector: "Oil & Gas", currentPrice: "2456.75", change: "93.25", changePercent: "3.95", updatedAt: new Date() },
      { id: 3, symbol: "INFY", name: "Infosys Limited", sector: "IT Services", currentPrice: "1567.50", change: "32.75", changePercent: "2.13", updatedAt: new Date() },
      { id: 4, symbol: "HDFCBANK", name: "HDFC Bank Limited", sector: "Banking", currentPrice: "1623.45", change: "-12.30", changePercent: "-0.75", updatedAt: new Date() },
      { id: 5, symbol: "GOLD", name: "Gold ETF", sector: "Commodities", currentPrice: "5245.00", change: "45.25", changePercent: "0.87", updatedAt: new Date() },
    ];

    sampleStocks.forEach(stock => {
      this.stocks.set(stock.id, stock);
    });
    this.currentStockId = 6;

    // Sample ML model performance
    const modelPerformance: MlModelPerformance[] = [
      { id: 1, modelName: "XGBoost", accuracy: "94.20", mse: "0.000245", rSquared: "0.9542", trainingDate: new Date() },
      { id: 2, modelName: "LSTM", accuracy: "91.80", mse: "0.000389", rSquared: "0.9301", trainingDate: new Date() },
      { id: 3, modelName: "Random Forest", accuracy: "89.50", mse: "0.000456", rSquared: "0.9156", trainingDate: new Date() },
    ];

    modelPerformance.forEach(perf => {
      this.mlModelPerformance.set(perf.id, perf);
    });
    this.currentModelPerfId = 4;

    // Sample portfolio
    const portfolio: Portfolio = {
      id: 1,
      userId: 1,
      name: "Balanced Growth Portfolio",
      totalValue: "2456780.00",
      expectedReturn: "14.20",
      riskScore: "6.8",
      sharpeRatio: "1.85",
      allocation: { stocks: 65, gold: 25, cash: 10 },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.portfolios.set(1, portfolio);
    this.currentPortfolioId = 2;

    // Sample risk metrics
    const riskMetric: RiskMetrics = {
      id: 1,
      portfolioId: 1,
      var95: "-45230.00",
      beta: "1.12",
      maxDrawdown: "-8.50",
      volatility: "15.30",
      calculatedAt: new Date(),
    };
    this.riskMetrics.set(1, riskMetric);
    this.currentRiskMetricId = 2;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      riskTolerance: insertUser.riskTolerance || 'moderate'
    };
    this.users.set(id, user);
    return user;
  }

  // Stock operations
  async getAllStocks(): Promise<Stock[]> {
    return Array.from(this.stocks.values());
  }

  async getStock(id: number): Promise<Stock | undefined> {
    return this.stocks.get(id);
  }

  async getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    return Array.from(this.stocks.values()).find(stock => stock.symbol === symbol);
  }

  async createStock(insertStock: InsertStock): Promise<Stock> {
    const id = this.currentStockId++;
    const stock: Stock = { ...insertStock, id, updatedAt: new Date() };
    this.stocks.set(id, stock);
    return stock;
  }

  async updateStock(id: number, insertStock: Partial<InsertStock>): Promise<Stock> {
    const existing = this.stocks.get(id);
    if (!existing) throw new Error("Stock not found");
    const updated: Stock = { ...existing, ...insertStock, updatedAt: new Date() };
    this.stocks.set(id, updated);
    return updated;
  }

  // Portfolio operations
  async getUserPortfolios(userId: number): Promise<Portfolio[]> {
    return Array.from(this.portfolios.values()).filter(p => p.userId === userId);
  }

  async getPortfolio(id: number): Promise<Portfolio | undefined> {
    return this.portfolios.get(id);
  }

  async createPortfolio(insertPortfolio: InsertPortfolio): Promise<Portfolio> {
    const id = this.currentPortfolioId++;
    const now = new Date();
    const portfolio: Portfolio = { ...insertPortfolio, id, createdAt: now, updatedAt: now };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  async updatePortfolio(id: number, insertPortfolio: Partial<InsertPortfolio>): Promise<Portfolio> {
    const existing = this.portfolios.get(id);
    if (!existing) throw new Error("Portfolio not found");
    const updated: Portfolio = { ...existing, ...insertPortfolio, updatedAt: new Date() };
    this.portfolios.set(id, updated);
    return updated;
  }

  async deletePortfolio(id: number): Promise<void> {
    this.portfolios.delete(id);
    // Also delete related holdings
    Array.from(this.portfolioHoldings.entries())
      .filter(([_, holding]) => holding.portfolioId === id)
      .forEach(([holdingId, _]) => this.portfolioHoldings.delete(holdingId));
  }

  // Portfolio holdings
  async getPortfolioHoldings(portfolioId: number): Promise<PortfolioHolding[]> {
    return Array.from(this.portfolioHoldings.values()).filter(h => h.portfolioId === portfolioId);
  }

  async createPortfolioHolding(insertHolding: InsertPortfolioHolding): Promise<PortfolioHolding> {
    const id = this.currentHoldingId++;
    const holding: PortfolioHolding = { 
      ...insertHolding, 
      id,
      stockId: insertHolding.stockId || null
    };
    this.portfolioHoldings.set(id, holding);
    return holding;
  }

  async updatePortfolioHolding(id: number, insertHolding: Partial<InsertPortfolioHolding>): Promise<PortfolioHolding> {
    const existing = this.portfolioHoldings.get(id);
    if (!existing) throw new Error("Portfolio holding not found");
    const updated: PortfolioHolding = { ...existing, ...insertHolding };
    this.portfolioHoldings.set(id, updated);
    return updated;
  }

  async deletePortfolioHoldings(portfolioId: number): Promise<void> {
    Array.from(this.portfolioHoldings.entries())
      .filter(([_, holding]) => holding.portfolioId === portfolioId)
      .forEach(([id, _]) => this.portfolioHoldings.delete(id));
  }

  // ML Model performance
  async getAllModelPerformance(): Promise<MlModelPerformance[]> {
    return Array.from(this.mlModelPerformance.values());
  }

  async getLatestModelPerformance(): Promise<MlModelPerformance[]> {
    return Array.from(this.mlModelPerformance.values())
      .sort((a, b) => b.trainingDate.getTime() - a.trainingDate.getTime())
      .slice(0, 3);
  }

  async createModelPerformance(insertPerformance: InsertMlModelPerformance): Promise<MlModelPerformance> {
    const id = this.currentModelPerfId++;
    const performance: MlModelPerformance = { ...insertPerformance, id, trainingDate: new Date() };
    this.mlModelPerformance.set(id, performance);
    return performance;
  }

  // Optimization results
  async getPortfolioOptimizations(portfolioId: number): Promise<OptimizationResult[]> {
    return Array.from(this.optimizationResults.values()).filter(r => r.portfolioId === portfolioId);
  }

  async createOptimizationResult(insertResult: InsertOptimizationResult): Promise<OptimizationResult> {
    const id = this.currentOptResultId++;
    const result: OptimizationResult = { ...insertResult, id, createdAt: new Date() };
    this.optimizationResults.set(id, result);
    return result;
  }

  // Risk metrics
  async getPortfolioRiskMetrics(portfolioId: number): Promise<RiskMetrics | undefined> {
    return Array.from(this.riskMetrics.values()).find(r => r.portfolioId === portfolioId);
  }

  async createRiskMetrics(insertMetrics: InsertRiskMetrics): Promise<RiskMetrics> {
    const id = this.currentRiskMetricId++;
    const metrics: RiskMetrics = { ...insertMetrics, id, calculatedAt: new Date() };
    this.riskMetrics.set(id, metrics);
    return metrics;
  }

  async updateRiskMetrics(portfolioId: number, insertMetrics: Partial<InsertRiskMetrics>): Promise<RiskMetrics> {
    const existing = Array.from(this.riskMetrics.values()).find(r => r.portfolioId === portfolioId);
    if (!existing) throw new Error("Risk metrics not found");
    const updated: RiskMetrics = { ...existing, ...insertMetrics, calculatedAt: new Date() };
    this.riskMetrics.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
