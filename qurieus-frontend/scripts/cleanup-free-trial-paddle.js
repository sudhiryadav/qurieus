import paddle from '@/lib/paddle';

async function cleanupFreeTrialProducts() {
  try {
    
    // List all products
    const productsResponse = await paddle.products.list();
    const products = [];
    for await (const product of productsResponse) {
      products.push(product);
    }
    
    // Find Free Trial products
    const freeTrialProducts = products.filter(product => 
      product.name.toLowerCase().includes('free trial') || 
      product.name.toLowerCase().includes('trial')
    );
    
    
    // Delete each Free Trial product
    for (const product of freeTrialProducts) {
      try {
        await paddle.products.delete(product.id);
      } catch (error) {
      }
    }
    
  } catch (error) {
  }
}

// Run the cleanup
cleanupFreeTrialProducts(); 