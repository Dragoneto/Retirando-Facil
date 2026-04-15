import ProductModel from '../models/ProductModel';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

class ProductController {

  static async getAllProducts() {
    try {
      const response = await fetch(`${API_URL}/produtos`);

      if (!response.ok) {
        throw new Error('Erro ao buscar produtos da API');
      }

      const data = await response.json();

      const products = data.map(productData => new ProductModel({
        id: productData.id,
        nome: productData.nome,
        categoria: productData.categoria,
        preco: productData.preco,
        estoque: productData.estoque,
        descricao: productData.descricao,
        imageUrl: productData.imageUrl,
      }));

      return products;

    } catch (error) {
      console.error("Falha no ProductController (Front-end):", error);
      return [];
    }
  }
}

export default ProductController;