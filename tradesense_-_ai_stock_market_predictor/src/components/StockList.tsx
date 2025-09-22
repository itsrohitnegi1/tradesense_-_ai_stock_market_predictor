import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface Stock {
  _id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  sector: string;
}

interface StockListProps {
  stocks: Stock[];
  onTrade: (stock: Stock, type: "BUY" | "SELL") => void;
  onPredict: (stock: Stock) => void;
}

export function StockList({ stocks, onTrade, onPredict }: StockListProps) {
  const addToWatchlist = useMutation(api.stocks.addToWatchlist);

  const handleAddToWatchlist = async (stockSymbol: string) => {
    try {
      await addToWatchlist({ stockSymbol });
      toast.success("Added to watchlist");
    } catch (error) {
      toast.error("Failed to add to watchlist");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Market Overview</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Change
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Volume
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sector
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {stocks.map((stock) => (
              <tr key={stock._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₹{stock.currentPrice.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    stock.change >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {stock.change >= 0 ? "+" : ""}₹{stock.change.toFixed(2)}
                    <br />
                    <span className="text-xs">
                      ({stock.change >= 0 ? "+" : ""}{stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stock.volume.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {stock.sector}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onTrade(stock, "BUY")}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    Buy
                  </button>
                  <button
                    onClick={() => onTrade(stock, "SELL")}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Sell
                  </button>
                  <button
                    onClick={() => onPredict(stock)}
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 transition-colors"
                  >
                    AI Predict
                  </button>
                  <button
                    onClick={() => handleAddToWatchlist(stock.symbol)}
                    className="bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700 transition-colors"
                  >
                    Watch
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
