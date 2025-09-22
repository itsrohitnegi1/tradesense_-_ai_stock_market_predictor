import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.CONVEX_OPENAI_BASE_URL,
  apiKey: process.env.CONVEX_OPENAI_API_KEY,
});

// Sample stock data - in production, this would come from a real API
const SAMPLE_STOCKS = [
  { symbol: "RELIANCE", name: "Reliance Industries Ltd", sector: "Energy", marketCap: 1500000 },
  { symbol: "TCS", name: "Tata Consultancy Services", sector: "IT", marketCap: 1200000 },
  { symbol: "HDFCBANK", name: "HDFC Bank Ltd", sector: "Banking", marketCap: 800000 },
  { symbol: "INFY", name: "Infosys Ltd", sector: "IT", marketCap: 700000 },
  { symbol: "HINDUNILVR", name: "Hindustan Unilever Ltd", sector: "FMCG", marketCap: 600000 },
  { symbol: "ICICIBANK", name: "ICICI Bank Ltd", sector: "Banking", marketCap: 550000 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel Ltd", sector: "Telecom", marketCap: 400000 },
  { symbol: "ITC", name: "ITC Ltd", sector: "FMCG", marketCap: 350000 },
];

export const initializeStocks = mutation({
  args: {},
  handler: async (ctx) => {
    const existingStocks = await ctx.db.query("stocks").collect();
    if (existingStocks.length > 0) return;

    for (const stock of SAMPLE_STOCKS) {
      const basePrice = Math.random() * 2000 + 100;
      const change = (Math.random() - 0.5) * 100;
      const changePercent = (change / basePrice) * 100;
      
      await ctx.db.insert("stocks", {
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: Math.round((basePrice + change) * 100) / 100,
        previousClose: Math.round(basePrice * 100) / 100,
        change: Math.round(change * 100) / 100,
        changePercent: Math.round(changePercent * 100) / 100,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        marketCap: stock.marketCap,
        sector: stock.sector,
        lastUpdated: Date.now(),
      });
    }
  },
});

export const getStocks = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("stocks").collect();
  },
});

export const getStock = query({
  args: { symbol: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("stocks")
      .withIndex("by_symbol", (q) => q.eq("symbol", args.symbol))
      .unique();
  },
});

export const generatePrediction = action({
  args: { 
    stockSymbol: v.string(),
    timeframe: v.string(),
  },
  handler: async (ctx, args) => {
    const stock = await ctx.runQuery(api.stocks.getStock, { symbol: args.stockSymbol });
    if (!stock) throw new Error("Stock not found");

    const prompt = `Analyze ${stock.name} (${stock.symbol}) stock:
Current Price: ₹${stock.currentPrice}
Previous Close: ₹${stock.previousClose}
Change: ${stock.change} (${stock.changePercent}%)
Sector: ${stock.sector}
Market Cap: ₹${stock.marketCap} Cr

Predict the stock price for ${args.timeframe} timeframe and provide:
1. Predicted price
2. Confidence level (0-100)
3. Brief reasoning (max 100 words)

Format your response as JSON:
{
  "predictedPrice": number,
  "confidence": number,
  "reasoning": "string"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No prediction generated");

    try {
      const prediction = JSON.parse(content);
      
      await ctx.runMutation(api.stocks.savePrediction, {
        stockSymbol: args.stockSymbol,
        currentPrice: stock.currentPrice,
        predictedPrice: prediction.predictedPrice,
        timeframe: args.timeframe,
        confidence: prediction.confidence,
        reasoning: prediction.reasoning,
      });

      return prediction;
    } catch (error) {
      throw new Error("Failed to parse AI prediction");
    }
  },
});

export const savePrediction = mutation({
  args: {
    stockSymbol: v.string(),
    currentPrice: v.number(),
    predictedPrice: v.number(),
    timeframe: v.string(),
    confidence: v.number(),
    reasoning: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("predictions", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getPredictions = query({
  args: { stockSymbol: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("predictions")
      .withIndex("by_stock_and_timeframe", (q) => q.eq("stockSymbol", args.stockSymbol))
      .order("desc")
      .take(10);
  },
});

export const addToWatchlist = mutation({
  args: { stockSymbol: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("watchlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("stockSymbol"), args.stockSymbol))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("watchlists", {
      userId,
      stockSymbol: args.stockSymbol,
      addedAt: Date.now(),
    });
  },
});

export const removeFromWatchlist = mutation({
  args: { stockSymbol: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const watchlistItem = await ctx.db
      .query("watchlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("stockSymbol"), args.stockSymbol))
      .unique();

    if (watchlistItem) {
      await ctx.db.delete(watchlistItem._id);
    }
  },
});

export const getWatchlist = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const watchlistItems = await ctx.db
      .query("watchlists")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const stocks = [];
    for (const item of watchlistItems) {
      const stock = await ctx.db
        .query("stocks")
        .withIndex("by_symbol", (q) => q.eq("symbol", item.stockSymbol))
        .unique();
      if (stock) stocks.push(stock);
    }

    return stocks;
  },
});

export const simulateTrade = mutation({
  args: {
    stockSymbol: v.string(),
    type: v.string(),
    quantity: v.number(),
    price: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const total = args.quantity * args.price;

    // Record the trade
    await ctx.db.insert("trades", {
      userId,
      stockSymbol: args.stockSymbol,
      type: args.type,
      quantity: args.quantity,
      price: args.price,
      total,
      timestamp: Date.now(),
    });

    // Update portfolio
    const existingPosition = await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("stockSymbol"), args.stockSymbol))
      .unique();

    if (args.type === "BUY") {
      if (existingPosition) {
        const newQuantity = existingPosition.quantity + args.quantity;
        const newTotalInvested = existingPosition.totalInvested + total;
        const newAvgPrice = newTotalInvested / newQuantity;

        await ctx.db.patch(existingPosition._id, {
          quantity: newQuantity,
          avgBuyPrice: newAvgPrice,
          totalInvested: newTotalInvested,
        });
      } else {
        await ctx.db.insert("portfolios", {
          userId,
          stockSymbol: args.stockSymbol,
          quantity: args.quantity,
          avgBuyPrice: args.price,
          totalInvested: total,
          currentValue: total,
          pnl: 0,
          pnlPercent: 0,
        });
      }
    } else if (args.type === "SELL" && existingPosition) {
      const newQuantity = Math.max(0, existingPosition.quantity - args.quantity);
      if (newQuantity === 0) {
        await ctx.db.delete(existingPosition._id);
      } else {
        await ctx.db.patch(existingPosition._id, {
          quantity: newQuantity,
        });
      }
    }

    return { success: true };
  },
});

export const getPortfolio = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const positions = await ctx.db
      .query("portfolios")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const portfolio = [];
    for (const position of positions) {
      const stock = await ctx.db
        .query("stocks")
        .withIndex("by_symbol", (q) => q.eq("symbol", position.stockSymbol))
        .unique();

      if (stock) {
        const currentValue = position.quantity * stock.currentPrice;
        const pnl = currentValue - position.totalInvested;
        const pnlPercent = (pnl / position.totalInvested) * 100;

        portfolio.push({
          ...position,
          stock,
          currentValue,
          pnl,
          pnlPercent,
        });
      }
    }

    return portfolio;
  },
});

export const getTrades = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("trades")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});
