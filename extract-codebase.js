const fs = require('fs');
const path = require('path');

// Configuration
const extensions = ['.tsx', '.ts', '.js', '.jsx', '.json', '.md', '.css', '.mjs'];
const excludeDirs = ['node_modules', '.next', '.git', 'dist', 'build', '.vercel', 'public'];
const maxFileSize = 600 * 1024; // 600KB per file (smaller for better AI processing)

// Enhanced file categorization for 5-part split
const fileCategories = {
    config: {
        name: 'Configuration & Setup',
        patterns: ['package.json', 'next.config', 'tailwind.config', 'tsconfig', '.env', 'vercel.json', 'components.json', 'postcss.config', 'eslint'],
        priority: 1,
        description: 'Project configuration, dependencies, and build setup files'
    },
    core: {
        name: 'Core App Structure',
        patterns: ['app/layout.tsx', 'app/page.tsx', 'app/loading.tsx', 'app/globals.css', 'app/not-found'],
        priority: 2,
        description: 'Root app files, main layouts, and global application structure'
    },
    pages: {
        name: 'Pages & Routes',
        patterns: ['app/(main)/', 'app/setup/', '/page.tsx', '/layout.tsx', 'action.ts'],
        priority: 3,
        description: 'Application pages, routing, and page-specific components'
    },
    components: {
        name: 'UI Components',
        patterns: ['components/ui/', 'components/auth/', 'components/mobile/', 'components/maps/', 'components/onboarding/', 'components/core/'],
        priority: 4,
        description: 'Reusable UI components, authentication, and feature-specific components'
    },
    utils: {
        name: 'Utilities & Services',
        patterns: ['lib/', 'hooks/', 'contexts/', 'types/', 'utils/', 'services/', 'store/', 'providers/'],
        priority: 5,
        description: 'Utility functions, custom hooks, contexts, type definitions, and services'
    }
};

function getAllFiles(dirPath, arrayOfFiles = []) {
    try {
        const files = fs.readdirSync(dirPath);
        
        files.forEach(file => {
            const fullPath = path.join(dirPath, file);
            
            if (fs.statSync(fullPath).isDirectory()) {
                if (!excludeDirs.includes(file) && !file.startsWith('.')) {
                    arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
                }
            } else {
                const ext = path.extname(file);
                if (extensions.includes(ext)) {
                    arrayOfFiles.push(fullPath);
                }
            }
        });
    } catch (error) {
        console.log(`Error reading directory ${dirPath}:`, error.message);
    }
    
    return arrayOfFiles;
}

function categorizeFile(filePath) {
    const normalizedPath = filePath.replace(/\\/g, '/').toLowerCase();
    const fileName = path.basename(filePath).toLowerCase();
    
    // Check each category's patterns
    for (const [key, category] of Object.entries(fileCategories)) {
        for (const pattern of category.patterns) {
            if (normalizedPath.includes(pattern.toLowerCase())) {
                return key;
            }
        }
    }
    
    // Enhanced fallback logic
    if (normalizedPath.includes('app/') && !normalizedPath.includes('app/(main)/')) {
        return 'core';
    }
    if (normalizedPath.includes('app/(main)/') || normalizedPath.includes('/page.tsx')) {
        return 'pages';
    }
    if (normalizedPath.includes('components/')) {
        return 'components';
    }
    if (normalizedPath.includes('lib/') || normalizedPath.includes('hooks/') || 
        normalizedPath.includes('contexts/') || normalizedPath.includes('types/')) {
        return 'utils';
    }
    
    // Default to config for unknown files
    return 'config';
}

function formatFileContent(filePath, content) {
    const relativePath = path.relative('.', filePath).replace(/\\/g, '/');
    const ext = path.extname(filePath).slice(1);
    
    let output = `\n## File: ${relativePath}\n\n`;
    output += `\`\`\`${ext}\n`;
    output += content;
    output += '\n```\n';
    
    return output;
}

function createProjectStructure(files) {
    let structure = '## Project Structure:\n```\n';
    
    // Sort files for better readability
    const sortedFiles = files
        .map(f => path.relative('.', f).replace(/\\/g, '/'))
        .sort();
    
    // Group by directory
    const dirStructure = {};
    sortedFiles.forEach(file => {
        const parts = file.split('/');
        let current = dirStructure;
        
        parts.forEach((part, index) => {
            if (index === parts.length - 1) {
                // It's a file
                if (!current._files) current._files = [];
                current._files.push(part);
            } else {
                // It's a directory
                if (!current[part]) current[part] = {};
                current = current[part];
            }
        });
    });
    
    function printStructure(obj, indent = '') {
        let result = '';
        
        // Print directories first
        Object.keys(obj).filter(k => k !== '_files').sort().forEach(key => {
            result += `${indent}📁 ${key}/\n`;
            result += printStructure(obj[key], indent + '  ');
        });
        
        // Print files
        if (obj._files) {
            obj._files.sort().forEach(file => {
                const ext = path.extname(file);
                const icon = getFileIcon(ext);
                result += `${indent}${icon} ${file}\n`;
            });
        }
        
        return result;
    }
    
    structure += printStructure(dirStructure);
    structure += '```\n\n';
    
    return structure;
}

