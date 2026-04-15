import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import CartController from '../../../controllers/CartController';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function Finalizar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  
  const agendamento = location.state?.agendamento;

  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [formData, setFormData] = useState({ nome: '', matricula: '', email: '' });

  
  useEffect(() => {
    if (!agendamento) {
      alert("Por favor, selecione um horário antes.");
      navigate('/agendamento');
      return;
    }

    CartController.getCart().then(items => {
      setCartItems(items);
      const sum = items.reduce((acc, item) => acc + (item.product.preco * item.quantity), 0);
      setTotal(sum);
    });
  }, [agendamento, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const dataDeHoje = new Date().toISOString().split('T')[0];

  const agendamentoCorrigido = {
    ...agendamento,
    day: agendamento.day === 'Hoje' ? dataDeHoje : agendamento.day 
  };

  const pedidoData = {
    usuario: formData,
    itens: cartItems,
    agendamento: agendamentoCorrigido
  };

  try {
    const response = await fetch(`${API_URL}/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pedidoData),
    });

    if (!response.ok) {
      throw new Error('Falha ao criar o pedido.');
    }

    const result = await response.json();
    console.log('Pedido criado com sucesso!', result);

    await CartController.clearCart();
    navigate('/confirmacao');

  } catch (error) {
    console.error("Erro ao finalizar pedido:", error);
    alert("Erro ao enviar seu pedido. Tente novamente.");
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <div className="bg-white shadow-sm py-3 mb-4">
        <div className="container">
            <button onClick={() => navigate(-1)} className="btn btn-link text-decoration-none p-0">← Voltar</button>
            <h4 className="fw-bold mt-1">Finalizar Retirada</h4>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '900px' }}>
        <div className="row">
          
          {/* Coluna Esquerda: Formulário */}
          <div className="col-md-7 mb-4">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-bold text-primary">👤 Dados do Aluno</div>
              <div className="card-body">
                <form id="checkoutForm" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nome Completo</label>
                    <input type="text" name="nome" className="form-control" required onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Matrícula</label>
                    <input type="text" name="matricula" className="form-control" required onChange={handleChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">E-mail do Responsável</label>
                    <input type="email" name="email" className="form-control" required onChange={handleChange} />
                  </div>
                </form>
              </div>
            </div>

            <div className="card border-0 shadow-sm mt-3">
              <div className="card-header bg-white fw-bold text-primary">📅 Retirada Agendada</div>
              <div className="card-body d-flex align-items-center">
                 <div className="fs-1 me-3">📆</div>
                 <div>
                    <h5 className="mb-0">{agendamento?.day}</h5>
                    <p className="text-muted mb-0">Horário: <strong className="text-dark">{agendamento?.time}</strong></p>
                 </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Resumo da Conta */}
          <div className="col-md-5">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white fw-bold">Resumo do Pedido</div>
              <div className="card-body p-0">
                <ul className="list-group list-group-flush">
                  {cartItems.map((item, idx) => (
                    <li key={idx} className="list-group-item d-flex justify-content-between align-items-center">
                      <div>
                        <small className="d-block fw-bold">{item.product.nome}</small>
                        <small className="text-muted">x{item.quantity}</small>
                      </div>
                      <span>R$ {(item.product.preco * item.quantity).toFixed(2).replace('.', ',')}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="card-footer bg-light">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="fw-bold">Total a Pagar</span>
                  <span className="fs-4 fw-bold text-success">R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                <button type="submit" form="checkoutForm" className="btn btn-primary w-100 py-2 fw-bold">
                  Confirmar Reserva
                </button>
                <small className="text-muted text-center d-block mt-2">Pagamento realizado no ato da retirada.</small>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Finalizar;