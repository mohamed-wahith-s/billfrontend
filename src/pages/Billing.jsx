import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Minus, Trash2, ReceiptText } from 'lucide-react';

const Billing = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showInvoice, setShowInvoice] = useState(false);
  const [orderImage, setOrderImage] = useState(null);
  const [orderNumber, setOrderNumber] = useState(`ORD-${Math.floor(100000 + Math.random() * 900000)}`);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tempQty, setTempQty] = useState('1');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://billbackend-b2li.onrender.com/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = (product, forcedQty = null) => {
    const finalQty = forcedQty !== null ? forcedQty : parseFloat(tempQty);
    if (isNaN(finalQty) || finalQty <= 0) return;

    const existing = cart.find(item => item._id === product._id);
    if (existing) {
      setCart(cart.map(item => 
        item._id === product._id ? { ...item, quantity: item.quantity + finalQty } : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: finalQty }]);
    }
    setSelectedProduct(null);
    setTempQty('1');
  };

  const updateCartQty = (id, value, isDelta = true) => {
    setCart(cart.map(item => {
      if (item._id === id) {
        const newQty = isDelta ? Math.max(0, item.quantity + value) : Math.max(0, parseFloat(value) || 0);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item._id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveOrder = async () => {
    try {
      const data = new FormData();
      data.append('orderNumber', orderNumber);
      data.append('items', JSON.stringify(cart));
      data.append('totalAmount', calculateTotal());
      if (orderImage) {
        data.append('orderImage', orderImage);
      }

      await axios.post('https://billbackend-b2li.onrender.com/api/orders', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setShowInvoice(true);
    } catch (err) {
      alert('Error saving order to database');
      console.error(err);
    }
  };

  if (showInvoice) {
    return (
      <div style={styles.invoiceContainer}>
        <div style={styles.invoiceBox}>
          <div style={styles.invoiceHeader}>
            <h1>INVOICE</h1>
            <p>BillingSoft Pro</p>
          </div>
          <div style={styles.invoiceInfo}>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Invoice #:</strong> {Math.floor(Math.random() * 1000000)}</p>
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>Rs. {item.price}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={styles.invoiceTotal}>
            <h3>Grand Total: Rs. {calculateTotal()}</h3>
          </div>
          <div style={styles.noPrint}>
              <button onClick={() => setShowInvoice(false)} style={styles.backBtn}>Back to Editor</button>
              <button onClick={() => window.print()} style={styles.printBtn}>Print Invoice</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.mainLayout}>
        {/* Product Selection */}
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Select Products</h2>
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              style={styles.searchBar}
            />
          </div>
          <div style={styles.grid}>
            {filteredProducts.map(p => (
              <div key={p._id} style={styles.pCard} onClick={() => setSelectedProduct(p)}>
                <img src={p.image || 'https://via.placeholder.com/150'} alt={p.name} style={styles.pImage} />
                <div style={styles.pInfo}>
                  <h4>{p.name}</h4>
                  <p>Rs. {p.price}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quantity Selector Modal */}
        {selectedProduct && (
          <div style={styles.modalOverlay}>
            <div style={styles.qtyModal}>
              <h3 style={{marginBottom: '1rem'}}>Add {selectedProduct.name}</h3>
              <p style={{fontSize: '0.9rem', color: '#64748b', marginBottom: '1.5rem'}}>Enter weight or quantity</p>
              
              <input 
                type="number" 
                value={tempQty} 
                onChange={(e) => setTempQty(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addToCart(selectedProduct)}
                style={styles.modalInput}
                autoFocus
              />

              <div style={styles.modalQuickQty}>
                <button onClick={() => addToCart(selectedProduct, 0.25)} style={styles.modalQtyBtn}>250g / ml</button>
                <button onClick={() => addToCart(selectedProduct, 0.5)} style={styles.modalQtyBtn}>500g / ml</button>
                <button onClick={() => addToCart(selectedProduct, 0.75)} style={styles.modalQtyBtn}>750g / ml</button>
                <button onClick={() => addToCart(selectedProduct, 1)} style={styles.modalQtyBtn}>1kg / L</button>
              </div>

              <div style={styles.modalActions}>
                <button onClick={() => setSelectedProduct(null)} style={styles.cancelBtn}>Cancel</button>
                <button onClick={() => addToCart(selectedProduct)} style={styles.confirmBtn}>Add to Bill</button>
              </div>
            </div>
          </div>
        )}

        {/* Cart / Bill Preview */}
        <div style={styles.sidebar}>
          <h2 style={styles.sectionTitle}>Current Bill</h2>
          {cart.length === 0 ? (
            <div style={styles.emptyCart}>No items added yet</div>
          ) : (
            <>
              <div style={styles.cartList}>
                {cart.map(item => (
                  <div key={item._id} style={styles.cartItem}>
                    <div>
                      <div style={styles.itemName}>{item.name}</div>
                      <div style={styles.itemPrice}>Rs. {item.price} x {item.quantity}</div>
                    </div>
                    <div style={styles.itemActions}>
                      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
                        <div style={styles.qtyControls}>
                          <button onClick={() => updateCartQty(item._id, -0.1)} style={styles.qtySmallBtn}><Minus size={14}/></button>
                          <input 
                            type="number" 
                            step="0.01"
                            value={item.quantity} 
                            onChange={(e) => updateCartQty(item._id, e.target.value, false)}
                            style={styles.qtyInput}
                          />
                          <button onClick={() => updateCartQty(item._id, 0.1)} style={styles.qtySmallBtn}><Plus size={14}/></button>
                        </div>
                        <div style={styles.quickQtyContainer}>
                          <button onClick={() => updateCartQty(item._id, 0.25, false)} style={styles.quickQtyBtn}>250g</button>
                          <button onClick={() => updateCartQty(item._id, 0.5, false)} style={styles.quickQtyBtn}>500g</button>
                          <button onClick={() => updateCartQty(item._id, 0.75, false)} style={styles.quickQtyBtn}>750g</button>
                          <button onClick={() => updateCartQty(item._id, 1, false)} style={styles.quickQtyBtn}>1kg</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} style={styles.delBtn}><Trash2 size={16} color="#ef4444"/></button>
                    </div>
                  </div>
                ))}
              </div>
              <div style={styles.totalBox}>
                <div style={styles.totalRow}>
                  <span>Total Amount</span>
                  <span style={styles.totalValue}>Rs. {calculateTotal()}</span>
                </div>
                
                <div style={{marginBottom: '1rem'}}>
                  <label style={{fontSize: '0.875rem', fontWeight: '600', display: 'block', marginBottom: '0.5rem'}}>Upload Bill Image (Optional)</label>
                  <input 
                    type="file" 
                    onChange={(e) => setOrderImage(e.target.files[0])} 
                    style={{width: '100%', fontSize: '0.8rem'}}
                  />
                </div>

                <button onClick={handleSaveOrder} style={styles.generateBtn}>
                  <ReceiptText size={20} style={{marginRight: '0.5rem'}}/>
                  Save & Generate Bill
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: '2rem' },
  mainLayout: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem' },
  section: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' },
  sectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' },
  sectionTitle: { fontSize: '1.5rem', color: '#1e293b' },
  searchBar: { padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', width: '300px', outline: 'none', fontSize: '0.9rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem' },
  pCard: { border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.1s' },
  pImage: { width: '100%', height: '120px', objectFit: 'cover' },
  pInfo: { padding: '0.75rem', textAlign: 'center' },
  sidebar: { backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', height: 'fit-content', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', position: 'sticky', top: '2rem' },
  emptyCart: { textAlign: 'center', padding: '2rem', color: '#64748b' },
  cartList: { marginBottom: '2rem' },
  cartItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid #f1f5f9' },
  itemName: { fontWeight: '600', color: '#1e293b' },
  itemPrice: { fontSize: '0.875rem', color: '#64748b' },
  itemActions: { display: 'flex', gap: '1rem', alignItems: 'center' },
  qtyControls: { display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#f8fafc', padding: '0.25rem', borderRadius: '6px', border: '1px solid #e2e8f0' },
  qtySmallBtn: { border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', padding: '4px' },
  qtyInput: { width: '60px', border: 'none', background: 'transparent', textAlign: 'center', fontWeight: '600', fontSize: '0.9rem', outline: 'none' },
  quickQtyContainer: { display: 'flex', gap: '0.25rem', marginTop: '0.5rem', flexWrap: 'wrap' },
  quickQtyBtn: { padding: '4px 6px', fontSize: '0.7rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b' },
  delBtn: { border: 'none', background: 'transparent', cursor: 'pointer' },
  totalBox: { borderTop: '2px dashed #e2e8f0', paddingTop: '1.5rem' },
  totalRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' },
  totalValue: { fontSize: '1.25rem', fontWeight: '800', color: '#2563eb' },
  generateBtn: { width: '100%', padding: '1rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  invoiceContainer: { display: 'flex', justifyContent: 'center', padding: '2rem' },
  invoiceBox: { backgroundColor: '#fff', padding: '3rem', borderRadius: '12px', width: '800px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
  invoiceHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', borderBottom: '2px solid #1e293b', paddingBottom: '1rem' },
  invoiceInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '3rem' },
  invoiceTotal: { textAlign: 'right', borderTop: '2px solid #1e293b', paddingTop: '1rem' },
  noPrint: { marginTop: '3rem', display: 'flex', gap: '1rem', justifyContent: 'center' },
  backBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#64748b', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  printBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  qtyModal: { backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', width: '350px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', textAlign: 'center' },
  modalInput: { width: '100%', padding: '1rem', fontSize: '1.5rem', textAlign: 'center', borderRadius: '8px', border: '2px solid #e2e8f0', marginBottom: '1.5rem', outline: 'none' },
  modalQuickQty: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' },
  modalQtyBtn: { padding: '0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f8fafc', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem' },
  modalActions: { display: 'flex', gap: '1rem' },
  cancelBtn: { flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer', fontWeight: '600' },
  confirmBtn: { flex: 2, padding: '0.75rem', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', cursor: 'pointer', fontWeight: '700' }
};

export default Billing;