function getFileIcon(ext) {
    const icons = {
        '.tsx': '⚛️',
        '.ts': '🔷',
        '.js': '🟨',
        '.jsx': '⚛️',
        '.json': '📋',
        '.md': '📝',
        '.css': '🎨',
        '.mjs': '🟨'
    };
    return icons[ext] || '📄';
}

function extractCodebase() {
    console.log('🚀 Starting enhanced codebase extraction (5-part split)...\n');
    
    // Get all files
    const allFiles = getAllFiles('.');
    console.log(`📁 Found ${allFiles.length} files to process`);
    
    // Categorize files
    const categorizedFiles = {
        config: [],
        core: [],
        pages: [],
        components: [],
        utils: []
    };
    
    allFiles.forEach(file => {
        const category = categorizeFile(file);
        categorizedFiles[category].push(file);
    });
    
    // Print categorization summary
    console.log('\n📊 File categorization:');
    Object.entries(categorizedFiles).forEach(([category, files]) => {
        console.log(`  ${fileCategories[category].name}: ${files.length} files`);
    });
    
    // Create project structure (shared across all files)
    const projectStructure = createProjectStructure(allFiles);
    
    // Create header template
    const createHeader = (partNumber, category) => {
        const categoryInfo = fileCategories[category];
        return `# XphoraPulse Codebase - Part ${partNumber}: ${categoryInfo.name}

This is part ${partNumber} of 5 of the XphoraPulse codebase.

## About This Part
${categoryInfo.description}

${projectStructure}

---

# Code Files

`;
    };
    
    // Generate each part
    Object.entries(categorizedFiles).forEach(([category, files], index) => {
        const partNumber = index + 1;
        const fileName = `codebase_part${partNumber}_${category}.txt`;
        
        let content = createHeader(partNumber, category);
        let currentSize = Buffer.byteLength(content, 'utf8');
        let includedFiles = 0;
        let skippedFiles = [];
        
        console.log(`\n📝 Creating ${fileName}...`);
        
        // Sort files by importance (smaller/config files first)
        const sortedFiles = files.sort((a, b) => {
            const aSize = getFileSize(a);
            const bSize = getFileSize(b);
            const aPriority = getFilePriority(a);
            const bPriority = getFilePriority(b);
            
            if (aPriority !== bPriority) return aPriority - bPriority;
            return aSize - bSize;
        });
        
        sortedFiles.forEach(file => {
            try {
                const fileContent = fs.readFileSync(file, 'utf8');
                const formattedContent = formatFileContent(file, fileContent);
                const contentSize = Buffer.byteLength(formattedContent, 'utf8');
                
                // Check if adding this file would exceed the limit
                if (currentSize + contentSize > maxFileSize && includedFiles > 0) {
                    skippedFiles.push({
                        file: path.relative('.', file),
                        size: Math.round(contentSize / 1024)
                    });
                    return;
                }
                
                content += formattedContent;
                currentSize += contentSize;
                includedFiles++;
                
            } catch (error) {
                console.log(`  ⚠️  Error reading ${file}: ${error.message}`);
                skippedFiles.push({
                    file: path.relative('.', file),
                    error: error.message
                });
            }
        });
        
        // Add summary at the end
        if (skippedFiles.length > 0) {
            content += `\n---\n\n## Skipped Files (size limit exceeded)\n\n`;
            skippedFiles.forEach(item => {
                if (item.error) {
                    content += `- ❌ ${item.file} (Error: ${item.error})\n`;
                } else {
                    content += `- 📦 ${item.file} (${item.size}KB)\n`;
                }
            });
        }
        
        content += `\n---\n\n**Part ${partNumber} Summary:**\n`;
        content += `- Files included: ${includedFiles}\n`;
        content += `- Files skipped: ${skippedFiles.length}\n`;
        content += `- Total size: ${Math.round(currentSize / 1024)}KB\n`;
        
        // Write file
        fs.writeFileSync(fileName, content, 'utf8');
        
        console.log(`  ✅ ${fileName} created`);
        console.log(`     📊 ${includedFiles} files, ${Math.round(currentSize / 1024)}KB`);
        if (skippedFiles.length > 0) {
            console.log(`     ⚠️  ${skippedFiles.length} files skipped due to size limit`);
        }
    });
    
    // Create enhanced index file
    createIndexFile();
    
    console.log('\n🎉 Enhanced extraction complete!');
    console.log('\n📋 Generated files:');
    console.log('  1. codebase_part1_config.txt - Configuration & setup files');
    console.log('  2. codebase_part2_core.txt - Core app structure & layouts');
    console.log('  3. codebase_part3_pages.txt - Application pages & routes');
    console.log('  4. codebase_part4_components.txt - UI components & features');
    console.log('  5. codebase_part5_utils.txt - Utilities, hooks & services');
    console.log('  6. codebase_index.txt - Overview & usage guide');
}

