import { pgTable, text, serial, integer, boolean, decimal, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  riskTolerance: text("risk_tolerance").notNull().default("moderate"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  change: decimal("change", { precision: 5, scale: 2 }).notNull(),
  changePercent: decimal("change_percent", { precision: 5, scale: 2 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolios = pgTable("portfolios", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  totalValue: decimal("total_value", { precision: 12, scale: 2 }).notNull(),
  expectedReturn: decimal("expected_return", { precision: 5, scale: 2 }).notNull(),
  riskScore: decimal("risk_score", { precision: 3, scale: 1 }).notNull(),
  sharpeRatio: decimal("sharpe_ratio", { precision: 4, scale: 2 }).notNull(),
  allocation: jsonb("allocation").notNull(), // JSON object with asset allocations
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const portfolioHoldings = pgTable("portfolio_holdings", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id).notNull(),
  stockId: integer("stock_id").references(() => stocks.id),
  assetType: text("asset_type").notNull(), // 'stock', 'gold', 'cash'
  symbol: text("symbol").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 4 }).notNull(),
  avgPrice: decimal("avg_price", { precision: 10, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }).notNull(),
  allocation: decimal("allocation", { precision: 5, scale: 2 }).notNull(), // percentage
});

export const mlModelPerformance = pgTable("ml_model_performance", {
  id: serial("id").primaryKey(),
  modelName: text("model_name").notNull(),
  accuracy: decimal("accuracy", { precision: 5, scale: 2 }).notNull(),
  mse: decimal("mse", { precision: 10, scale: 6 }).notNull(),
  rSquared: decimal("r_squared", { precision: 5, scale: 4 }).notNull(),
  trainingDate: timestamp("training_date").defaultNow().notNull(),
});

export const optimizationResults = pgTable("optimization_results", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id).notNull(),
  algorithm: text("algorithm").notNull(), // 'MPT', 'Black-Litterman'
  parameters: jsonb("parameters").notNull(),
  results: jsonb("results").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const riskMetrics = pgTable("risk_metrics", {
  id: serial("id").primaryKey(),
  portfolioId: integer("portfolio_id").references(() => portfolios.id).notNull(),
  var95: decimal("var_95", { precision: 12, scale: 2 }).notNull(), // Value at Risk
  beta: decimal("beta", { precision: 4, scale: 2 }).notNull(),
  maxDrawdown: decimal("max_drawdown", { precision: 5, scale: 2 }).notNull(),
  volatility: decimal("volatility", { precision: 5, scale: 2 }).notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStockSchema = createInsertSchema(stocks).omit({
  id: true,
  updatedAt: true,
});

export const insertPortfolioSchema = createInsertSchema(portfolios).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPortfolioHoldingSchema = createInsertSchema(portfolioHoldings).omit({
  id: true,
});

export const insertMlModelPerformanceSchema = createInsertSchema(mlModelPerformance).omit({
  id: true,
  trainingDate: true,
});

export const insertOptimizationResultSchema = createInsertSchema(optimizationResults).omit({
  id: true,
  createdAt: true,
});

export const insertRiskMetricsSchema = createInsertSchema(riskMetrics).omit({
  id: true,
  calculatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Stock = typeof stocks.$inferSelect;
export type InsertStock = z.infer<typeof insertStockSchema>;

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = z.infer<typeof insertPortfolioSchema>;

export type PortfolioHolding = typeof portfolioHoldings.$inferSelect;
export type InsertPortfolioHolding = z.infer<typeof insertPortfolioHoldingSchema>;

export type MlModelPerformance = typeof mlModelPerformance.$inferSelect;
export type InsertMlModelPerformance = z.infer<typeof insertMlModelPerformanceSchema>;

export type OptimizationResult = typeof optimizationResults.$inferSelect;
export type InsertOptimizationResult = z.infer<typeof insertOptimizationResultSchema>;

export type RiskMetrics = typeof riskMetrics.$inferSelect;
export type InsertRiskMetrics = z.infer<typeof insertRiskMetricsSchema>;

// Additional validation schemas
export const optimizePortfolioSchema = z.object({
  userId: z.number(),
  investmentAmount: z.number().min(1000),
  riskTolerance: z.enum(["conservative", "moderate", "aggressive"]),
  timeHorizon: z.enum(["1year", "3years", "5years", "10years"]),
  algorithm: z.enum(["MPT", "Black-Litterman"]),
});

export type OptimizePortfolioRequest = z.infer<typeof optimizePortfolioSchema>;
