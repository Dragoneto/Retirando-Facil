import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
 
function Login() {
  const [form, setForm] = useState({ usuario: '', senha: '' });
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
 
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro('');
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      if (form.usuario === 'admin' && form.senha === 'retira2024') {
        sessionStorage.setItem('admin_auth', 'true');
        navigate('/admin/produtos');
      } else {
        setErro('Usuário ou senha incorretos.');
        setLoading(false);
      }
    }, 600);
  };
 
  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: '#f0f4ff' }}>
      <div className="card border-0 shadow-lg p-4" style={{ width: '100%', maxWidth: '400px', borderRadius: '1rem' }}>
        <div className="text-center mb-4">
          <div className="fs-1 mb-2">🎓</div>
          <h4 className="fw-bold text-primary mb-0">Retira Fácil</h4>
          <small className="text-muted">Painel Administrativo</small>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold text-muted small">USUÁRIO</label>
            <input type="text" name="usuario" className={`form-control ${erro ? 'is-invalid' : ''}`} placeholder="admin" value={form.usuario} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold text-muted small">SENHA</label>
            <input type="password" name="senha" className={`form-control ${erro ? 'is-invalid' : ''}`} placeholder="••••••••" value={form.senha} onChange={handleChange} required />
            {erro && <div className="invalid-feedback">{erro}</div>}
          </div>
          <button type="submit" className="btn btn-primary w-100 py-2 fw-bold mt-2" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2" /> : '🔐 '}Entrar
          </button>
        </form>
        <div className="text-center mt-3">
          <small className="text-muted">Credenciais: <code>admin</code> / <code>retira2024</code></small>
        </div>
        <hr className="my-3" />
        <div className="text-center">
          <a href="/" className="btn btn-outline-secondary btn-sm rounded-pill">← Voltar para a loja</a>
        </div>
      </div>
    </div>
  );
}
 
export default Login;