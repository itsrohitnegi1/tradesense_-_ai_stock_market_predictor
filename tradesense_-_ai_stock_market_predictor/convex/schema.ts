import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  stocks: defineTable({
    symbol: v.string(),
    name: v.string(),
    currentPrice: v.number(),
    previousClose: v.number(),
    change: v.number(),
    changePercent: v.number(),
    volume: v.number(),
    marketCap: v.number(),
    sector: v.string(),
    lastUpdated: v.number(),
  }).index("by_symbol", ["symbol"]),

  predictions: defineTable({
    stockSymbol: v.string(),
    currentPrice: v.number(),
    predictedPrice: v.number(),
    timeframe: v.string(), // "1d", "1w", "1m"
    confidence: v.number(),
    reasoning: v.string(),
    createdAt: v.number(),
  }).index("by_stock_and_timeframe", ["stockSymbol", "timeframe"]),

  portfolios: defineTable({
    userId: v.id("users"),
    stockSymbol: v.string(),
    quantity: v.number(),
    avgBuyPrice: v.number(),
    totalInvested: v.number(),
    currentValue: v.number(),
    pnl: v.number(),
    pnlPercent: v.number(),
  }).index("by_user", ["userId"]),

  watchlists: defineTable({
    userId: v.id("users"),
    stockSymbol: v.string(),
    addedAt: v.number(),
  }).index("by_user", ["userId"]),

  trades: defineTable({
    userId: v.id("users"),
    stockSymbol: v.string(),
    type: v.string(), // "BUY" or "SELL"
    quantity: v.number(),
    price: v.number(),
    total: v.number(),
    timestamp: v.number(),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
