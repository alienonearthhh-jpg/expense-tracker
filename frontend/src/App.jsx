import { useState, useEffect } from "react"
import axios from "axios"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"

const API = "http://localhost:8000"
const CATEGORIES = ["Food", "Transport", "Shopping", "Health", "Entertainment", "Bills", "Other"]
const COLORS = ["#667eea","#f6ad55","#68d391","#fc8181","#76e4f7","#b794f4","#fbb6ce"]

const emptyForm = { title: "", category: "Food", amount: "", date: "", description: "" }

export default function App() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [filterCategory, setFilterCategory] = useState("All")
  const [error, setError] = useState("")

  useEffect(() => { fetchExpenses() }, [])

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`${API}/expenses`)
      setExpenses(res.data)
    } catch {
      setError("Could not connect to server.")
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.amount || !form.date) return setError("Please fill in all required fields.")
    try {
      await axios.post(`${API}/expenses`, { ...form, amount: parseFloat(form.amount) })
      setForm(emptyForm)
      setError("")
      fetchExpenses()
    } catch { setError("Failed to add expense.") }
  }

  const handleEdit = (exp) => {
    setForm({ ...exp })
    setEditingId(exp.id)
    setShowModal(true)
  }

  const handleUpdate = async () => {
    try {
      await axios.put(`${API}/expenses/${editingId}`, { ...form, amount: parseFloat(form.amount) })
      setShowModal(false)
      setEditingId(null)
      setForm(emptyForm)
      fetchExpenses()
    } catch { setError("Failed to update.") }
  }

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/expenses/${id}`)
      fetchExpenses()
    } catch { setError("Failed to delete.") }
  }

  const filtered = filterCategory === "All" ? expenses : expenses.filter(e => e.category === filterCategory)

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  const chartData = CATEGORIES.map(cat => ({
    name: cat,
    amount: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
  })).filter(d => d.amount > 0)

  return (
    <div className="app">
      <h1>💸 Expense Tracker</h1>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card">
          <h3>Total Spent</h3>
          <p>${total.toFixed(2)}</p>
        </div>
        <div className="card">
          <h3>Expenses</h3>
          <p>{expenses.length}</p>
        </div>
        {CATEGORIES.map(cat => {
          const amt = expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0)
          return amt > 0 ? (
            <div className="card" key={cat}>
              <h3>{cat}</h3>
              <p>${amt.toFixed(2)}</p>
            </div>
          ) : null
        })}
      </div>

      {/* Add Expense Form */}
      <div className="form-section">
        <h2>Add Expense</h2>
        {error && <p style={{color:"#e53e3e", marginBottom:"0.8rem", fontSize:"0.85rem"}}>{error}</p>}
        <div className="form-grid">
          <input placeholder="Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
          <input type="number" placeholder="Amount *" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
          <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
          <textarea className="full" placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} style={{padding:"0.6rem 0.8rem", border:"1px solid #e2e8f0", borderRadius:"8px", resize:"none"}} />
        </div>
        <button className="btn btn-primary" style={{marginTop:"1rem"}} onClick={handleSubmit}>+ Add Expense</button>
      </div>

      {/* Filters */}
      <div className="filters">
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Expense List */}
      <div className="expense-list">
        {filtered.length === 0 && <p style={{color:"#a0aec0", textAlign:"center", padding:"2rem"}}>No expenses yet. Add one above!</p>}
        {filtered.map(exp => (
          <div className="expense-item" key={exp.id}>
            <div className="expense-info">
              <h4>{exp.title}</h4>
              <span>{exp.date} · {exp.description || "No description"}</span>
            </div>
            <span className="badge">{exp.category}</span>
            <span className="expense-amount">${exp.amount.toFixed(2)}</span>
            <button className="btn btn-secondary" onClick={() => handleEdit(exp)}>Edit</button>
            <button className="btn btn-danger" onClick={() => handleDelete(exp.id)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="chart-section">
          <h2>Spending by Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{fontSize:12}} />
              <YAxis tick={{fontSize:12}} />
              <Tooltip formatter={(v) => `$${v.toFixed(2)}`} />
              <Bar dataKey="amount" radius={[6,6,0,0]}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Expense</h2>
            <div className="form-grid">
              <input placeholder="Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Amount" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
              <textarea className="full" placeholder="Description" value={form.description || ""} onChange={e => setForm({...form, description: e.target.value})} rows={2} style={{padding:"0.6rem 0.8rem", border:"1px solid #e2e8f0", borderRadius:"8px", resize:"none"}} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}