function getFileSize(filePath) {
    try {
        return fs.statSync(filePath).size;
    } catch {
        return 0;
    }
}

function getFilePriority(filePath) {
    const fileName = path.basename(filePath).toLowerCase();
    
    // High priority files (include first)
    if (['package.json', 'next.config.mjs', 'layout.tsx', 'page.tsx'].includes(fileName)) {
        return 1;
    }
    
    // Medium priority
    if (fileName.includes('config') || fileName.includes('index')) {
        return 2;
    }
    
    // Low priority (large files, less critical)
    return 3;
}

function createIndexFile() {
    const indexContent = `# XphoraPulse Codebase - Complete Guide (5-Part Split)

This codebase has been split into 5 focused parts for optimal AI processing and development workflow:

## 📁 Part 1: Configuration & Setup (codebase_part1_config.txt)
**Use this for:** Understanding project setup, dependencies, and build configuration
- package.json - Dependencies and scripts
- next.config.mjs - Next.js configuration  
- tailwind.config.ts - Styling configuration
- TypeScript, ESLint, and build configs
- Environment variable templates

## 🏗️ Part 2: Core App Structure (codebase_part2_core.txt)
**Use this for:** Understanding main app architecture and root-level structure
- Root layout.tsx and page.tsx
- Global CSS and styling
- App-level loading and error handling
- Core application initialization

## 📄 Part 3: Pages & Routes (codebase_part3_pages.txt)
**Use this for:** Understanding application routing and page-level components
- All application pages (dashboard, alerts, chat, etc.)
- Route layouts and page structures
- Server actions and page-specific logic
- Navigation and routing patterns

## 🧩 Part 4: UI Components (codebase_part4_components.txt)
**Use this for:** Understanding UI components and feature implementations
- Reusable UI components (buttons, forms, etc.)
- Authentication components
- Mobile-specific components
- Maps and visualization components
- Feature-specific component groups

## ⚙️ Part 5: Utilities & Services (codebase_part5_utils.txt)
**Use this for:** Understanding business logic, data handling, and utilities
- Custom React hooks
- Context providers and state management
- Utility functions and helpers
- Service layer implementations
- Type definitions and interfaces

## 💡 How to Use These Files

### For AI Chat/Analysis:
1. **Start with Part 1** for project setup and configuration questions
2. **Use Part 2** for understanding the overall app architecture
3. **Use Part 3** for questions about specific pages or routing
4. **Use Part 4** for UI component development and styling
5. **Use Part 5** for business logic, data flow, and utility functions

### For Development Workflow:
1. **Part 1** - Setting up the development environment
2. **Part 2** - Modifying app-wide behavior and global styles
3. **Part 3** - Adding new pages or modifying existing routes
4. **Part 4** - Building new components or updating UI
5. **Part 5** - Implementing business logic and data processing

### For Code Review:
Each part focuses on a specific aspect of the application, making it easier to:
- Review configuration changes (Part 1)
- Assess architectural decisions (Part 2)  
- Evaluate page implementations (Part 3)
- Check component design (Part 4)
- Validate business logic (Part 5)

## 🔍 Quick Reference

**Total Files Processed:** ${getAllFiles('.').length}
**Generated:** ${new Date().toLocaleString()}
**Project:** XphoraPulse - Multi-Agent City Intelligence Platform
**Split Strategy:** 5-part logical organization for optimal processing

## 📝 File Size Optimization

Each part is optimized to stay under 600KB for efficient AI processing while maintaining:
- Complete file contents with syntax highlighting
- Logical grouping of related functionality
- Minimal overlap between parts
- Maximum context preservation

---

*This enhanced 5-part split provides better separation of concerns and 
more focused context for both AI analysis and human development.*
`;

    fs.writeFileSync('codebase_index.txt', indexContent, 'utf8');
}

// Run the extraction
if (require.main === module) {
    extractCodebase();
}

module.exports = { extractCodebase };