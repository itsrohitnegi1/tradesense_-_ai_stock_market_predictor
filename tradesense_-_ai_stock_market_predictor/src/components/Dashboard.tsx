import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SignOutButton } from "../SignOutButton";
import { StockList } from "./StockList";
import { Portfolio } from "./Portfolio";
import { Watchlist } from "./Watchlist";
import { TradeModal } from "./TradeModal";
import { PredictionModal } from "./PredictionModal";

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("stocks");
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);
  const [tradeType, setTradeType] = useState<"BUY" | "SELL">("BUY");

  const initializeStocks = useMutation(api.stocks.initializeStocks);
  const stocks = useQuery(api.stocks.getStocks);
  const portfolio = useQuery(api.stocks.getPortfolio);
  const watchlist = useQuery(api.stocks.getWatchlist);
  const user = useQuery(api.auth.loggedInUser);

  useEffect(() => {
    if (stocks?.length === 0) {
      initializeStocks();
    }
  }, [stocks, initializeStocks]);

  const totalPortfolioValue = portfolio?.reduce((sum, position) => sum + position.currentValue, 0) || 0;
  const totalPnL = portfolio?.reduce((sum, position) => sum + position.pnl, 0) || 0;
  const totalPnLPercent = totalPortfolioValue > 0 ? (totalPnL / (totalPortfolioValue - totalPnL)) * 100 : 0;

  const handleTrade = (stock: any, type: "BUY" | "SELL") => {
    setSelectedStock(stock);
    setTradeType(type);
    setShowTradeModal(true);
  };

  const handlePredict = (stock: any) => {
    setSelectedStock(stock);
    setShowPredictionModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-blue-600">AI Stock Predictor</h1>
            <nav className="flex space-x-6">
              <button
                onClick={() => setActiveTab("stocks")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "stocks"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Market
              </button>
              <button
                onClick={() => setActiveTab("portfolio")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "portfolio"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Portfolio
              </button>
              <button
                onClick={() => setActiveTab("watchlist")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "watchlist"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Watchlist
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Welcome back</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Portfolio Summary */}
      {activeTab === "portfolio" && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="grid grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold">₹{totalPortfolioValue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalPnL >= 0 ? "+" : ""}₹{totalPnL.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total P&L %</p>
              <p className={`text-2xl font-bold ${totalPnLPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                {totalPnLPercent >= 0 ? "+" : ""}{totalPnLPercent.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-6">
        {activeTab === "stocks" && (
          <StockList 
            stocks={stocks || []} 
            onTrade={handleTrade}
            onPredict={handlePredict}
          />
        )}
        {activeTab === "portfolio" && (
          <Portfolio 
            portfolio={portfolio || []} 
            onTrade={handleTrade}
          />
        )}
        {activeTab === "watchlist" && (
          <Watchlist 
            watchlist={watchlist || []} 
            onTrade={handleTrade}
            onPredict={handlePredict}
          />
        )}
      </main>

      {/* Modals */}
      {showTradeModal && selectedStock && (
        <TradeModal
          stock={selectedStock}
          type={tradeType}
          onClose={() => setShowTradeModal(false)}
        />
      )}

      {showPredictionModal && selectedStock && (
        <PredictionModal
          stock={selectedStock}
          onClose={() => setShowPredictionModal(false)}
        />
      )}
    </div>
  );
}
