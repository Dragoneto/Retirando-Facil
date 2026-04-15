const { Pool } = require('pg');

const p = new Pool({
  connectionString: 'postgresql://davi_alencar_guimaraes_de_almeida_user:3LH3ElulpqHutNh0j5kkVsmgxHC8DzaF@dpg-d7ffgnpf9bms73a5ndcg-a.ohio-postgres.render.com/davi_alencar_guimaraes_de_almeida?sslmode=require'
});

async function fix() {
  await p.query(`UPDATE produto SET image_url = 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=400&q=80' WHERE nome = 'Meias Escolares Kit 3 pares'`);
  console.log('Meias atualizada!');

  await p.query(`UPDATE produto SET image_url = 'https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=400&q=80' WHERE nome = 'Camisa Polo Feminina'`);
  console.log('Polo Feminina atualizada!');
}

fix().catch(e => console.error('Erro:', e.message)).finally(() => p.end());
