import React, { useState } from 'react';
import { Plus, X, Clock, CheckCircle } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  const addTask = () => {
    if (!newTaskTitle || !newTaskDueDate) return;

    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTaskTitle,
      dueDate: newTaskDueDate,
      completed: false,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setShowAddTask(false);
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getTimeRemaining = (dueDate: string) => {
    const now = new Date().getTime();
    const due = new Date(dueDate).getTime();
    const diff = due - now;

    if (diff <= 0) return 'Overdue';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTimeRemainingColor = (dueDate: string) => {
    const now = new Date().getTime();
    const due = new Date(dueDate).getTime();
    const diff = due - now;

    if (diff <= 0) return 'text-red-400';
    if (diff <= 24 * 60 * 60 * 1000) return 'text-yellow-400'; // 24 hours
    return 'text-emerald-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-100">Upcoming Tasks</h3>
        <button
          onClick={() => setShowAddTask(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {showAddTask && (
        <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={newTaskDueDate}
                onChange={(e) => setNewTaskDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddTask(false)}
                className="px-3 py-1.5 bg-gray-600 hover:bg-gray-500 text-gray-200 rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm transition-colors"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 bg-gray-700/30 rounded-lg border ${
                task.completed ? 'border-gray-600' : 'border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`mt-1 p-1 rounded-full border ${
                      task.completed
                        ? 'border-emerald-500 text-emerald-500'
                        : 'border-gray-500 text-gray-500 hover:border-gray-400 hover:text-gray-400'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <div className="space-y-1">
                    <p className={`text-sm font-medium ${
                      task.completed ? 'text-gray-400 line-through' : 'text-gray-100'
                    }`}>
                      {task.title}
                    </p>
                    <div className="flex items-center gap-2 text-xs">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span className={getTimeRemainingColor(task.dueDate)}>
                        {getTimeRemaining(task.dueDate)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No upcoming tasks.</p>
        </div>
      )}
    </div>
  );
}