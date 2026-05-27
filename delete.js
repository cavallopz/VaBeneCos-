import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
const lines = code.split('\n');
const start = 931; 
const end = 1276; 
lines.splice(start, end - start + 1);

code = lines.join('\n');
code = code.replace("import { AdminGuard } from './components/AdminGuard';", "import { AdminGuard } from './components/AdminGuard';\nimport { AdminDashboard } from './pages/admin/AdminDashboard';");

fs.writeFileSync('src/App.tsx', code);
