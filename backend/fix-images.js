const { Pool } = require('pg');

const p = new Pool({
  connectionString: 'postgresql://davi_alencar_guimaraes_de_almeida_user:3LH3ElulpqHutNh0j5kkVsmgxHC8DzaF@dpg-d7ffgnpf9bms73a5ndcg-a.ohio-postgres.render.com/davi_alencar_guimaraes_de_almeida?sslmode=require'
});

async function fix() {
  await p.query(`UPDATE produto SET image_url = 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80' WHERE nome = 'Calca Social Feminina'`);
  await p.query(`UPDATE produto SET image_url = 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400&q=80' WHERE nome = 'Camisa Polo Feminina'`);
  await p.query(`UPDATE produto SET image_url = 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&q=80' WHERE nome = 'Meias Escolares Kit 3 pares'`);
  await p.query(`UPDATE produto SET image_url = 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f?w=400&q=80' WHERE nome = 'Saia Xadrez Feminina'`);
  console.log('Imagens corrigidas!');
}

fix().catch(e => console.error('Erro:', e.message)).finally(() => p.end());
