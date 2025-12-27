export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', padding: 24 }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>404 - Not Found</h1>
      <p style={{ color: '#888', marginBottom: '2rem', textAlign: 'center' }}>
        Sorry, the page you are looking for does not exist.
      </p>
      <a href="/" style={{ padding: '0.75rem 2rem', borderRadius: '9999px', background: '#2563eb', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>
        Go Home
      </a>
    </div>
  );
}
