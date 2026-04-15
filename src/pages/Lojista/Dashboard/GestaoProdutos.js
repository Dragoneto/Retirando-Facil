import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const STATUS_COLORS = {
  'Recebido': 'warning',
  'Em Separação': 'info',
  'Pronto para Retirada': 'primary',
  'Retirado': 'success',
  'Cancelado': 'danger'
};

const PRODUTO_VAZIO = { nome: '', categoria: '', preco: '', estoque: '', descricao: '', imageUrl: '' };

function GestaoProdutos() {
  const navigate = useNavigate();
  const [aba, setAba] = useState('produtos');
  const [produtos, setProdutos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(PRODUTO_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [filtroPedido, setFiltroPedido] = useState('Todos');

  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') !== 'true') {
      navigate('/admin');
    }
  }, [navigate]);

  const fetchProdutos = useCallback(async () => {
    const res = await fetch(`${API_URL}/produtos`);
    const data = await res.json();
    setProdutos(data);
  }, []);

  const fetchPedidos = useCallback(async () => {
    const res = await fetch(`${API_URL}/admin/pedidos`);
    const data = await res.json();
    setPedidos(data);
  }, []);

  useEffect(() => {
    Promise.all([fetchProdutos(), fetchPedidos()]).finally(() => setLoading(false));
  }, [fetchProdutos, fetchPedidos]);

  const abrirModal = (produto = null) => {
    if (produto) {
      setEditando(produto.id);
      setForm({ nome: produto.nome, categoria: produto.categoria, preco: produto.preco, estoque: produto.estoque, descricao: produto.descricao || '', imageUrl: produto.imageUrl || '' });
    } else {
      setEditando(null);
      setForm(PRODUTO_VAZIO);
    }
    setModal(true);
  };

  const salvarProduto = async (e) => {
    e.preventDefault();
    setSalvando(true);
    const url = editando ? `${API_URL}/produtos/${editando}` : `${API_URL}/produtos`;
    const method = editando ? 'PUT' : 'POST';
    await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    await fetchProdutos();
    setModal(false);
    setSalvando(false);
  };

  const deletarProduto = async (id) => {
    if (!window.confirm('Deletar este produto?')) return;
    await fetch(`${API_URL}/produtos/${id}`, { method: 'DELETE' });
    await fetchProdutos();
  };

  const atualizarStatus = async (pedidoId, status) => {
    await fetch(`${API_URL}/admin/pedidos/${pedidoId}/status`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status })
    });
    await fetchPedidos();
  };

  const sair = () => { sessionStorage.removeItem('admin_auth'); navigate('/admin'); };

  const pedidosFiltrados = filtroPedido === 'Todos' ? pedidos : pedidos.filter(p => p.status_pedido === filtroPedido);
  const totalVendas = pedidos.filter(p => p.status_pedido === 'Retirado').reduce((acc, p) => acc + parseFloat(p.total), 0);

  if (loading) return <div className="d-flex justify-content-center align-items-center min-vh-100"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="min-vh-100" style={{ background: '#f0f4ff' }}>
      <nav className="navbar navbar-dark bg-primary shadow">
        <div className="container-fluid px-4">
          <span className="navbar-brand fw-bold">🎓 Retira Fácil — Admin</span>
          <div className="d-flex gap-2">
            <a href="/" className="btn btn-outline-light btn-sm" target="_blank" rel="noreferrer">Ver loja</a>
            <button className="btn btn-outline-light btn-sm" onClick={sair}>Sair</button>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 py-4">
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <div className="fs-2 fw-bold text-primary">{produtos.length}</div>
              <small className="text-muted">Produtos</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <div className="fs-2 fw-bold text-warning">{pedidos.filter(p => p.status_pedido === 'Recebido').length}</div>
              <small className="text-muted">Pedidos novos</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <div className="fs-2 fw-bold text-info">{pedidos.filter(p => p.status_pedido === 'Pronto para Retirada').length}</div>
              <small className="text-muted">Prontos</small>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card border-0 shadow-sm text-center p-3">
              <div className="fs-2 fw-bold text-success">R$ {totalVendas.toFixed(2).replace('.', ',')}</div>
              <small className="text-muted">Total retirado</small>
            </div>
          </div>
        </div>

        <ul className="nav nav-tabs mb-4 border-0">
          <li className="nav-item">
            <button className={`nav-link fw-semibold ${aba === 'produtos' ? 'active' : ''}`} onClick={() => setAba('produtos')}>
              📦 Produtos ({produtos.length})
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link fw-semibold ${aba === 'pedidos' ? 'active' : ''}`} onClick={() => setAba('pedidos')}>
              📋 Pedidos ({pedidos.length})
            </button>
          </li>
        </ul>

        {aba === 'produtos' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
              <span className="fw-bold">Catálogo de Produtos</span>
              <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => abrirModal()}>+ Novo Produto</button>
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Preço</th>
                    <th>Estoque</th>
                    <th className="text-end">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {p.imageUrl && <img src={p.imageUrl} alt={p.nome} style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />}
                          <span className="fw-semibold">{p.nome}</span>
                        </div>
                      </td>
                      <td><span className="badge bg-light text-dark border">{p.categoria}</span></td>
                      <td className="fw-bold text-primary">R$ {parseFloat(p.preco).toFixed(2).replace('.', ',')}</td>
                      <td>
                        <span className={`badge bg-${p.estoque > 10 ? 'success' : p.estoque > 0 ? 'warning' : 'danger'}`}>
                          {p.estoque} un.
                        </span>
                      </td>
                      <td className="text-end">
                        <button className="btn btn-outline-primary btn-sm me-1" onClick={() => abrirModal(p)}>Editar</button>
                        <button className="btn btn-outline-danger btn-sm" onClick={() => deletarProduto(p.id)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aba === 'pedidos' && (
          <div>
            <div className="d-flex gap-2 mb-3 flex-wrap">
              {['Todos', 'Recebido', 'Em Separação', 'Pronto para Retirada', 'Retirado', 'Cancelado'].map(s => (
                <button key={s} className={`btn btn-sm rounded-pill ${filtroPedido === s ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFiltroPedido(s)}>
                  {s}
                </button>
              ))}
            </div>
            {pedidosFiltrados.length === 0 ? (
              <div className="text-center py-5 text-muted">Nenhum pedido encontrado.</div>
            ) : (
              <div className="row g-3">
                {pedidosFiltrados.map(p => (
                  <div key={p.id_pedido} className="col-12 col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <span className="fw-bold">Pedido #{p.id_pedido}</span>
                        <span className={`badge bg-${STATUS_COLORS[p.status_pedido] || 'secondary'}`}>{p.status_pedido}</span>
                      </div>
                      <div className="card-body">
                        <p className="mb-1"><strong>👤</strong> {p.cliente_nome}</p>
                        <p className="mb-1 text-muted small">{p.cliente_email}</p>
                        <p className="mb-1 small"><strong>📅</strong> {new Date(p.data_retirada_agendada).toLocaleDateString('pt-BR')} às {String(p.horario_retirada_agendado).substring(0, 5)}</p>
                        <hr className="my-2" />
                        <ul className="list-unstyled small mb-2">
                          {p.itens.map((item, i) => (
                            <li key={i} className="d-flex justify-content-between">
                              <span>{item.nome} x{item.quantidade}</span>
                              <span className="text-muted">R$ {(item.preco * item.quantidade).toFixed(2).replace('.', ',')}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="fw-bold text-success mb-2">Total: R$ {parseFloat(p.total).toFixed(2).replace('.', ',')}</p>
                        <select className="form-select form-select-sm" value={p.status_pedido} onChange={(e) => atualizarStatus(p.id_pedido, e.target.value)}>
                          {['Recebido', 'Em Separação', 'Pronto para Retirada', 'Retirado', 'Cancelado'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {modal && (
        <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{editando ? 'Editar Produto' : 'Novo Produto'}</h5>
                <button className="btn-close" onClick={() => setModal(false)} />
              </div>
              <form onSubmit={salvarProduto}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-8">
                      <label className="form-label small fw-semibold">Nome *</label>
                      <input className="form-control" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Categoria</label>
                      <input className="form-control" value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Preço (R$) *</label>
                      <input type="number" step="0.01" className="form-control" value={form.preco} onChange={e => setForm({...form, preco: e.target.value})} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Estoque *</label>
                      <input type="number" className="form-control" value={form.estoque} onChange={e => setForm({...form, estoque: e.target.value})} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">URL da Imagem</label>
                      <input className="form-control" value={form.imageUrl} onChange={e => setForm({...form, imageUrl: e.target.value})} placeholder="https://..." />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Descrição</label>
                      <textarea className="form-control" rows={3} value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary fw-bold" disabled={salvando}>
                    {salvando ? <span className="spinner-border spinner-border-sm me-2" /> : ''}
                    {editando ? 'Salvar alterações' : 'Criar produto'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestaoProdutos;