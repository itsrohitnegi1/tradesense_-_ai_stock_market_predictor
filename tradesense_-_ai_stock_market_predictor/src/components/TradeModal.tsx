import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface TradeModalProps {
  stock: {
    symbol: string;
    name: string;
    currentPrice: number;
  };
  type: "BUY" | "SELL";
  onClose: () => void;
}

export function TradeModal({ stock, type, onClose }: TradeModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(stock.currentPrice);
  const [loading, setLoading] = useState(false);

  const simulateTrade = useMutation(api.stocks.simulateTrade);

  const total = quantity * price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await simulateTrade({
        stockSymbol: stock.symbol,
        type,
        quantity,
        price,
      });
      
      toast.success(`${type} order placed successfully!`);
      onClose();
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {type} {stock.symbol}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">{stock.name}</p>
          <p className="text-lg font-medium">Current Price: ₹{stock.currentPrice}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per share
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || stock.currentPrice)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span className="font-semibold">₹{total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 px-4 py-2 rounded-md text-white font-medium transition-colors ${
                type === "BUY"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              } disabled:opacity-50`}
            >
              {loading ? "Processing..." : `${type} ${quantity} shares`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
