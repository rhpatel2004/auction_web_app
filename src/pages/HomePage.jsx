// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import '../App.css';

function HomePage() {
    const { user, logout } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [startingBid, setStartingBid] = useState('');
    const [endDate, setEndDate] = useState('');
  	const [message, setMessage] = useState('');


     const [bidAmount, setBidAmount] = useState('');



    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await api.getProducts();
                setProducts(data);
            } catch (err) {
                setError(err.message || 'Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);



     const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            const productData = {
                name: productName,
                description: productDescription,
                startingBid: parseFloat(startingBid),
                endDate: new Date(endDate).toISOString(),
            };
             await api.addProduct(productData);
            // Optionally refetch products or update the list locally
             const data = await api.getProducts();
             setProducts(data);
             setProductName('');
             setProductDescription('');
             setStartingBid('');
             setEndDate('');
              setMessage('Product added successfully!');
        } catch (error) {
            setMessage("Failed to add product");
        }
    };


 const handleBidSubmit = async (productId,e) => {
    e.preventDefault();
    try {
      await api.placeBid(productId, bidAmount);
      // Refresh product list or update the specific product's bid info
       const data = await api.getProducts();
       setProducts(data);
       setBidAmount("")
    } catch (error) {
      console.error('Bid failed:', error);
      // Display error to the user
    }
  };


    const handleLogout = () => {
        logout();
        // Optionally redirect to login page
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="home-page">
            <header>
                <h1>Auction App</h1>
                {user ? (
                    <div>
                        <span>Welcome, {user.username} ({user.role})</span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                ) : (
                    <div>
                        <a href="/login">Login</a> | <a href="/register">Register</a>
                    </div>
                )}
            </header>

            <main>
                {user && user.role === 'seller' && (
                   <div className="add-product-form">
                        <h2>Add Product</h2>
                         {message && <p className="form-message">{message}</p>}
                        <form onSubmit={handleAddProduct}>
                            <div>
                                <label htmlFor="productName">Product Name:</label>
                                <input type="text" id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} required />
                            </div>
                            <div>
                                 <label htmlFor="productDescription">Description:</label>
                                 <textarea id="productDescription" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} required />
                             </div>
                             <div>
                                <label htmlFor="startingBid">Starting Bid:</label>
                                 <input type="number" id="startingBid" value={startingBid} onChange={(e) => setStartingBid(e.target.value)} required />
                            </div>
                            <div>
                                <label htmlFor="endDate">End Date:</label>
                                <input type="datetime-local" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required/>
                            </div>
                            <button type="submit">Add Product</button>
                        </form>
                    </div>
                )}

                 <h2>Available Products</h2>
                <div className="product-list">
                    {products.map((product) => (
                        <div key={product._id} className="product-item">
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p>Current Bid: ${product.currentBid}</p>
                            <p>
                                Bidder: {product.currentBidder ? product.currentBidder : "No bids yet"}
                            </p>
                            <p>Ends: {new Date(product.endDate).toLocaleString()}</p>
                             {user && user.role === 'user' && ( // Only show bid form to logged-in users
                                    <form onSubmit={(e) => handleBidSubmit(product._id, e)}>
                                        <input
                                           type="number"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(e.target.value)}
                                            placeholder="Enter your bid"
                                            required
                                        />
                                    <button type="submit">Place Bid</button>
                                </form>
                            )}
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}

export default HomePage;