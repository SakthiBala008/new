import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

interface Asset {
  id: string;
  symbol: string;
  allocation: number;
  type: 'stock' | 'gold' | 'cash';
}

export default function PortfolioBuilder() {
  const [portfolioName, setPortfolioName] = useState("");
  const [assets, setAssets] = useState<Asset[]>([
    { id: "1", symbol: "TCS", allocation: 25, type: "stock" },
    { id: "2", symbol: "RIL", allocation: 20, type: "stock" },
    { id: "3", symbol: "GOLD", allocation: 30, type: "gold" },
    { id: "4", symbol: "CASH", allocation: 25, type: "cash" },
  ]);

  const addAsset = () => {
    const newAsset: Asset = {
      id: Date.now().toString(),
      symbol: "",
      allocation: 0,
      type: "stock",
    };
    setAssets([...assets, newAsset]);
  };

  const removeAsset = (id: string) => {
    setAssets(assets.filter(asset => asset.id !== id));
  };

  const updateAsset = (id: string, field: keyof Asset, value: any) => {
    setAssets(assets.map(asset => 
      asset.id === id ? { ...asset, [field]: value } : asset
    ));
  };

  const totalAllocation = assets.reduce((sum, asset) => sum + asset.allocation, 0);

  return (
    <div>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Portfolio Builder</h2>
            <p className="text-slate-600">Create and customize your investment portfolio</p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="portfolio-name">Portfolio Name</Label>
              <Input
                id="portfolio-name"
                value={portfolioName}
                onChange={(e) => setPortfolioName(e.target.value)}
                placeholder="e.g., Growth Portfolio"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Asset Allocation
              <Button onClick={addAsset} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Asset
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {assets.map((asset) => (
                <div key={asset.id} className="flex items-center space-x-4 p-4 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm">Symbol</Label>
                    <Input
                      value={asset.symbol}
                      onChange={(e) => updateAsset(asset.id, 'symbol', e.target.value)}
                      placeholder="e.g., TCS"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm">Type</Label>
                    <Select 
                      value={asset.type} 
                      onValueChange={(value) => updateAsset(asset.id, 'type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stock">Stock</SelectItem>
                        <SelectItem value="gold">Gold</SelectItem>
                        <SelectItem value="cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Label className="text-sm">Allocation (%)</Label>
                    <Input
                      type="number"
                      value={asset.allocation}
                      onChange={(e) => updateAsset(asset.id, 'allocation', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => removeAsset(asset.id)}
                    className="mt-6"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Allocation:</span>
                <span className={`font-bold ${totalAllocation === 100 ? 'text-success-600' : 'text-danger-600'}`}>
                  {totalAllocation}%
                </span>
              </div>
              {totalAllocation !== 100 && (
                <p className="text-sm text-danger-600 mt-2">
                  Portfolio allocation must equal 100%
                </p>
              )}
            </div>

            <div className="flex space-x-4 mt-6">
              <Button 
                className="flex-1"
                disabled={totalAllocation !== 100 || !portfolioName}
              >
                Save Portfolio
              </Button>
              <Button variant="outline" className="flex-1">
                Preview Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
