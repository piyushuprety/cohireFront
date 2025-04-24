import { useState, useEffect, useCallback } from 'react';
import taskService from '../services/taskService';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [sheetUrl, setSheetUrl] = useState('');
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '' });
  const [editTask, setEditTask] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchTasks();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks(currentPage, searchTerm, statusFilter);
      setTasks(data.tasks);
      setTotalPages(data.totalPages);
      setTotalTasks(data.totalTasks);
    } catch (error) {
      setError('Failed to fetch tasks');
      console.error('Error fetching tasks:', error);
    }
  };

  const handleImport = async () => {
    try {
      const response = await taskService.importTasks(sheetUrl);
      setTasks([...tasks, ...response.tasks]);
      setSheetUrl('');
      window.location.reload()
    } catch (error) {
      setError('Failed to import tasks');
      console.error('Error importing tasks:', error);
    }
  };

  const handleAddTask = async () => {
    try {
      const task = await taskService.createTask(newTask);
      setTasks([...tasks, task]);
      setNewTask({ title: '', description: '', dueDate: '' });
    } catch (error) {
      setError('Failed to add task');
      console.error('Error adding task:', error);
    }
  };

  const handleEditTask = async () => {
    if (!editTask) return;
    try {
      const updatedTask = await taskService.updateTask(editTask._id, editTask);
      setTasks(tasks.map(task => task._id === editTask._id ? updatedTask : task));
      setEditTask(null);
      setShowEditModal(false);
    } catch (error) {
      setError('Failed to update task');
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      setError('Failed to delete task');
      console.error('Error deleting task:', error);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const updatedTask = await taskService.updateTask(task._id, {
        ...task,
        status: task.status === 'pending'? 'completed':'pending'
      });
      setTasks(tasks.map(t => t._id === task._id ? updatedTask : t));
    } catch (error) {
      setError('Failed to update task status');
      console.error('Error updating task:', error);
    }
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setError('')}
          >
            <span className="sr-only">Dismiss</span>
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Import Tasks from Google Sheets</h2>
        <div className="flex gap-4">
          <input
            type="text"
            className="flex-1 rounded-md border-gray-300 shadow-sm"
            placeholder="Google Sheets URL"
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
          />
          <button
            onClick={handleImport}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2"
          >
            Import
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Task</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Title"
            className="rounded-md border-gray-300 shadow-sm"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            className="rounded-md border-gray-300 shadow-sm"
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
          />
          <input
            type="date"
            className="rounded-md border-gray-300 shadow-sm"
            value={newTask.dueDate}
            onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
          />
          <button
            onClick={handleAddTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2"
          >
            Add Task
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search tasks..."
            className="rounded-md border-gray-300 shadow-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <select
            className="rounded-md border-gray-300 shadow-sm"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setCurrentPage(1);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={task.status === 'completed'}
                    onChange={() => handleToggleComplete(task)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className={`text-sm font-medium text-gray-900 ${task.status === 'completed' ? 'line-through' : ''}`}>
                    {task.title}
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-500">{task.description}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-500">
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditTask(task);
                      setShowEditModal(true);
                    }}
                    className="text-white bg-blue-600 hover:bg-blue-700 mr-4 px-3 py-1 rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{((currentPage - 1) * 5) + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * 5, totalTasks)}
                </span>{' '}
                of <span className="font-medium">{totalTasks}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px gap-[0.3rem]" aria-label="Pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => paginate(i + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === i + 1
                        ? 'z-10 bg-gray-100 text-gray-700'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={editTask?.title || ''}
                onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Description"
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={editTask?.description || ''}
                onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
              />
              <input
                type="date"
                className="w-full rounded-md border-gray-300 shadow-sm"
                value={editTask?.dueDate?.split('T')[0] || ''}
                onChange={(e) => setEditTask({ ...editTask, dueDate: e.target.value })}
              />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2"
              >
                Cancel
              </button>
              <button
                onClick={handleEditTask}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList; 