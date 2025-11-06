export const store = {
  state: { products: [] },
  setProducts(list) {
    this.state.products = Array.isArray(list) ? list : [];
  },
  getProducts() {
    return this.state.products;
  },
};
