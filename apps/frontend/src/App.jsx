import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function App() {
    const [items, setItems] = useState([])
    const [newItem, setNewItem] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchItems = async () => {
        try {
            const response = await axios.get(`${API_URL}/items`)
            setItems(response.data)
            setLoading(false)
        } catch (error) {
            console.error('Error fetching items:', error)
            setLoading(false)
        }
    }

    const addItem = async (e) => {
        e.preventDefault()
        if (!newItem) return
        try {
            await axios.post(`${API_URL}/items`, { name: newItem })
            setNewItem('')
            fetchItems()
        } catch (error) {
            console.error('Error adding item:', error)
        }
    }

    useEffect(() => {
        fetchItems()
    }, [])

    return (
        <div className="container">
            <header>
                <h1>Demo Fullstack App</h1>
                <p>GKE Cluster Demo • Postgres • Docker</p>
            </header>

            <main>
                <form onSubmit={addItem} className="add-item-form">
                    <input
                        type="text"
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder="Enter item name..."
                    />
                    <button type="submit">Add Item</button>
                </form>

                <section className="items-list">
                    <h2>Items from Database</h2>
                    {loading ? (
                        <p>Loading items...</p>
                    ) : items.length === 0 ? (
                        <p className="empty-state">No items found. Add one above!</p>
                    ) : (
                        <ul>
                            {items.map((item) => (
                                <li key={item.id}>
                                    <span className="item-name">{item.name}</span>
                                    <span className="item-date">
                                        {new Date(item.created_at).toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>

            <footer>
                <div className="status-badge">
                    <span className="dot"></span> Backend: {API_URL}
                </div>
            </footer>
        </div>
    )
}

export default App
