import React, { useState } from 'react';
import { Wind, Sun, Plus, Minus, Calculator } from 'lucide-react';
import { calculateROI, calculateNPVDetailed, calculateProductivity, calculateIRR } from '../utils/calculations';
import toast from 'react-hot-toast';

interface ProjectData {
  investment: number;
  annualCashflow: number;
  netProfit: number;
  duration: number;
  discountLow: number;
  discountHigh: number;
}

interface ProductivityEntry {
  projectName: string;
  sloc: number;
  workMonths: number;
}

interface Results {
  solar?: {
    roi: number | null;
    npvLow: { npv: number | null; yearlyData: [number, number, number][] };
    npvHigh: { npv: number | null; yearlyData: [number, number, number][] };
    irr: number | null;
  };
  wind?: {
    roi: number | null;
    npvLow: { npv: number | null; yearlyData: [number, number, number][] };
    npvHigh: { npv: number | null; yearlyData: [number, number, number][] };
    irr: number | null;
  };
  productivity?: {
    entries: { projectName: string; sloc: number; workMonths: number; productivity: number }[];
    totalSloc: number;
    totalWorkMonths: number;
    overallProductivity: number;
  };
}

export default function ProjectForm() {
  const [activeTab, setActiveTab] = useState<'renewable' | 'productivity'>('renewable');
  const [solarData, setSolarData] = useState<ProjectData>({
    investment: 0,
    annualCashflow: 0,
    netProfit: 0,
    duration: 0,
    discountLow: 0,
    discountHigh: 0,
  });
  const [windData, setWindData] = useState<ProjectData>({
    investment: 0,
    annualCashflow: 0,
    netProfit: 0,
    duration: 0,
    discountLow: 0,
    discountHigh: 0,
  });
  const [productivityEntries, setProductivityEntries] = useState<ProductivityEntry[]>([
    { projectName: '', sloc: 0, workMonths: 0 },
  ]);
  const [results, setResults] = useState<Results | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for Renewable Energy tab
    if (activeTab === 'renewable') {
      if (solarData.investment <= 0 || solarData.duration <= 0) {
        toast.error('Solar Project: Initial Investment and Duration must be greater than 0.');
        return;
      }
      if (windData.investment <= 0 || windData.duration <= 0) {
        toast.error('Wind Project: Initial Investment and Duration must be greater than 0.');
        return;
      }

      try {
        const solarResults = {
          roi: calculateROI(solarData.netProfit, solarData.investment, solarData.duration),
          npvLow: calculateNPVDetailed(solarData.investment, solarData.annualCashflow, solarData.discountLow, solarData.duration),
          npvHigh: calculateNPVDetailed(solarData.investment, solarData.annualCashflow, solarData.discountHigh, solarData.duration),
          irr: calculateIRR(solarData.investment, solarData.annualCashflow, solarData.duration),
        };

        const windResults = {
          roi: calculateROI(windData.netProfit, windData.investment, windData.duration),
          npvLow: calculateNPVDetailed(windData.investment, windData.annualCashflow, windData.discountLow, windData.duration),
          npvHigh: calculateNPVDetailed(windData.investment, windData.annualCashflow, windData.discountHigh, windData.duration),
          irr: calculateIRR(windData.investment, windData.annualCashflow, windData.duration),
        };

        setResults({
          solar: solarResults,
          wind: windResults,
          productivity: results?.productivity || undefined, // Preserve existing productivity results
        });

        toast.success('Renewable Energy calculations completed successfully!');
      } catch (error) {
        toast.error('Error performing renewable energy calculations. Please check your inputs.');
      }
    }

    // Validation for Productivity tab
    if (activeTab === 'productivity') {
      const hasInvalidEntry = productivityEntries.some(entry => !entry.projectName || entry.sloc <= 0 || entry.workMonths <= 0);
      if (hasInvalidEntry) {
        toast.error('Productivity: All projects must have a name, SLOC, and Work-Months greater than 0.');
        return;
      }

      try {
        const productivityResults = productivityEntries.map(entry => ({
          ...entry,
          productivity: calculateProductivity(entry.sloc, entry.workMonths),
        }));

        const totalSloc = productivityEntries.reduce((sum, entry) => sum + entry.sloc, 0);
        const totalWorkMonths = productivityEntries.reduce((sum, entry) => sum + entry.workMonths, 0);
        const overallProductivity = calculateProductivity(totalSloc, totalWorkMonths);

        setResults({
          solar: results?.solar || undefined, // Preserve existing solar results
          wind: results?.wind || undefined,   // Preserve existing wind results
          productivity: {
            entries: productivityResults,
            totalSloc,
            totalWorkMonths,
            overallProductivity,
          },
        });

        toast.success('Productivity calculations completed successfully!');
      } catch (error) {
        toast.error('Error performing productivity calculations. Please check your inputs.');
      }
    }
  };

  const addProductivityEntry = () => {
    setProductivityEntries([...productivityEntries, { projectName: '', sloc: 0, workMonths: 0 }]);
  };

  const removeProductivityEntry = (index: number) => {
    if (productivityEntries.length > 1) {
      setProductivityEntries(productivityEntries.filter((_, i) => i !== index));
    }
  };

  const handleSolarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSolarData(prev => ({
      ...prev,
      [name.replace('solar_', '')]: parseFloat(value) || 0,
    }));
  };

  const handleWindChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setWindData(prev => ({
      ...prev,
      [name.replace('wind_', '')]: parseFloat(value) || 0,
    }));
  };

  const handleProductivityChange = (index: number, field: keyof ProductivityEntry, value: string) => {
    const newEntries = [...productivityEntries];
    if (field === 'projectName') {
      newEntries[index][field] = value;
    } else {
      newEntries[index][field] = parseFloat(value) || 0;
    }
    setProductivityEntries(newEntries);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-6 md:p-8">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Renewable Energy & Productivity Analysis
          </h1>

          <div className="flex justify-center mb-8">
            <button
              className={`px-6 py-2 rounded-l-lg ${
                activeTab === 'renewable'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveTab('renewable')}
            >
              Renewable Energy
            </button>
            <button
              className={`px-6 py-2 rounded-r-lg ${
                activeTab === 'productivity'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
              onClick={() => setActiveTab('productivity')}
            >
              Productivity
            </button>
          </div>

          <form onSubmit={handleCalculate}>
            {activeTab === 'renewable' ? (
              <>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Solar Project Section */}
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <Sun className="w-6 h-6 text-yellow-600 mr-2" />
                      <h2 className="text-xl font-semibold">Solar Project</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Initial Investment ($)</label>
                        <input
                          type="number"
                          name="solar_investment"
                          value={solarData.investment}
                          onChange={handleSolarChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Annual Cash Flow ($)</label>
                        <input
                          type="number"
                          name="solar_annualCashflow"
                          value={solarData.annualCashflow}
                          onChange={handleSolarChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Net Profit ($)</label>
                        <input
                          type="number"
                          name="solar_netProfit"
                          value={solarData.netProfit}
                          onChange={handleSolarChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (years)</label>
                        <input
                          type="number"
                          name="solar_duration"
                          value={solarData.duration}
                          onChange={handleSolarChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Low Discount Rate (%)</label>
                        <input
                          type="number"
                          name="solar_discountLow"
                          value={solarData.discountLow}
                          onChange={handleSolarChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">High Discount Rate (%)</label>
                        <input
                          type="number"
                          name="solar_discountHigh"
                          value={solarData.discountHigh}
                          onChange={handleSolarChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Wind Project Section */}
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg">
                    <div className="flex items-center mb-4">
                      <Wind className="w-6 h-6 text-blue-600 mr-2" />
                      <h2 className="text-xl font-semibold">Wind Project</h2>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Initial Investment ($)</label>
                        <input
                          type="number"
                          name="wind_investment"
                          value={windData.investment}
                          onChange={handleWindChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Annual Cash Flow ($)</label>
                        <input
                          type="number"
                          name="wind_annualCashflow"
                          value={windData.annualCashflow}
                          onChange={handleWindChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Net Profit ($)</label>
                        <input
                          type="number"
                          name="wind_netProfit"
                          value={windData.netProfit}
                          onChange={handleWindChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Duration (years)</label>
                        <input
                          type="number"
                          name="wind_duration"
                          value={windData.duration}
                          onChange={handleWindChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Low Discount Rate (%)</label>
                        <input
                          type="number"
                          name="wind_discountLow"
                          value={windData.discountLow}
                          onChange={handleWindChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">High Discount Rate (%)</label>
                        <input
                          type="number"
                          name="wind_discountHigh"
                          value={windData.discountHigh}
                          onChange={handleWindChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Renewable Energy Results */}
                {results?.solar && results?.wind && (
                  <div className="mt-8 space-y-6">
                    {/* Solar Results */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-100 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4">Solar Project Results</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">ROI: {results.solar.roi !== null ? results.solar.roi.toFixed(2) : 'N/A'}%</p>
                          <p className="font-medium">IRR: {results.solar.irr !== null ? results.solar.irr.toFixed(2) : 'N/A'}%</p>
                        </div>
                        <div>
                          <p className="font-medium">NPV (Low): ${results.solar.npvLow.npv !== null ? results.solar.npvLow.npv.toFixed(2) : 'N/A'}</p>
                          <p className="font-medium">NPV (High): ${results.solar.npvHigh.npv !== null ? results.solar.npvHigh.npv.toFixed(2) : 'N/A'}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Yearly Breakdown (Low Discount)</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-2">Year</th>
                                <th className="px-4 py-2">Discount Factor</th>
                                <th className="px-4 py-2">Discounted Cash Flow</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.solar.npvLow.yearlyData.map(([year, factor, cashflow]: [number, number, number]) => (
                                <tr key={year}>
                                  <td className="px-4 py-2">{year}</td>
                                  <td className="px-4 py-2">{factor}</td>
                                  <td className="px-4 py-2">${cashflow}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Wind Results */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-6 rounded-lg">
                      <h3 className="text-xl font-semibold mb-4">Wind Project Results</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="font-medium">ROI: {results.wind.roi !== null ? results.wind.roi.toFixed(2) : 'N/A'}%</p>
                          <p className="font-medium">IRR: {results.wind.irr !== null ? results.wind.irr.toFixed(2) : 'N/A'}%</p>
                        </div>
                        <div>
                          <p className="font-medium">NPV (Low): ${results.wind.npvLow.npv !== null ? results.wind.npvLow.npv.toFixed(2) : 'N/A'}</p>
                          <p className="font-medium">NPV (High): ${results.wind.npvHigh.npv !== null ? results.wind.npvHigh.npv.toFixed(2) : 'N/A'}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Yearly Breakdown (Low Discount)</h4>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-4 py-2">Year</th>
                                <th className="px-4 py-2">Discount Factor</th>
                                <th className="px-4 py-2">Discounted Cash Flow</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.wind.npvLow.yearlyData.map(([year, factor, cashflow]: [number, number, number]) => (
                                <tr key={year}>
                                  <td className="px-4 py-2">{year}</td>
                                  <td className="px-4 py-2">{factor}</td>
                                  <td className="px-4 py-2">${cashflow}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Recommendation */}
                    {results.solar.npvLow.npv !== null && results.wind.npvLow.npv !== null && (
                      <div className="bg-blue-100 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-2">Recommendation</h3>
                        <p className="text-lg">
                          {results.solar.npvLow.npv > results.wind.npvLow.npv
                            ? `Select the Solar Project. It has a higher NPV of $${results.solar.npvLow.npv.toFixed(2)} at ${solarData.discountLow}%.`
                            : `Select the Wind Project. It has a higher NPV of $${results.wind.npvLow.npv.toFixed(2)} at ${windData.discountLow}%.`}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-lg">
                  <h2 className="text-xl font-semibold mb-4">Productivity Analysis</h2>
                  {productivityEntries.map((entry, index) => (
                    <div key={index} className="grid md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Project Name</label>
                        <input
                          type="text"
                          value={entry.projectName}
                          onChange={(e) => handleProductivityChange(index, 'projectName', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SLOC</label>
                        <input
                          type="number"
                          value={entry.sloc}
                          onChange={(e) => handleProductivityChange(index, 'sloc', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Work-Months</label>
                        <input
                          type="number"
                          value={entry.workMonths}
                          onChange={(e) => handleProductivityChange(index, 'workMonths', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() => removeProductivityEntry(index)}
                          className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addProductivityEntry}
                    className="flex items-center justify-center w-full py-2 mt-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </button>
                </div>

                {/* Productivity Results */}
                {results?.productivity && (
                  <div className="mt-8 bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">Productivity Results</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                          <tr>
                            <th className="px-4 py-2">Project</th>
                            <th className="px-4 py-2">SLOC</th>
                            <th className="px-4 py-2">Work-Months</th>
                            <th className="px-4 py-2">Productivity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.productivity.entries.map((entry, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2">{entry.projectName}</td>
                              <td className="px-4 py-2">{entry.sloc}</td>
                              <td className="px-4 py-2">{entry.workMonths}</td>
                              <td className="px-4 py-2">{entry.productivity.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 grid md:grid-cols-3 gap-4">
                      <p className="font-medium">Total SLOC: {results.productivity.totalSloc}</p>
                      <p className="font-medium">Total Work-Months: {results.productivity.totalWorkMonths}</p>
                      <p className="font-medium">Overall Productivity: {results.productivity.overallProductivity.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="mt-8 flex justify-center">
              <button
                type="submit"
                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Calculator className="w-5 h-5 mr-2" />
                Calculate
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}