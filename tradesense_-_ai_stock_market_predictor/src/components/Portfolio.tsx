interface PortfolioPosition {
  _id: string;
  stockSymbol: string;
  quantity: number;
  avgBuyPrice: number;
  totalInvested: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  stock: {
    symbol: string;
    name: string;
    currentPrice: number;
    sector: string;
  };
}

interface PortfolioProps {
  portfolio: PortfolioPosition[];
  onTrade: (stock: any, type: "BUY" | "SELL") => void;
}

export function Portfolio({ portfolio, onTrade }: PortfolioProps) {
  if (portfolio.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Your Portfolio</h2>
        <p className="text-gray-600">No positions yet. Start trading to build your portfolio!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold">Your Portfolio</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Invested
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                P&L
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {portfolio.map((position) => (
              <tr key={position._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{position.stock.symbol}</div>
                    <div className="text-sm text-gray-500">{position.stock.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {position.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{position.avgBuyPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{position.stock.currentPrice.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{position.totalInvested.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{position.currentValue.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    position.pnl >= 0 ? "text-green-600" : "text-red-600"
                  }`}>
                    {position.pnl >= 0 ? "+" : ""}₹{position.pnl.toFixed(2)}
                    <br />
                    <span className="text-xs">
                      ({position.pnl >= 0 ? "+" : ""}{position.pnlPercent.toFixed(2)}%)
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => onTrade(position.stock, "BUY")}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition-colors"
                  >
                    Buy More
                  </button>
                  <button
                    onClick={() => onTrade(position.stock, "SELL")}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Sell
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
