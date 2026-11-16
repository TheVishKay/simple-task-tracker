import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'

async function requestTasks(path = '', method = 'GET', body) {
  const response = await fetch('/api/tasks' + path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  if (!response.ok) throw new Error('The task request failed.')
  return response.status === 204 ? undefined : response.json()
}

const filters = ['All', 'Open', 'Done']

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadTasks() {
    setLoading(true)
    setError('')
    try {
      setTasks(await requestTasks())
      setReady(true)
    } catch {
      setError('Could not load tasks. Check that Spring Boot is running.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  async function saveTask(action, failureMessage) {
    setSaving(true)
    setError('')
    try {
      await action()
    } catch {
      setError(failureMessage)
    } finally {
      setSaving(false)
    }
  }

  function addTask(event) {
    event.preventDefault()
    const submittedTitle = title
    if (!submittedTitle.trim() || saving) return

    saveTask(async () => {
      const task = await requestTasks('', 'POST', { title: submittedTitle.trim() })
      setTasks(current => [task, ...current])
      setTitle(current => current === submittedTitle ? '' : current)
      setFilter(current => current === 'Done' ? 'Open' : current)
    }, 'Could not add the task. Try again.')
  }

  function toggleTask(task) {
    saveTask(async () => {
      const updated = await requestTasks('/' + task.id, 'PATCH', { completed: !task.completed })
      setTasks(current => current.map(item => item.id === updated.id ? updated : item))
    }, 'Could not update the task. Try again.')
  }

  function deleteTask(id) {
    saveTask(async () => {
      await requestTasks('/' + id, 'DELETE')
      setTasks(current => current.filter(task => task.id !== id))
    }, 'Could not delete the task. Try again.')
  }

  const done = tasks.filter(task => task.completed).length
  const visibleTasks = tasks.filter(task => (
    filter === 'All' || task.completed === (filter === 'Done')
  ))

  return (
    <main className="page">
      <header className="intro">
        <h1>Task Tracker</h1>
        <p>Add tasks and check them off as you go.</p>
      </header>

      {ready && (
        <section className="progress" aria-label="Task progress">
          <span><strong>{done}</strong> of {tasks.length} completed</span>
          <progress aria-label="Completed tasks" value={done} max={tasks.length || 1} />
        </section>
      )}

      <section className="board" aria-label="Tasks">
        <form className="task-form" onSubmit={addTask}>
          <label htmlFor="task-title">New task</label>
          <div className="form-row">
            <input
              id="task-title"
              value={title}
              onChange={event => setTitle(event.target.value)}
              placeholder="e.g. Review the project README"
              maxLength={120}
              disabled={!ready}
              required
            />
            <button className="primary" disabled={!ready || saving || !title.trim()}>Add task</button>
          </div>
        </form>

        {error && <p className="error" role="alert">{error}</p>}
        {loading && <p className="empty" role="status">Loading tasks…</p>}
        {!ready && !loading && <button type="button" onClick={loadTasks}>Retry</button>}

        {ready && (
          <>
            <div className="filters" role="group" aria-label="Filter tasks">
              {filters.map(option => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={filter === option}
                  onClick={() => setFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            {visibleTasks.length === 0 ? (
              <p className="empty">
                {filter === 'All' ? 'No tasks yet. Add one above.' : 'No ' + (filter === 'Done' ? 'completed' : 'open') + ' tasks.'}
              </p>
            ) : (
              <ul className="task-list">
                {visibleTasks.map(task => (
                  <li key={task.id}>
                    <label className={task.completed ? 'complete' : undefined}>
                      <input type="checkbox" checked={task.completed} disabled={saving} onChange={() => toggleTask(task)} />
                      <span>{task.title}</span>
                    </label>
                    <button className="delete" aria-label={'Delete ' + task.title} disabled={saving} onClick={() => deleteTask(task.id)}>
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')).render(<App />)
