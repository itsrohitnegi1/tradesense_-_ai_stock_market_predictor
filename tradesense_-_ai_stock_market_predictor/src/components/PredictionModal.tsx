import { useState } from "react";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface PredictionModalProps {
  stock: {
    symbol: string;
    name: string;
    currentPrice: number;
  };
  onClose: () => void;
}

export function PredictionModal({ stock, onClose }: PredictionModalProps) {
  const [timeframe, setTimeframe] = useState("1d");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);

  const generatePrediction = useAction(api.stocks.generatePrediction);
  const existingPredictions = useQuery(api.stocks.getPredictions, { stockSymbol: stock.symbol });

  const handleGeneratePrediction = async () => {
    setLoading(true);
    try {
      const result = await generatePrediction({
        stockSymbol: stock.symbol,
        timeframe,
      });
      setPrediction(result);
      toast.success("AI prediction generated!");
    } catch (error) {
      toast.error("Failed to generate prediction");
    } finally {
      setLoading(false);
    }
  };

  const getTimeframeLabel = (tf: string) => {
    switch (tf) {
      case "1d": return "1 Day";
      case "1w": return "1 Week";
      case "1m": return "1 Month";
      default: return tf;
    }
  };

  const getPredictionColor = (current: number, predicted: number) => {
    return predicted > current ? "text-green-600" : "text-red-600";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            AI Predictions for {stock.symbol}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600">{stock.name}</p>
          <p className="text-lg font-medium">Current Price: ₹{stock.currentPrice}</p>
        </div>

        {/* Generate New Prediction */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-3">Generate New Prediction</h3>
          <div className="flex items-center space-x-4">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
            </select>
            <button
              onClick={handleGeneratePrediction}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate AI Prediction"}
            </button>
          </div>
        </div>

        {/* Latest Prediction Result */}
        {prediction && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="text-lg font-medium mb-3 text-blue-800">Latest Prediction</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Timeframe</p>
                <p className="font-medium">{getTimeframeLabel(timeframe)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Predicted Price</p>
                <p className={`font-bold text-lg ${getPredictionColor(stock.currentPrice, prediction.predictedPrice)}`}>
                  ₹{prediction.predictedPrice.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Confidence</p>
                <p className="font-medium">{prediction.confidence}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Expected Change</p>
                <p className={`font-medium ${getPredictionColor(stock.currentPrice, prediction.predictedPrice)}`}>
                  {((prediction.predictedPrice - stock.currentPrice) / stock.currentPrice * 100).toFixed(2)}%
                </p>
              </div>
            </div>
            <div className="mt-3">
              <p className="text-sm text-gray-600">AI Reasoning</p>
              <p className="text-sm mt-1">{prediction.reasoning}</p>
            </div>
          </div>
        )}

        {/* Historical Predictions */}
        {existingPredictions && existingPredictions.length > 0 && (
          <div>
            <h3 className="text-lg font-medium mb-3">Previous Predictions</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {existingPredictions.map((pred) => (
                <div key={pred._id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-2">
                        <span className="text-sm font-medium">{getTimeframeLabel(pred.timeframe)}</span>
                        <span className={`font-medium ${getPredictionColor(pred.currentPrice, pred.predictedPrice)}`}>
                          ₹{pred.predictedPrice.toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-600">{pred.confidence}% confidence</span>
                      </div>
                      <p className="text-xs text-gray-600">{pred.reasoning}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(pred.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
