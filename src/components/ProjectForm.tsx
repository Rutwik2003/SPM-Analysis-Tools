import React, { useState } from 'react';
import { Wind, Sun, Plus, Minus, Calculator } from 'lucide-react';
import { calculateROI, calculateNPVDetailed, calculateProductivity, calculateIRR } from '../utils/calculations';
import toast from 'react-hot-toast';
import PERTCalculator from './PERTCalculator';
import PrecedenceNetwork from './PrecedenceNetwork';

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
  const [activeTab, setActiveTab] = useState<'renewable' | 'productivity' | 'pert' | 'precedence'>('renewable');
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
          productivity: results?.productivity || undefined,
        });

        toast.success('Renewable Energy calculations completed successfully!');
      } catch (error) {
        toast.error('Error performing renewable energy calculations. Please check your inputs.');
      }
    }

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
          solar: results?.solar || undefined,
          wind: results?.wind || undefined,
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
    <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-8">
      <div className="bg-white shadow-lg rounded-lg p-3 sm:p-6">
        <div className="mb-6 overflow-x-auto">
          <div className="flex flex-wrap sm:flex-nowrap justify-start sm:justify-center border-b min-w-max sm:min-w-0">
            <button
              type="button"
              className={`px-3 sm:px-6 py-2 text-sm sm:text-base whitespace-nowrap ${activeTab === 'renewable' ? 'text-purple-600 border-b-2 border-purple-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('renewable')}
            >
              Renewable Energy
            </button>
            <button
              type="button"
              className={`px-3 sm:px-6 py-2 text-sm sm:text-base whitespace-nowrap ${activeTab === 'productivity' ? 'text-purple-600 border-b-2 border-purple-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('productivity')}
            >
              Software Productivity
            </button>
            <button
              type="button"
              className={`px-3 sm:px-6 py-2 text-sm sm:text-base whitespace-nowrap ${activeTab === 'pert' ? 'text-purple-600 border-b-2 border-purple-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('pert')}
            >
              PERT Evaluation
            </button>
            <button
              type="button"
              className={`px-3 sm:px-6 py-2 text-sm sm:text-base whitespace-nowrap ${activeTab === 'precedence' ? 'text-purple-600 border-b-2 border-purple-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setActiveTab('precedence')}
            >
              Precedence Network
            </button>
          </div>
        </div>

        <form onSubmit={handleCalculate}>
          {activeTab === 'renewable' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                {/* Solar Project Column */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center">
                    <Sun className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-yellow-500" />
                    <h3 className="text-lg sm:text-xl font-semibold">Solar Project</h3>
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
                
                {/* Wind Project Column */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex items-center">
                    <Wind className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-500" />
                    <h3 className="text-lg sm:text-xl font-semibold">Wind Project</h3>
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
              
              {results?.solar && results?.wind && (
                <div className="mt-6 sm:mt-8 bg-gradient-to-br from-purple-50 to-pink-100 p-3 sm:p-6 rounded-lg">
                  <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Result Comparison</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto">
                    <div>
                      <h4 className="font-medium text-sm sm:text-base mb-2">Solar Project</h4>
                      <ul className="space-y-1 text-xs sm:text-sm">
                        <li>ROI: {results.solar.roi !== null ? results.solar.roi.toFixed(2) : 'N/A'}%</li>
                        <li>IRR: {results.solar.irr !== null ? results.solar.irr.toFixed(2) : 'N/A'}%</li>
                        <li>NPV (Low): ${results.solar.npvLow.npv !== null ? results.solar.npvLow.npv.toFixed(2) : 'N/A'}</li>
                        <li>NPV (High): ${results.solar.npvHigh.npv !== null ? results.solar.npvHigh.npv.toFixed(2) : 'N/A'}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm sm:text-base mb-2">Wind Project</h4>
                      <ul className="space-y-1 text-xs sm:text-sm">
                        <li>ROI: {results.wind.roi !== null ? results.wind.roi.toFixed(2) : 'N/A'}%</li>
                        <li>IRR: {results.wind.irr !== null ? results.wind.irr.toFixed(2) : 'N/A'}%</li>
                        <li>NPV (Low): ${results.wind.npvLow.npv !== null ? results.wind.npvLow.npv.toFixed(2) : 'N/A'}</li>
                        <li>NPV (High): ${results.wind.npvHigh.npv !== null ? results.wind.npvHigh.npv.toFixed(2) : 'N/A'}</li>
                      </ul>
                    </div>
                    {results.solar.npvLow.npv !== null && results.wind.npvLow.npv !== null && (
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <h4 className="font-medium text-sm sm:text-base mb-2">Recommendation</h4>
                        <p className="text-xs sm:text-sm">
                          {results.solar.npvLow.npv > results.wind.npvLow.npv
                            ? `Solar Project is preferred with higher NPV of $${results.solar.npvLow.npv.toFixed(2)}`
                            : `Wind Project is preferred with higher NPV of $${results.wind.npvLow.npv.toFixed(2)}`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'productivity' ? (
            <>
              <div className="space-y-4 sm:space-y-6">
                <h3 className="text-lg sm:text-xl font-semibold">Software Productivity Analysis</h3>
                <p className="text-gray-700 text-sm sm:text-base">Add projects to calculate and compare software productivity metrics.</p>
                
                <div className="space-y-4">
                  {productivityEntries.map((entry, index) => (
                    <div key={index} className="flex flex-wrap md:flex-nowrap gap-4 p-3 sm:p-4 border rounded-lg bg-gray-50">
                      <div className="w-full md:w-2/5">
                        <label className="block text-sm font-medium text-gray-700">Project Name</label>
                        <input
                          type="text"
                          value={entry.projectName}
                          onChange={(e) => handleProductivityChange(index, 'projectName', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="w-full md:w-1/5">
                        <label className="block text-sm font-medium text-gray-700">SLOC</label>
                        <input
                          type="number"
                          value={entry.sloc}
                          onChange={(e) => handleProductivityChange(index, 'sloc', e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          min="0"
                        />
                      </div>
                      <div className="w-full md:w-1/5">
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
                          disabled={productivityEntries.length <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addProductivityEntry}
                    className="flex items-center justify-center w-full py-2 mt-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                  </button>
                </div>

                {results?.productivity && (
                  <div className="mt-6 sm:mt-8 bg-gradient-to-br from-purple-50 to-pink-100 p-3 sm:p-6 rounded-lg">
                    <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Productivity Results</h3>
                    <div className="overflow-x-auto -mx-3 sm:mx-0">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700">Project</th>
                            <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700">SLOC</th>
                            <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700">Work-Months</th>
                            <th className="px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700">Productivity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {results.productivity.entries.map((entry, index) => (
                            <tr key={index} className="bg-white hover:bg-gray-50">
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{entry.projectName}</td>
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{entry.sloc}</td>
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{entry.workMonths}</td>
                              <td className="px-2 sm:px-4 py-2 text-xs sm:text-sm">{entry.productivity.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm">
                      <p className="font-medium">Total SLOC: {results.productivity.totalSloc}</p>
                      <p className="font-medium">Total Work-Months: {results.productivity.totalWorkMonths}</p>
                      <p className="font-medium">Overall Productivity: {results.productivity.overallProductivity.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : activeTab === 'pert' ? (
            <PERTCalculator />
          ) : (
            <PrecedenceNetwork />
          )}

          {activeTab === 'renewable' || activeTab === 'productivity' ? (
            <div className="mt-6 sm:mt-8 flex justify-center">
              <button
                type="submit"
                className="flex items-center px-6 sm:px-8 py-2 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                <Calculator className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                Calculate
              </button>
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}
