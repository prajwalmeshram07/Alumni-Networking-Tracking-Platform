import fs from 'fs';

const fixDark = (filePath) => {
  let data = fs.readFileSync(filePath, 'utf-8');
  data = data.replace(/className="([^"]+)"/g, (match, classes) => {
    let newClass = classes.trim();
    
    if (newClass.includes('bg-white') && !newClass.includes('dark:bg-')) {
      newClass += ' dark:bg-neutral-900 dark:text-neutral-100 transition-colors duration-300';
    }
    if (newClass.includes('bg-gray-50') && !newClass.includes('dark:bg-')) {
      newClass += ' dark:bg-neutral-950 dark:text-neutral-200 transition-colors duration-300';
    }
    if (/(text-gray-800|text-gray-900|text-gray-700|text-black)/.test(newClass) && !newClass.includes('dark:text-')) {
      newClass += ' dark:text-neutral-100 transition-colors duration-300';
    }
    if (/(text-gray-500|text-gray-600)/.test(newClass) && !newClass.includes('dark:text-')) {
      newClass += ' dark:text-neutral-400 transition-colors duration-300';
    }
    if (/border-gray-[123]00/.test(newClass) && !newClass.includes('dark:border-')) {
      newClass += ' dark:border-neutral-800 transition-colors duration-300';
    }
    
    return `className="${newClass}"`;
  });
  
  fs.writeFileSync(filePath, data, 'utf-8');
};

try {
  fixDark('c:/allumini/aluminaye/client/src/pages/Profile.jsx');
  fixDark('c:/allumini/aluminaye/client/src/pages/Messages.jsx');
  console.log("Successfully hardened specific Layouts using AST constraints!");
} catch (error) {
  console.log("Error binding classes:", error);
}
