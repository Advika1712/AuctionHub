
import { useState } from 'react';
import './App.css';

const initialProducts = [
  {
    id: 1,
    name: 'Premium Laptop',
    price: 40000,
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
    category: 'Electronics'
  },
  {
    id: 2,
    name: 'Smartphone',
    price: 20000,
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
    category: 'Electronics'
  },
  {
    id: 3,
    name: 'Smart Watch',
    price: 5000,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
    category: 'Accessories'
  }
];

// Safely read data from Local Storage
function readStorage(key, fallback) {
  try {
    const savedData = localStorage.getItem(key);
    return savedData ? JSON.parse(savedData) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [page, setPage] = useState('home');
  const [adminEmail, setAdminEmail] = useState('');
const [adminPassword, setAdminPassword] = useState('');
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');

  const [users, setUsers] = useState(() =>
    readStorage('auctionUsers', [])
  );

  const [bids, setBids] = useState(() =>
  readStorage('auctionBids', [])
);

const [notifications, setNotifications] = useState(() =>
  readStorage('auctionNotifications', [])
);

  const [products, setProducts] = useState(() =>
    readStorage('auctionProducts', initialProducts)
  );

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [message, setMessage] = useState('');

  const loggedInUser = localStorage.getItem('loggedInUser') || '';

  function openPage(nextPage) {
    setPage(nextPage);
    setMessage('');
    setSelectedProduct(null);
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  // USER SIGNUP
  function handleSignup(e) {
    e.preventDefault();

    const existingUser = users.find(
      user => user.email.toLowerCase() === form.email.trim().toLowerCase()
    );

    if (existingUser) {
      setMessage('Email already registered. Please login.');
      return;
    }

    const newUser = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password
    };

    const updatedUsers = [...users, newUser];

    localStorage.setItem('auctionUsers', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);

    setForm({
      name: '',
      email: '',
      password: ''
    });

    setMessage('Registration successful! Please login.');
    setPage('login');
  }

  // USER LOGIN
  function handleLogin(e) {
    e.preventDefault();

    const foundUser = users.find(
      user =>
        user.email.toLowerCase() === form.email.trim().toLowerCase() &&
        user.password === form.password
    );

    if (foundUser) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loggedInUser', foundUser.name);

      setForm({
        name: '',
        email: '',
        password: ''
      });

      setMessage('');
      setPage('dashboard');
    } else {
      setMessage('Invalid email or password. Please sign up first.');
    }
  }
// ADMIN LOGIN
function handleAdminLogin(e) {
  e.preventDefault();

  if (
    adminEmail === 'jahnavisudhakanneganti@gmail.com' &&
    adminPassword === '12345'
  ) {
    localStorage.setItem('isAdminLoggedIn', 'true');
    setAdminEmail('');
    setAdminPassword('');
    setMessage('');
    setPage('adminDashboard');
  } else {
    setMessage('Invalid admin email or password.');
  }
}
// ADD PRODUCT
function handleAddProduct(e) {
  e.preventDefault();

  if (!newProductName.trim() || Number(newProductPrice) <= 0) {
    setMessage('Please enter a valid product name and price.');
    return;
  }

  const newProduct = {
    id: Date.now(),
    name: newProductName.trim(),
    price: Number(newProductPrice),
   image: newProductName.toLowerCase().includes('bluetooth')
  ? 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600'
  : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
    category: 'General'
  };

  const updatedProducts = [...products, newProduct];

  localStorage.setItem('auctionProducts', JSON.stringify(updatedProducts));
  setProducts(updatedProducts);
const updatedNotifications = [
  ...notifications,
  {
    id: Date.now(),
    text: `${newProduct.name} has been added to the auctions.`
  }
];

localStorage.setItem(
  'auctionNotifications',
  JSON.stringify(updatedNotifications)
);

setNotifications(updatedNotifications);
  setNewProductName('');
  setNewProductPrice('');
  setMessage('Product added successfully!');
}
// DELETE PRODUCT
function handleDeleteProduct(productId) {
  const updatedProducts = products.filter(
    product => product.id !== productId
  );

  localStorage.setItem('auctionProducts', JSON.stringify(updatedProducts));
  setProducts(updatedProducts);
  const deletedProduct = products.find(
  product => product.id === productId
);

const updatedNotifications = [
  ...notifications,
  {
    id: Date.now(),
    text: `${deletedProduct.name} has been removed from the auctions.`
  }
];

localStorage.setItem(
  'auctionNotifications',
  JSON.stringify(updatedNotifications)
);

setNotifications(updatedNotifications);
  setMessage('Product deleted successfully!');
}
  // PLACE BID
  function handleBid(e) {
    e.preventDefault();

    const amount = Number(bidAmount);

    if (
      !selectedProduct ||
      !Number.isFinite(amount) ||
      amount <= selectedProduct.price
    ) {
      setMessage('Your bid must be higher than the current bid.');
      return;
    }

    const newBid = {
      id: Date.now(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      amount: amount,
      user: loggedInUser,
      date: new Date().toLocaleString()
    };

    const updatedBids = [...bids, newBid];

    const updatedProducts = products.map(product =>
      product.id === selectedProduct.id
        ? { ...product, price: amount }
        : product
    );

    localStorage.setItem('auctionBids', JSON.stringify(updatedBids));
    localStorage.setItem('auctionProducts', JSON.stringify(updatedProducts));

    setBids(updatedBids);
    setProducts(updatedProducts);

    setSelectedProduct(null);
    setBidAmount('');
    setMessage('Your bid has been placed successfully!');
  }

  // LOGOUT
  function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');

    setSelectedProduct(null);
    setPage('home');
    setMessage('You have logged out.');
  }

  const myBids = bids.filter(
    bid => bid.user === loggedInUser
  );

  return (
    <div className="app">

      {/* NAVIGATION */}

      <nav className="navbar">
        <h2 className="logo">
          Auction<span>Hub</span>
        </h2>

        <div className="nav-links">
          <button onClick={() => openPage('home')}>
            Home
          </button>

          {localStorage.getItem('isLoggedIn') === 'true' ? (
            <>
              <button onClick={() => openPage('dashboard')}>
                Dashboard
              </button>

              <button onClick={() => openPage('mybids')}>
                My Bids
              </button>

              <button onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => openPage('login')}>
  Login
</button>

<button onClick={() => openPage('signup')}>
  Sign Up
</button>

<button onClick={() => openPage('admin')}>
  Admin
</button>
            </>
          )}
        </div>
      </nav>

      {/* HOME PAGE */}

      {page === 'home' && (
        <>
          <section className="hero">
            <div className="hero-content">
              <p className="tagline">WELCOME TO AUCTIONHUB</p>

              <h1>
                Bid Smart.<br />
                <span>Win Big.</span>
              </h1>

              <p>
                Discover amazing products, place your bids
                and enjoy the excitement of online auctions.
              </p>

              <button
                className="explore-btn"
                onClick={() => openPage('login')}
              >
                Explore Auctions
              </button>
            </div>

            <div className="hero-image">
              <div className="auction-card">
                <div className="auction-icon">🏆</div>
                <h2>Find Your Next Treasure</h2>
                <p>Every bid brings a new opportunity.</p>
              </div>
            </div>
          </section>

          <section className="features">
            <h2>Why Choose AuctionHub?</h2>

            <div className="feature-cards">
              <div className="feature-card">
                <div>🛍️</div>
                <h3>Explore Products</h3>
                <p>Discover exciting products available for auction.</p>
              </div>

              <div className="feature-card">
                <div>🔨</div>
                <h3>Place Your Bids</h3>
                <p>Participate in auctions and make your best bid.</p>
              </div>

              <div className="feature-card">
                <div>🔒</div>
                <h3>Easy Access</h3>
                <p>Register and login to access your account.</p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* SIGNUP PAGE */}

      {page === 'signup' && (
        <section className="auth-section">
          <form className="auth-card" onSubmit={handleSignup}>
            <h2>Create Account</h2>
            <p>Join AuctionHub today</p>

            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button className="register-btn" type="submit">
              Sign Up
            </button>

            <p>
              Already registered?{' '}
              <span onClick={() => openPage('login')}>
                Login
              </span>
            </p>
          </form>
        </section>
      )}

      {/* LOGIN PAGE */}

      {page === 'login' && (
        <section className="auth-section">
          <form className="auth-card" onSubmit={handleLogin}>
            <h2>Welcome Back</h2>
            <p>Login to your AuctionHub account</p>

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button className="register-btn" type="submit">
              Login
            </button>

            <p>
              New user?{' '}
              <span onClick={() => openPage('signup')}>
                Create Account
              </span>
            </p>
          </form>
        </section>
      )}
{/* ADMIN LOGIN */}

{page === 'admin' && (
  <section className="auth-section">
    <form className="auth-card" onSubmit={handleAdminLogin}>
      <h2>Admin Login</h2>
      <p>Access the administration panel</p>

      <input
        type="email"
        placeholder="Admin Email"
        value={adminEmail}
        onChange={e => setAdminEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Admin Password"
        value={adminPassword}
        onChange={e => setAdminPassword(e.target.value)}
        required
      />

      <button className="register-btn" type="submit">
        Admin Login
      </button>
    </form>
  </section>
)}
{/* ADMIN DASHBOARD */}
{page === 'adminDashboard' && (
  <section className="user-dashboard">
    <div className="dashboard-header">
      <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome, Administrator!</p>
      </div>
<div className="bid-section">
  <h2>Manage Products</h2>

  {products.map(product => (
    <div key={product.id} className="bid-history">
      <span>{product.name} - ₹{product.price}</span>

      <button
        className="register-btn"
        onClick={() => handleDeleteProduct(product.id)}
      >
        Delete
      </button>
    </div>
  ))}
</div>
      <button
        className="register-btn"
        onClick={() => {
          localStorage.removeItem('isAdminLoggedIn');
          setPage('home');
        }}
      >
        Admin Logout
      </button>
    </div>
<div className="bid-section">
  <h2>Add New Product</h2>

  <form onSubmit={handleAddProduct}>
    <input
      type="text"
      placeholder="Product Name"
      value={newProductName}
      onChange={e => setNewProductName(e.target.value)}
      required
    />

    <input
      type="number"
      placeholder="Starting Price"
      min="1"
      value={newProductPrice}
      onChange={e => setNewProductPrice(e.target.value)}
      required
    />

    <button className="register-btn" type="submit">
      Add Product
    </button>
  </form>
</div>
    <div className="dashboard-stats">
      <div className="stat-card">
        <h3>Total Users</h3>
        <h2>{users.length}</h2>
      </div>

      <div className="stat-card">
        <h3>Total Products</h3>
        <h2>{products.length}</h2>
      </div>

      <div className="stat-card">
        <h3>Total Bids</h3>
        <h2>{bids.length}</h2>
      </div>
    </div>
        <div className="bid-section">
      <h2>Registered Users</h2>

      {users.length === 0 ? (
        <p>No users registered yet.</p>
      ) : (
        users.map((user, index) => (
          <div className="bid-history" key={user.email || index}>
            <span>{user.name} - {user.email}</span>
          </div>
        ))
      )}
    </div>
  </section>
)}
      {/* USER DASHBOARD */}

      {page === 'dashboard' && (
        <section className="user-dashboard">

          <div className="dashboard-header">
            <div>
              <p className="tagline">USER PANEL</p>
             <h1>Welcome back, {loggedInUser}!</h1>
             <div className="bid-section">
  <h2>Notifications</h2>

  {notifications.length === 0 ? (
    <p>No new notifications.</p>
  ) : (
    notifications.slice().reverse().map(notification => (
      <div className="bid-history" key={notification.id}>
        <span>{notification.text}</span>
      </div>
    ))
  )}
</div>
              <p>Explore products and participate in auctions.</p>
            </div>

            <button className="register-btn" onClick={logout}>
              Logout
            </button>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">🔨</div>
              <h3>{products.length}</h3>
              <p>Available Products</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <h3>{myBids.length}</h3>
              <p>My Bids</p>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⭐</div>
              <h3>{products.length}</h3>
              <p>Featured Auctions</p>
            </div>
          </div>

          <div className="auction-heading">
            <h2>Featured Auctions</h2>
            <p>Discover products available for bidding.</p>
          </div>

          <div className="product-grid">
            {products.map(product => (
              <div className="product-card" key={product.id}>
                <img src={product.image} alt={product.name} />

                <div className="product-info">
                  <span className="product-category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>
                  <p>Current Bid</p>

                  <h2>
                    ₹{product.price.toLocaleString('en-IN')}
                  </h2>

                  <button
                    className="register-btn"
                    onClick={() => {
                      setSelectedProduct(product);
                      setBidAmount('');
                      setMessage('');
                    }}
                  >
                    Place Bid
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* BID FORM */}

          {selectedProduct && (
            <div className="bid-section">
              <h2>Place Your Bid</h2>
              <h3>{selectedProduct.name}</h3>

              <p>
                Current Bid: ₹
                {selectedProduct.price.toLocaleString('en-IN')}
              </p>

              <form onSubmit={handleBid}>
                <input
                  type="number"
                  min={selectedProduct.price + 1}
                  placeholder="Enter your bid amount"
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                  required
                />

                <button className="register-btn" type="submit">
                  Submit Bid
                </button>

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setSelectedProduct(null)}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

        </section>
      )}

      {/* MY BIDS PAGE */}

      {page === 'mybids' && (
        <section className="user-dashboard">

          <div className="dashboard-header">
            <div>
              <p className="tagline">USER PANEL</p>
              <h1>My Bids</h1>
              <p>View your bidding activity and history.</p>
            </div>

            <button
              className="register-btn"
              onClick={() => openPage('dashboard')}
            >
              Browse Auctions
            </button>
          </div>

          <div className="bid-history">
            {myBids.length === 0 ? (
              <p>You have not placed any bids yet.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Bid Amount</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {myBids.map(bid => (
                    <tr key={bid.id}>
                      <td>{bid.productName}</td>
                      <td>
                        ₹{bid.amount.toLocaleString('en-IN')}
                      </td>
                      <td>{bid.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        </section>
      )}

      {/* MESSAGE */}

      {message && (
        <p className="message">
          {message}
        </p>
      )}

      {/* FOOTER */}

      <footer>
        <p>© 2026 AuctionHub | Online Auction System</p>
      </footer>

    </div>
  );
}

export default App;
