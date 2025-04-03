import React, { useState, useEffect, useRef } from "react";
import * as d3 from "d3";

interface Task {
  id: number;
  name: string;
  duration: number;
  dependencies: number[];
  earlyStart: number;
  earlyFinish: number;
  lateStart: number;
  lateFinish: number;
  slack: number;
}

const PrecedenceNetwork: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskName, setTaskName] = useState("");
  const [duration, setDuration] = useState("");
  const [dependencies, setDependencies] = useState("");
  const [criticalPath, setCriticalPath] = useState<number[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const addTask = () => {
    const dur = parseFloat(duration);
    const deps = dependencies
      .split(",")
      .map((d) => parseInt(d.trim()))
      .filter((d) => !isNaN(d) && tasks.some((t) => t.id === d));

    if (!taskName || dur <= 0 || isNaN(dur)) return;

    const newTask: Task = {
      id: tasks.length + 1,
      name: taskName,
      duration: dur,
      dependencies: deps,
      earlyStart: 0,
      earlyFinish: 0,
      lateStart: 0,
      lateFinish: 0,
      slack: 0,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    calculateNetwork(updatedTasks);
    resetInputs();
  };

  const resetInputs = () => {
    setTaskName("");
    setDuration("");
    setDependencies("");
  };

  const clearNetwork = () => {
    setTasks([]);
    setCriticalPath([]);
    resetInputs();
  };

  const calculateNetwork = (tasksToCalculate: Task[]) => {
    if (tasksToCalculate.length === 0) return;

    const updatedTasks = tasksToCalculate.map((task) => ({ ...task }));

    // Forward Pass
    updatedTasks.forEach((task) => {
      if (task.dependencies.length === 0) {
        task.earlyStart = 0;
        task.earlyFinish = task.duration;
      } else {
        const maxEarlyFinish = Math.max(
          ...task.dependencies.map((depId) => {
            const depTask = updatedTasks.find((t) => t.id === depId);
            return depTask ? depTask.earlyFinish : 0;
          })
        );
        task.earlyStart = maxEarlyFinish;
        task.earlyFinish = task.earlyStart + task.duration;
      }
    });

    // Backward Pass
    const maxEarlyFinish = Math.max(...updatedTasks.map((t) => t.earlyFinish));
    updatedTasks.forEach((task) => {
      const dependentTasks = updatedTasks.filter((t) =>
        t.dependencies.includes(task.id)
      );
      if (dependentTasks.length === 0) {
        task.lateFinish = maxEarlyFinish;
        task.lateStart = task.lateFinish - task.duration;
      } else {
        const minLateStart = Math.min(
          ...dependentTasks.map((t) => t.lateStart)
        );
        task.lateFinish = minLateStart;
        task.lateStart = task.lateFinish - task.duration;
      }
      task.slack = task.lateStart - task.earlyStart;
    });

    // Critical Path
    const critPath = updatedTasks.filter((t) => t.slack === 0).map((t) => t.id);
    setTasks(updatedTasks);
    setCriticalPath(critPath);
  };

  const addRandomData = () => {
    const taskNames = [
      "Design",
      "Development",
      "Testing",
      "Review",
      "Deployment",
      "Planning",
      "Analysis",
    ];
    const newTasks: Task[] = [];
    const numTasks = Math.floor(Math.random() * 5) + 3;

    for (let i = 1; i <= numTasks; i++) {
      const name = `${
        taskNames[Math.floor(Math.random() * taskNames.length)]
      } ${i}`;
      const duration = Math.floor(Math.random() * 10) + 1;
      let dependencies: number[] = [];
      if (i === 1) {
        dependencies = [];
      } else if (i <= 3) {
        dependencies = [i - 1];
      } else {
        const maxDepCount = Math.min(i - 1, Math.floor(Math.random() * 2) + 1);
        dependencies = Array.from({ length: maxDepCount }, () => {
          const depId = Math.floor(Math.random() * (i - 1)) + 1;
          return depId < i ? depId : i - 1;
        }).filter((dep, index, self) => self.indexOf(dep) === index);
      }

      newTasks.push({
        id: i,
        name,
        duration,
        dependencies,
        earlyStart: 0,
        earlyFinish: 0,
        lateStart: 0,
        lateFinish: 0,
        slack: 0,
      });
    }

    setTasks(newTasks);
    calculateNetwork(newTasks);
  };

  useEffect(() => {
    if (tasks.length === 0 || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const nodeWidth = 150;
    const nodeHeight = 100;
    const layerSpacing = 250;
    const verticalSpacing = 150;

    const nodes: Task[] = [
      {
        id: 0,
        name: "Start",
        duration: 0,
        earlyStart: 0,
        earlyFinish: 0,
        lateStart: 0,
        lateFinish: 0,
        slack: 0,
        dependencies: [],
      },
      ...tasks,
      {
        id: tasks.length + 1,
        name: "Finish",
        duration: 0,
        earlyStart: 0,
        earlyFinish: 0,
        lateStart: 0,
        lateFinish: 0,
        slack: 0,
        dependencies: [],
      },
    ];

    const maxEarlyFinish = Math.max(...tasks.map((t) => t.earlyFinish), 0);
    nodes[nodes.length - 1].earlyStart = maxEarlyFinish;
    nodes[nodes.length - 1].earlyFinish = maxEarlyFinish;
    nodes[nodes.length - 1].lateStart = maxEarlyFinish;
    nodes[nodes.length - 1].lateFinish = maxEarlyFinish;

    const links: { source: number; target: number }[] = [];
    tasks.forEach((task) => {
      if (task.dependencies.length === 0) {
        links.push({ source: 0, target: task.id });
      }
      const dependentTasks = tasks.filter((t) =>
        t.dependencies.includes(task.id)
      );
      if (dependentTasks.length === 0) {
        links.push({ source: task.id, target: tasks.length + 1 });
      }
      task.dependencies.forEach((depId) => {
        links.push({ source: depId, target: task.id });
      });
    });

    const nodeMap = new Map<number, number[]>();
    nodes.forEach((node) => nodeMap.set(node.id, []));
    links.forEach((link) => {
      const sourceDependents = nodeMap.get(link.source);
      if (sourceDependents) sourceDependents.push(link.target);
    });

    const indegree = new Map<number, number>();
    nodes.forEach((node) => indegree.set(node.id, 0));
    links.forEach((link) => {
      indegree.set(link.target, (indegree.get(link.target) || 0) + 1);
    });

    let remainingNodes = nodes.map((n) => n.id);
    const layers: number[][] = [];
    while (remainingNodes.length > 0) {
      const layer = remainingNodes.filter((id) => (indegree.get(id) || 0) === 0);
      if (layer.length === 0) break;
      layers.push(layer);
      remainingNodes = remainingNodes.filter((id) => !layer.includes(id));
      layer.forEach((id) => {
        nodeMap.get(id)!.forEach((depId) => {
          indegree.set(depId, (indegree.get(depId) || 0) - 1);
        });
      });
    };

    const totalWidth = layers.length * layerSpacing + nodeWidth * 2;
    const maxNodesInLayer = Math.max(...layers.map((layer) => layer.length), 1);
    const totalHeight = maxNodesInLayer * verticalSpacing + nodeHeight * 2;

    svg.attr("width", totalWidth).attr("height", totalHeight);

    const nodePositions = new Map<number, { x: number; y: number }>();
    layers.forEach((layer, layerIndex) => {
      const x = layerIndex * layerSpacing + nodeWidth;
      layer.forEach((nodeId, idx) => {
        const y = (totalHeight / (layer.length + 1)) * (idx + 1);
        nodePositions.set(nodeId, { x, y });
      });
    });

    const link = svg
      .append("g")
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("x1", (d) => nodePositions.get(d.source)!.x + nodeWidth / 2)
      .attr("y1", (d) => nodePositions.get(d.source)!.y)
      .attr("x2", (d) => nodePositions.get(d.target)!.x - nodeWidth / 2)
      .attr("y2", (d) => nodePositions.get(d.target)!.y)
      .attr("marker-end", "url(#arrow)");

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 5)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#999");

    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .enter()
      .append("g")
      .attr(
        "transform",
        (d) =>
          `translate(${
            nodePositions.get(d.id)!.x - nodeWidth / 2
          }, ${nodePositions.get(d.id)!.y - nodeHeight / 2})`
      );

    node
      .append("rect")
      .attr("width", nodeWidth)
      .attr("height", nodeHeight)
      .attr("fill", (d) =>
        d.id === 0 || d.id === nodes.length - 1
          ? "#d1e7dd"
          : criticalPath.includes(d.id)
          ? "#ffcccc"
          : "#e6f3ff"
      )
      .attr("stroke", "#333");

    node
      .append("line")
      .attr("x1", 0)
      .attr("y1", nodeHeight / 3)
      .attr("x2", nodeWidth)
      .attr("y2", nodeHeight / 3)
      .attr("stroke", "#333");

    node
      .append("line")
      .attr("x1", 0)
      .attr("y1", (2 * nodeHeight) / 3)
      .attr("x2", nodeWidth)
      .attr("y2", (2 * nodeHeight) / 3)
      .attr("stroke", "#333");

    node
      .append("line")
      .attr("x1", nodeWidth / 3)
      .attr("y1", 0)
      .attr("x2", nodeWidth / 3)
      .attr("y2", nodeHeight / 3)
      .attr("stroke", "#333");

    node
      .append("line")
      .attr("x1", (2 * nodeWidth) / 3)
      .attr("y1", 0)
      .attr("x2", (2 * nodeWidth) / 3)
      .attr("y2", nodeHeight / 3)
      .attr("stroke", "#333");

    node
      .append("line")
      .attr("x1", nodeWidth / 3)
      .attr("y1", (2 * nodeHeight) / 3)
      .attr("x2", nodeWidth / 3)
      .attr("y2", nodeHeight)
      .attr("stroke", "#333");

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", nodeWidth / 6)
      .attr("y", nodeHeight / 6)
      .attr("font-size", "12px")
      .text((d) => d.earlyStart);

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", nodeWidth / 2)
      .attr("y", nodeHeight / 6)
      .attr("font-size", "12px")
      .text((d) =>
        d.id === 0 || d.id === nodes.length - 1 ? "" : `${d.duration} weeks`
      );

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", (5 * nodeWidth) / 6)
      .attr("y", nodeHeight / 6)
      .attr("font-size", "12px")
      .text((d) => d.earlyFinish);

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", nodeWidth / 2)
      .attr("y", nodeHeight / 2)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text((d) => d.name);

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", nodeWidth / 6)
      .attr("y", (5 * nodeHeight) / 6)
      .attr("font-size", "12px")
      .text((d) => d.lateStart);

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", (5 * nodeWidth) / 6)
      .attr("y", (5 * nodeHeight) / 6)
      .attr("font-size", "12px")
      .text((d) => d.lateFinish);
  }, [tasks, criticalPath]);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-100 p-6 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Precedence Network</h2>
      <div className="mb-6 bg-white p-4 rounded-md shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          What is a Precedence Network?
        </h3>
        <p className="text-sm text-gray-700">
          A <strong>Precedence Network</strong> is a diagram that shows the
          sequence and dependencies between project tasks. It helps calculate:
        </p>
        <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
          <li>
            <strong>Forward Pass:</strong> Determines Early Start (ES) and Early
            Finish (EF) times.
          </li>
          <li>
            <strong>Backward Pass:</strong> Determines Late Start (LS) and Late
            Finish (LF) times.
          </li>
          <li>
            <strong>Critical Path:</strong> The longest path where slack = 0,
            indicating tasks that cannot be delayed.
          </li>
        </ul>
        <p className="text-sm text-gray-700 mt-2">
          Enter tasks manually or use "Add Random Data" to quickly generate a
          sample network.
        </p>
      </div>
      <div className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Task Name
            </label>
            <input
              type="text"
              placeholder="e.g., Task A"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (weeks)
            </label>
            <input
              type="number"
              placeholder="e.g., 7"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Dependencies (Task IDs)
            </label>
            <input
              type="text"
              placeholder="e.g., 1, 2"
              value={dependencies}
              onChange={(e) => setDependencies(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          <button
            onClick={addRandomData}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Add Random Data
          </button>
          <button
            onClick={() => calculateNetwork(tasks)}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Calculate Network
          </button>
        </div>
      </div>
      {tasks.length > 0 && (
        <div className="mt-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    ID
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Task
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Duration
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Dependencies
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    ES
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    EF
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    LS
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    LF
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Slack
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className={criticalPath.includes(task.id) ? "bg-red-100" : ""}
                  >
                    <td className="px-4 py-2">{task.id}</td>
                    <td className="px-4 py-2">{task.name}</td>
                    <td className="px-4 py-2">{task.duration}</td>
                    <td className="px-4 py-2">
                      {task.dependencies.join(", ") || "-"}
                    </td>
                    <td className="px-4 py-2">{task.earlyStart}</td>
                    <td className="px-4 py-2">{task.earlyFinish}</td>
                    <td className="px-4 py-2">{task.lateStart}</td>
                    <td className="px-4 py-2">{task.lateFinish}</td>
                    <td className="px-4 py-2">{task.slack}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {criticalPath.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-medium text-gray-900">
                Critical Path
              </h3>
              <p className="text-sm text-gray-700">
                Tasks:{" "}
                {criticalPath
                  .map((id) => tasks.find((t) => t.id === id)?.name)
                  .join(" -> ")}
              </p>
              <p className="text-sm text-gray-700">
                Total Duration:{" "}
                {tasks
                  .filter((t) => criticalPath.includes(t.id))
                  .reduce((sum, t) => sum + t.duration, 0)}{" "}
                weeks
              </p>
            </div>
          )}
          {/* <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900">
              Network Diagram (Text-Based)
            </h3>
            <pre className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
              {tasks
                .map((task) => {
                  const deps = task.dependencies
                    .map((d) => tasks.find((t) => t.id === d)?.name || d)
                    .join(", ");
                  return `${task Understoodame} (${tasks.duration}w) [ES:${tasks.earlyStart}, EF:${tasks.earlyFinish}]` +
                    (deps ? ` <- ${deps}` : "") +
                    `\n`;
                })
                .join("")}
            </pre>
          </div> */}
          <div className="mt-4">
            <h3 className="text-lg font-medium text-gray-900">
              Network Diagram (Graphical)
            </h3>
            <div
              className="border border-gray-300 rounded-md overflow-auto"
              style={{ maxWidth: "100%", maxHeight: "500px" }}
            >
              <svg ref={svgRef}></svg>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={clearNetwork}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Network
            </button>
          </div>
        </div>
      )}
    </div>
  )};

export default PrecedenceNetwork;