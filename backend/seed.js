const { Pool } = require('pg');

const p = new Pool({
  connectionString: 'postgresql://davi_alencar_guimaraes_de_almeida_user:3LH3ElulpqHutNh0j5kkVsmgxHC8DzaF@dpg-d7ffgnpf9bms73a5ndcg-a.ohio-postgres.render.com/davi_alencar_guimaraes_de_almeida?sslmode=require'
});

async function setup() {
  await p.query(`
    CREATE TABLE IF NOT EXISTS cliente (
      id_cliente SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      telefone VARCHAR(20),
      email VARCHAR(255) UNIQUE NOT NULL,
      criado_em TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS produto (
      id_produto SERIAL PRIMARY KEY,
      nome VARCHAR(255) NOT NULL,
      categoria VARCHAR(100),
      preco DECIMAL(10,2) NOT NULL,
      estoque_disponivel INTEGER NOT NULL DEFAULT 0,
      descricao TEXT,
      image_url TEXT,
      criado_em TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS horario (
      id_horario SERIAL PRIMARY KEY,
      hora_inicio TIME UNIQUE NOT NULL,
      capacidade_maxima INTEGER NOT NULL DEFAULT 10,
      ativo BOOLEAN NOT NULL DEFAULT true
    );
    CREATE TABLE IF NOT EXISTS pedido (
      id_pedido SERIAL PRIMARY KEY,
      id_cliente INTEGER REFERENCES cliente(id_cliente),
      data_retirada_agendada DATE NOT NULL,
      horario_retirada_agendado TIME NOT NULL,
      status_pedido VARCHAR(50) DEFAULT 'Recebido',
      criado_em TIMESTAMP DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS itens_pedido (
      id_item SERIAL PRIMARY KEY,
      id_pedido INTEGER REFERENCES pedido(id_pedido),
      id_produto INTEGER REFERENCES produto(id_produto),
      quantidade INTEGER NOT NULL,
      preco_unitario_no_pedido DECIMAL(10,2) NOT NULL
    );
  `);
  console.log('Tabelas criadas!');

  await p.query(`
    INSERT INTO produto (nome, categoria, preco, estoque_disponivel, descricao, image_url) VALUES
    ('Camisa Polo Masculina', 'Camisas', 59.90, 50, 'Camisa polo manga curta com bordado escolar.', 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&q=80'),
    ('Camisa Polo Feminina', 'Camisas', 59.90, 50, 'Camisa polo manga curta feminina com bordado escolar.', 'https://images.unsplash.com/photo-1594938298603-c8148c4f4089?w=400&q=80'),
    ('Calca Social Masculina', 'Calcas', 89.90, 30, 'Calca social azul marinho resistente.', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80'),
    ('Calca Social Feminina', 'Calcas', 89.90, 30, 'Calca social feminina corte slim.', 'https://images.unsplash.com/photo-1594938374182-a57b87f43d5a?w=400&q=80'),
    ('Saia Xadrez Feminina', 'Saias', 79.90, 35, 'Saia xadrez na altura do joelho.', 'https://images.unsplash.com/photo-1551163943-3f7253a97016?w=400&q=80'),
    ('Tenis Escolar Branco Masculino', 'Calcados', 129.90, 40, 'Tenis branco antiderrapante.', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80'),
    ('Tenis Escolar Branco Feminino', 'Calcados', 129.90, 40, 'Tenis branco feminino confortavel.', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80'),
    ('Mochila Escolar Azul', 'Acessorios', 149.90, 25, 'Mochila com compartimentos organizadores.', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80'),
    ('Meias Escolares Kit 3 pares', 'Acessorios', 29.90, 80, 'Kit 3 pares de meias brancas 100% algodao.', 'https://images.unsplash.com/photo-1614958241565-7a09a9a01e5b?w=400&q=80'),
    ('Cinto Escolar Preto', 'Acessorios', 24.90, 60, 'Cinto de couro sintetico preto.', 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=400&q=80')
    ON CONFLICT DO NOTHING;
  `);
  console.log('10 produtos inseridos!');

  await p.query(`
    INSERT INTO horario (hora_inicio, capacidade_maxima, ativo) VALUES
    ('07:30', 15, true), ('08:00', 15, true), ('09:00', 15, true),
    ('10:00', 15, true), ('11:00', 15, true), ('13:00', 15, true),
    ('14:00', 15, true), ('15:00', 15, true), ('16:00', 15, true), ('17:00', 10, true)
    ON CONFLICT DO NOTHING;
  `);
  console.log('10 horarios inseridos!');
  console.log('Banco configurado com sucesso!');
}

setup().catch(e => console.error('Erro:', e.message)).finally(() => p.end());