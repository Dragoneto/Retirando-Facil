// src/controllers/scheduleController.js
const db = require('../config/db');

const scheduleController = {

  // Método para buscar horários ATIVOS (RF-3)
  getActiveSchedules: async (req, res) => {
    try {
      const sql = `
        SELECT id_horario, hora_inicio, capacidade_maxima 
        FROM horario 
        WHERE ativo = true 
        ORDER BY hora_inicio ASC
      `;
      const { rows } = await db.query(sql);
      res.status(200).json(rows);

    } catch (err) {
      console.error('Erro ao buscar horários ativos:', err.stack);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  // --- Funções para o LOJISTA (CRUD - RF-6, RF-7) ---

  getAllSchedulesForAdmin: async (req, res) => {
    try {
      const sql = 'SELECT * FROM horario ORDER BY hora_inicio ASC';
      const { rows } = await db.query(sql);
      res.status(200).json(rows);
    } catch (err) {
      console.error('Erro ao buscar horários (admin):', err.stack);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  createSchedule: async (req, res) => {
    try {
      const { hora_inicio, capacidade_maxima, ativo } = req.body;
      const sql = `
        INSERT INTO horario (hora_inicio, capacidade_maxima, ativo)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      const params = [hora_inicio, capacidade_maxima, ativo || true];
      const { rows } = await db.query(sql, params);
      res.status(201).json(rows[0]);

    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ message: 'Este horário já está cadastrado.' });
      }
      console.error('Erro ao criar horário:', err.stack);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  updateSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const { hora_inicio, capacidade_maxima, ativo } = req.body;
      const sql = `
        UPDATE horario 
        SET hora_inicio = $1, capacidade_maxima = $2, ativo = $3
        WHERE id_horario = $4
        RETURNING *;
      `;
      const params = [hora_inicio, capacidade_maxima, ativo, id];
      const { rows } = await db.query(sql, params);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Horário não encontrado.' });
      }
      res.status(200).json(rows[0]);

    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ message: 'Este horário já está cadastrado.' });
      }
      console.error('Erro ao atualizar horário:', err.stack);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  deleteSchedule: async (req, res) => {
    try {
      const { id } = req.params;
      const sql = 'DELETE FROM horario WHERE id_horario = $1 RETURNING *;';
      const { rows } = await db.query(sql, [id]);
      if (rows.length === 0) {
        return res.status(404).json({ message: 'Horário não encontrado.' });
      }
      res.status(200).json({ message: 'Horário deletado com sucesso.' });

    } catch (err) {
      console.error('Erro ao deletar horário:', err.stack);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
};

module.exports = scheduleController;