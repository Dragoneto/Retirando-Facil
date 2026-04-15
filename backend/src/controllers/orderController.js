const db = require('../config/db');
 
const orderController = {
 
  createOrder: async (req, res) => {
    const { usuario, itens, agendamento } = req.body;
 
    if (!usuario || !itens || !agendamento || itens.length === 0) {
      return res.status(400).json({ message: 'Dados do pedido incompletos.' });
    }
 
    const client = await db.pool.connect();
 
    try {
      await client.query('BEGIN');
 
      let { rows: clienteRows } = await client.query(
        'SELECT id_cliente FROM cliente WHERE email = $1',
        [usuario.email]
      );
 
      let clienteId;
      if (clienteRows.length > 0) {
        clienteId = clienteRows[0].id_cliente;
      } else {
        const { rows: newCliente } = await client.query(
          'INSERT INTO cliente (nome, telefone, email) VALUES ($1, $2, $3) RETURNING id_cliente',
          [usuario.nome, usuario.matricula, usuario.email]
        );
        clienteId = newCliente[0].id_cliente;
      }
 
      const { rows: pedidoRows } = await client.query(
        `INSERT INTO pedido (id_cliente, data_retirada_agendada, horario_retirada_agendado, status_pedido)
         VALUES ($1, $2, $3, 'Recebido') RETURNING id_pedido`,
        [clienteId, agendamento.day, agendamento.time]
      );
      const pedidoId = pedidoRows[0].id_pedido;
 
      for (const item of itens) {
        await client.query(
          'INSERT INTO itens_pedido (id_pedido, id_produto, quantidade, preco_unitario_no_pedido) VALUES ($1, $2, $3, $4)',
          [pedidoId, item.product.id, item.quantity, item.product.preco]
        );
      }
 
      await client.query('COMMIT');
      res.status(201).json({ message: 'Pedido criado com sucesso!', pedidoId, clienteId });
 
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Erro ao criar pedido:', err.stack);
      res.status(500).json({ message: 'Erro interno ao criar pedido.' });
    } finally {
      client.release();
    }
  },
 
  getAllOrders: async (req, res) => {
    try {
      const { rows } = await db.query(`
        SELECT p.id_pedido, p.status_pedido, p.data_retirada_agendada, p.horario_retirada_agendado, p.criado_em,
          c.nome AS cliente_nome, c.email AS cliente_email, c.telefone AS cliente_matricula,
          COALESCE(json_agg(json_build_object('nome', pr.nome, 'quantidade', ip.quantidade, 'preco', ip.preco_unitario_no_pedido)) FILTER (WHERE pr.nome IS NOT NULL), '[]') AS itens,
          COALESCE(SUM(ip.quantidade * ip.preco_unitario_no_pedido), 0) AS total
        FROM pedido p
        JOIN cliente c ON p.id_cliente = c.id_cliente
        LEFT JOIN itens_pedido ip ON p.id_pedido = ip.id_pedido
        LEFT JOIN produto pr ON ip.id_produto = pr.id_produto
        GROUP BY p.id_pedido, c.nome, c.email, c.telefone
        ORDER BY p.criado_em DESC
      `);
      res.status(200).json(rows);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err.stack);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },
 
  updateOrderStatus: async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const validStatus = ['Recebido', 'Em Separação', 'Pronto para Retirada', 'Retirado', 'Cancelado'];
      if (!validStatus.includes(status)) return res.status(400).json({ message: 'Status inválido.' });
      const { rows } = await db.query('UPDATE pedido SET status_pedido = $1 WHERE id_pedido = $2 RETURNING *', [status, id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Pedido não encontrado.' });
      res.status(200).json(rows[0]);
    } catch (err) {
      console.error('Erro ao atualizar status:', err.stack);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  }
};
 
module.exports = orderController;