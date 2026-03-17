import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, X } from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', image: '' });
  const [imageFile, setImageFile] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('https://billbackend-b2li.onrender.com/api/products');
      setProducts(res.data.map(p => ({ ...p, quantity: 1 })));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('price', formData.price);
      if (formData.image && !imageFile) {
        data.append('image', formData.image);
      }
      if (imageFile) {
        data.append('image', imageFile);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (isEditing) {
        await axios.put(`https://billbackend-b2li.onrender.com/api/products/${currentProductId}`, data, config);
      } else {
        await axios.post('https://billbackend-b2li.onrender.com/api/products', data, config);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      alert(`Error ${isEditing ? 'updating' : 'adding'} product`);
    }
  };

  const handleEdit = (product) => {
    setFormData({ name: product.name, price: product.price, image: product.image || '' });
    setCurrentProductId(product._id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`https://billbackend-b2li.onrender.com/api/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert('Error deleting product');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', image: '' });
    setImageFile(null);
    setShowForm(false);
    setIsEditing(false);
    setCurrentProductId(null);
  };

  const updateQty = (id, delta) => {
    setProducts(products.map(p => 
      p._id === id ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p
    ));
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2>Product Inventory</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)} style={styles.addBtn}>
            Add New Product
          </button>
        )}
      </div>

      {showForm && (
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h3>{isEditing ? 'Edit Product' : 'Add New Product'}</h3>
            <button onClick={resetForm} style={styles.closeBtn}><X size={20}/></button>
          </div>
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Product Name</label>
              <input type="text" placeholder="e.g. Fresh Milk" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} style={styles.input} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Price (Rs.)</label>
              <input type="number" placeholder="0.00" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} style={styles.input} required />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Image URL</label>
              <input type="text" placeholder="https://example.com/image.jpg" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} style={styles.input} disabled={!!imageFile} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Or Upload Local Image</label>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} style={styles.input} disabled={!!formData.image} />
            </div>
            <button type="submit" style={isEditing ? styles.updateBtn : styles.submitBtn}>
              {isEditing ? 'Update Product' : 'Save Product'}
            </button>
          </form>
        </div>
      )}

      <div style={styles.grid}>
        {products.map(product => (
          <div key={product._id} style={styles.card}>
            <div style={styles.imageWrapper}>
              <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} style={styles.image} />
              <div style={styles.cardOverlay}>
                <button onClick={() => handleEdit(product)} style={styles.editBtn} title="Edit Product"><Edit2 size={16}/></button>
                <button onClick={() => handleDelete(product._id)} style={styles.cardDelBtn} title="Delete Product"><Trash2 size={16}/></button>
              </div>
            </div>
            <div style={styles.cardBody}>
              <h3 style={styles.productName}>{product.name}</h3>
              <p style={styles.price}>Rs. {product.price}</p>
              
              <div style={styles.testQty}>
                <div style={styles.qtyContainer}>
                  <button onClick={() => updateQty(product._id, -1)} style={styles.qtyBtn}>-</button>
                  <span style={styles.qtyText}>{product.quantity}</span>
                  <button onClick={() => updateQty(product._id, 1)} style={styles.qtyBtn}>+</button>
                </div>
                <p style={styles.total}>Total: Rs. {(product.price * product.quantity).toFixed(2)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', paddingBottom: '4rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' },
  addBtn: { padding: '0.75rem 1.5rem', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', transition: 'background 0.2s' },
  formCard: { backgroundColor: '#fff', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', marginBottom: '3rem', border: '1px solid #f1f5f9' },
  formHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'flex-end' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.875rem', fontWeight: '600', color: '#64748b' },
  input: { padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s' },
  submitBtn: { padding: '0.75rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
  updateBtn: { padding: '0.75rem', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' },
  card: { backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: '1px solid #f1f5f9', transition: 'transform 0.2s' },
  imageWrapper: { position: 'relative', height: '200px', overflow: 'hidden' },
  image: { width: '100%', height: '100%', objectFit: 'cover' },
  cardOverlay: { position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem' },
  editBtn: { backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', color: '#3b82f6', display: 'flex' },
  cardDelBtn: { backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '6px', padding: '8px', cursor: 'pointer', color: '#ef4444', display: 'flex' },
  cardBody: { padding: '1.5rem' },
  productName: { fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.5rem' },
  price: { color: '#10b981', fontWeight: '800', fontSize: '1.25rem', marginBottom: '1rem' },
  testQty: { borderTop: '1px solid #f1f5f9', paddingTop: '1rem' },
  qtyContainer: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' },
  qtyBtn: { width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' },
  qtyText: { fontWeight: '600' },
  total: { fontSize: '0.875rem', color: '#64748b', fontWeight: '500' }
};

export default ProductList;
