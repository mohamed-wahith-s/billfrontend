import React, { useState, useEffect } from 'react';
import api from '../api';
import { Edit2, Trash2, X } from 'lucide-react';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', image: '', barcode: '' });
  const [imageFile, setImageFile] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
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
      data.append('barcode', formData.barcode);
      if (imageFile) {
        data.append('image', imageFile);
      } else if (formData.image) {
        data.append('image', formData.image);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };

      if (isEditing) {
        await api.put(`/products/${currentProductId}`, data, config);
      } else {
        await api.post('/products', data, config);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      alert(`Error ${isEditing ? 'updating' : 'adding'} product`);
    }
  };

  const handleEdit = (product) => {
    setFormData({ name: product.name, price: product.price, image: product.image || '', barcode: product.barcode || '' });
    setCurrentProductId(product._id);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        alert('Error deleting product');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', image: '', barcode: '' });
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
              <label style={styles.label}>Image URL (Optional)</label>
              <input type="text" placeholder="https://example.com/image.jpg" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} style={styles.input} disabled={!!imageFile} />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Or Upload Local Image</label>
              <input type="file" onChange={(e) => setImageFile(e.target.files[0])} style={styles.input} accept="image/*" />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Barcode</label>
              <input type="text" placeholder="e.g. 123456789" value={formData.barcode} onChange={(e) => setFormData({...formData, barcode: e.target.value})} style={styles.input} />
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
              {product.barcode && (
                <div style={styles.barcodeBadge}>
                  <ScanLine size={12} />
                  <span>{product.barcode}</span>
                </div>
              )}
              
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
  productName: { fontSize: '1.125rem', fontWeight: '700', marginBottom: '0.25rem' },
  price: { color: '#10b981', fontWeight: '800', fontSize: '1.25rem', marginBottom: '0.5rem' },
  barcode: { fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem' },
  testQty: { borderTop: '1px solid #f1f5f9', paddingTop: '1rem' },
  qtyContainer: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' },
  qtyBtn: { width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer' },
  qtyText: { fontWeight: '600' },
  total: { fontSize: '0.875rem', color: '#64748b', fontWeight: '500' },
  barcodeBadge: { display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#475569', fontWeight: '600', marginBottom: '1rem' }
};

export default ProductList;
