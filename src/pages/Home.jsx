import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Package, Settings } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>BillingSoft Pro</h1>
        <p style={styles.subtitle}>Streamlined inventory and billing management for your business.</p>
      </header>

      <div style={styles.grid}>
        <div style={styles.card} onClick={() => navigate('/billing')}>
          <div style={{...styles.iconWrapper, backgroundColor: '#dcfce7'}}>
            <Receipt size={32} color="#16a34a" />
          </div>
          <h2 style={styles.cardTitle}>Make Bill</h2>
          <p style={styles.cardDesc}>Create new invoices and generate receipts for customers.</p>
          <button style={{...styles.btn, backgroundColor: '#22c55e'}}>Start Billing</button>
        </div>

        <div style={styles.card} onClick={() => navigate('/products')}>
          <div style={{...styles.iconWrapper, backgroundColor: '#dbeafe'}}>
            <Package size={32} color="#2563eb" />
          </div>
          <h2 style={styles.cardTitle}>Manage Products</h2>
          <p style={styles.cardDesc}>Add, edit, or remove products from your inventory.</p>
          <button style={{...styles.btn, backgroundColor: '#3b82f6'}}>View Products</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '4rem 2rem',
    maxWidth: '1000px',
    margin: '0 auto',
    textAlign: 'center'
  },
  header: {
    marginBottom: '4rem'
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: '1rem'
  },
  subtitle: {
    fontSize: '1.25rem',
    color: '#64748b'
  },
  grid: {
    display: 'flex',
    gap: '2rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  card: {
    backgroundColor: '#fff',
    padding: '2.5rem',
    borderRadius: '20px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
    width: '320px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    border: '1px solid #f1f5f9'
  },
  iconWrapper: {
    padding: '1.25rem',
    borderRadius: '16px',
    marginBottom: '1.5rem'
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '0.75rem'
  },
  cardDesc: {
    color: '#64748b',
    marginBottom: '2rem',
    lineHeight: '1.6'
  },
  btn: {
    padding: '0.75rem 1.5rem',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%'
  }
};

export default Home;
