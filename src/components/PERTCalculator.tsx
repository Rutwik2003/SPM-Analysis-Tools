import React, { useState } from "react";

interface Task {
  id: number;
  name: string;
  optimistic: number;
  mostLikely: number;
  pessimistic: number;
  expectedTime: number;
}

const PERTCalculator: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [optimistic, setOptimistic] = useState("");
  const [mostLikely, setMostLikely] = useState("");
  const [pessimistic, setPessimistic] = useState("");

  const addTask = () => {
    const opt = parseFloat(optimistic);
    const likely = parseFloat(mostLikely);
    const pess = parseFloat(pessimistic);

    if (!taskName || opt < 0 || likely < 0 || pess < 0 || isNaN(opt) || isNaN(likely) || isNaN(pess)) return;

    const expectedTime = (opt + 4 * likely + pess) / 6;
    const newTask: Task = {
      id: tasks.length + 1,
      name: taskName,
      optimistic: opt,
      mostLikely: likely,
      pessimistic: pess,
      expectedTime,
    };
    setTasks([...tasks, newTask]);
    resetInputs();
  };

  const resetInputs = () => {
    setTaskName("");
    setOptimistic("");
    setMostLikely("");
    setPessimistic("");
  };

  const clearTable = () => {
    setTasks([]);
    resetInputs();
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-teal-100 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">PERT Evaluation</h2>

      {/* Introductory Section */}
      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2">What is PERT?</h3>
        <p className="text-sm text-gray-700">
          The <strong>Program Evaluation and Review Technique (PERT)</strong> is a project management tool used to estimate the time required to complete a project. It accounts for uncertainty by using three time estimates for each task:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
          <li><strong>Optimistic Time (O):</strong> The shortest possible time to complete the task.</li>
          <li><strong>Most Likely Time (M):</strong> The best estimate of the time required under normal conditions.</li>
          <li><strong>Pessimistic Time (P):</strong> The longest possible time if everything goes wrong.</li>
        </ul>
        <p className="text-sm text-gray-700 mt-2">
          The <strong>Expected Time (ET)</strong> is calculated as: <code>(O + 4M + P) / 6</code>. This weighted average gives more emphasis to the most likely estimate, providing a realistic projection for planning and scheduling.
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Use PERT to identify critical tasks, manage risks, and optimize project timelines effectively.
        </p>
      </div>

      {/* Form Section */}
      <div className="space-y-4">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Task Name</label>
            <input
              type="text"
              placeholder="e.g., Design Phase"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Optimistic Time (days)</label>
            <input
              type="number"
              placeholder="e.g., 5"
              value={optimistic}
              onChange={(e) => setOptimistic(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Most Likely Time (days)</label>
            <input
              type="number"
              placeholder="e.g., 7"
              value={mostLikely}
              onChange={(e) => setMostLikely(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Pessimistic Time (days)</label>
            <input
              type="number"
              placeholder="e.g., 10"
              value={pessimistic}
              onChange={(e) => setPessimistic(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={addTask}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Task
          </button>
          <button
            onClick={resetInputs}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Clear Form
          </button>
        </div>
      </div>

      {/* Table Section */}
      {tasks.length > 0 && (
        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Task</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Optimistic (days)</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Most Likely (days)</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Pessimistic (days)</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Expected Time (days)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-4 py-2">{task.name}</td>
                    <td className="px-4 py-2">{task.optimistic}</td>
                    <td className="px-4 py-2">{task.mostLikely}</td>
                    <td className="px-4 py-2">{task.pessimistic}</td>
                    <td className="px-4 py-2 font-semibold">{task.expectedTime.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={clearTable}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Table
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PERTCalculator;