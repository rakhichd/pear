const fs = require('fs');
const path = require('path');

// Base paths
const PDF_BASE_PATH = path.join(__dirname, '../data/resumes/archive/data/data');
const PUBLIC_PDF_PATH = path.join(__dirname, '../public/pdfs/resumes');

// Define category directories to process
const CATEGORY_DIRS = [
  'ENGINEERING', 'INFORMATION-TECHNOLOGY', 'SALES', 'FINANCE', 'BUSINESS-DEVELOPMENT',
  'HEALTHCARE', 'TEACHER', 'DESIGNER', 'DIGITAL-MEDIA', 'HR', 'ACCOUNTANT', 'ARTS',
  'ADVOCATE', 'BANKING', 'CONSULTANT', 'PUBLIC-RELATIONS', 'FITNESS', 'CHEF', 'BPO',
  'APPAREL', 'AVIATION', 'AUTOMOBILE', 'AGRICULTURE', 'CONSTRUCTION'
];

/**
 * Creates symbolic links for PDF files in the public directory
 */
async function setupPdfSymlinks() {
  try {
    console.log('Setting up PDF symbolic links...');
    
    // First, ensure the base public PDF directory exists
    if (!fs.existsSync(PUBLIC_PDF_PATH)) {
      console.log(`Creating directory: ${PUBLIC_PDF_PATH}`);
      fs.mkdirSync(PUBLIC_PDF_PATH, { recursive: true });
    }
    
    let totalFiles = 0;
    let successCount = 0;
    let errorCount = 0;
    
    // Process each category directory
    for (const category of CATEGORY_DIRS) {
      const sourceCategoryPath = path.join(PDF_BASE_PATH, category);
      const targetCategoryPath = path.join(PUBLIC_PDF_PATH, category);
      
      // Skip if source directory doesn't exist
      if (!fs.existsSync(sourceCategoryPath)) {
        console.log(`Category directory not found: ${sourceCategoryPath}`);
        continue;
      }
      
      // Ensure the target category directory exists
      if (!fs.existsSync(targetCategoryPath)) {
        console.log(`Creating directory: ${targetCategoryPath}`);
        fs.mkdirSync(targetCategoryPath, { recursive: true });
      }
      
      // Get all PDF files in the source directory
      const files = fs.readdirSync(sourceCategoryPath)
        .filter(file => file.toLowerCase().endsWith('.pdf'));
      
      totalFiles += files.length;
      console.log(`Processing ${files.length} PDF files in ${category}...`);
      
      // Create symlinks for each PDF
      for (const file of files) {
        const sourcePath = path.join(sourceCategoryPath, file);
        const targetPath = path.join(targetCategoryPath, file);
        
        // Skip if target already exists
        if (fs.existsSync(targetPath)) {
          // If it's a symlink, make sure it points to the right place
          if (fs.lstatSync(targetPath).isSymbolicLink()) {
            const currentLink = fs.readlinkSync(targetPath);
            if (currentLink === sourcePath) {
              console.log(`Symlink already exists and is correct: ${targetPath}`);
              successCount++;
              continue;
            } else {
              // Remove incorrect symlink
              fs.unlinkSync(targetPath);
            }
          } else {
            // Remove non-symlink file
            fs.unlinkSync(targetPath);
          }
        }
        
        try {
          // Create the symlink
          fs.symlinkSync(sourcePath, targetPath);
          console.log(`Created symlink: ${targetPath} -> ${sourcePath}`);
          successCount++;
        } catch (error) {
          console.error(`Error creating symlink for ${file}:`, error);
          errorCount++;
        }
      }
    }
    
    // Handle Winston's resume separately
    const winstonSource = path.join(__dirname, '../data/resumes/Winston_s_Resume (9).pdf');
    const winstonTarget = path.join(PUBLIC_PDF_PATH, 'PERSONAL', 'Winston_s_Resume (9).pdf');
    
    if (fs.existsSync(winstonSource)) {
      totalFiles++;
      
      // Ensure the PERSONAL directory exists
      const personalDir = path.join(PUBLIC_PDF_PATH, 'PERSONAL');
      if (!fs.existsSync(personalDir)) {
        fs.mkdirSync(personalDir, { recursive: true });
      }
      
      // Create symlink for Winston's resume
      try {
        if (fs.existsSync(winstonTarget)) {
          fs.unlinkSync(winstonTarget);
        }
        
        fs.symlinkSync(winstonSource, winstonTarget);
        console.log(`Created symlink for Winston's resume: ${winstonTarget}`);
        successCount++;
      } catch (error) {
        console.error('Error creating symlink for Winston\'s resume:', error);
        errorCount++;
      }
    }
    
    console.log('\n--- Symlink Setup Summary ---');
    console.log(`Total PDF files: ${totalFiles}`);
    console.log(`Successfully linked: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log('Setup completed');
    
  } catch (error) {
    console.error('Error setting up PDF symlinks:', error);
  }
}

// Run the setup
setupPdfSymlinks(); 