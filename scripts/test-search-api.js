// Script to test the search API directly
require('dotenv').config();

async function testSearchAPI() {
  try {
    console.log('Testing search API...');
    
    const searchQuery = 'Software engineer with React experience';
    
    console.log(`Search query: "${searchQuery}"`);
    
    const response = await fetch('http://localhost:3000/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        searchQuery,
        filters: {},
        page: 1,
        pageSize: 10,
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned ${response.status}: ${errorText}`);
    }
    
    const data = await response.json();
    
    console.log('\nSearch results:');
    console.log(`Total results: ${data.totalResults}`);
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((result, index) => {
        console.log(`\n${index + 1}. ID: ${result.id}`);
        console.log(`   Score: ${result.score?.toFixed(4) || 'N/A'}`);
        console.log(`   Title: ${result.title || result.metadata?.title || 'N/A'}`);
        console.log(`   Category: ${result.category || result.metadata?.category || 'N/A'}`);
        
        // Print additional data if available
        if (result.metadata && result.metadata.content) {
          console.log(`   Content Preview: ${result.metadata.content.substring(0, 100)}...`);
        }
      });
    } else {
      console.log('No results found.');
    }
    
    console.log('\nTest completed successfully');
  } catch (error) {
    console.error('Error testing search API:', error);
  }
}

testSearchAPI();