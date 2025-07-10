import paddle from '@/lib/paddle';

async function cleanupFreeTrialProducts() {
  try {
    console.log('Starting cleanup of Free Trial products from Paddle...');
    
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
    
    console.log(`Found ${freeTrialProducts.length} Free Trial products in Paddle`);
    
    // Delete each Free Trial product
    for (const product of freeTrialProducts) {
      try {
        console.log(`Deleting product: ${product.name} (${product.id})`);
        await paddle.products.delete(product.id);
        console.log(`Successfully deleted product: ${product.name}`);
      } catch (error) {
        console.error(`Failed to delete product ${product.name}:`, error.message);
      }
    }
    
    console.log('Cleanup completed!');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Run the cleanup
cleanupFreeTrialProducts(); 