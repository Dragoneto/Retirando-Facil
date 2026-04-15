import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
function Agendamento() {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const navigate = useNavigate();
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        const response = await fetch(`${API_URL}/horarios`);
        if (!response.ok) {
          throw new Error('Falha ao buscar horários da API');
        }
        const data = await response.json();
        
        const formattedSlots = data.map(slot => ({
          time: slot.hora_inicio.substring(0, 5),
          available: true
        }));

        setAvailableSlots(formattedSlots);
        setLoading(false);

      } catch (error) {
        console.error("Erro no Agendamento.js:", error);
        setLoading(false);
      }
    };

    fetchSlots();
  }, []);

  const handleContinue = () => {
    if (selectedSlot) {
      navigate('/finalizar', { state: { agendamento: selectedSlot } });
    }
  };

  return (
    <div className="bg-light min-vh-100 pb-5">
      <div className="bg-white shadow-sm py-3 mb-4">
        <div className="container">
          <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm border-0">
            ← Voltar
          </button>
          <h4 className="mt-2 fw-bold">Escolha o horário de retirada</h4>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '800px' }}>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Carregando...</span>
            </div>
          </div>
        ) : (
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-header bg-white fw-bold text-uppercase text-muted">
              📅 Horários Disponíveis
            </div>
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot?.time === slot.time;
                  
                  return (
                    <button
                      key={slot.time}
                      disabled={!slot.available}
                      onClick={() => setSelectedSlot({ day: 'Hoje', time: slot.time })}
                      className={`btn ${isSelected ? 'btn-primary' : 'btn-outline-secondary'} 
                        ${!slot.available ? 'opacity-50' : ''} px-4 py-2`}
                    >
                      {slot.time}
                    </button>
                  );
                })}

                {availableSlots.length === 0 && (
                   <p className="text-muted">Nenhum horário disponível no momento.</p>
                )}
              </div>
            </div>
          </div>
        )}

        
        <div className="fixed-bottom bg-white p-3 shadow border-top">
          <div className="container" style={{ maxWidth: '800px' }}>
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <small className="text-muted">Horário selecionado:</small>
                <div className="fw-bold text-primary">
                  {selectedSlot ? `${selectedSlot.day} às ${selectedSlot.time}` : 'Nenhum selecionado'}
                </div>
              </div>
              <button 
                className="btn btn-success btn-lg px-5" 
                disabled={!selectedSlot}
                onClick={handleContinue}
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Agendamento;