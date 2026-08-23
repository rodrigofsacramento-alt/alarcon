import fs from 'fs';

const filePath = 'c:/Users/Rafael_Livre/Downloads/v8Nova-Indavent-Local-Backup/app/whatsapp/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add TopBar import
if (!content.includes("import { TopBar }")) {
  content = content.replace(
    "import { Sidebar } from '@/components/Sidebar';",
    "import { Sidebar } from '@/components/Sidebar';\nimport { TopBar } from '@/components/TopBar';"
  );
}

// 2. Change main wrapper
content = content.replace(
  '<div className="flex h-screen w-full bg-[#f0f2f5] overflow-hidden sidebar-offset text-slate-900 font-sans">',
  '<div className="flex min-h-screen bg-slate-950 font-sans selection:bg-blue-500/30 text-slate-100">'
);

content = content.replace(
  '<Sidebar />\n      \n      {/* Central de Atendimento Container */}\n      <div className="flex-1 flex flex-col min-w-0 bg-[#f0f2f5] m-0 lg:m-4 lg:rounded-2xl shadow-2xl border border-slate-200/50 overflow-hidden relative">',
  '<Sidebar />\n      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden sidebar-offset">\n        <TopBar title="Central WhatsApp" />\n        <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-8 bg-slate-950 overflow-hidden">\n           <div className="flex-1 flex flex-col min-w-0 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden relative">'
);

// Close the main tag at the end
content = content.replace(
  '      <style jsx global>{`',
  '           </div>\n        </div>\n      </main>\n      <style jsx global>{`'
);

// 3. Global color replacements
content = content.replace(/bg-\[\#f0f2f5\]/g, 'bg-slate-950');
content = content.replace(/bg-\[\#f8f9fa\]/g, 'bg-slate-950');
content = content.replace(/bg-white/g, 'bg-slate-900');
content = content.replace(/bg-\[\#efeae2\]/g, 'bg-slate-950'); // WhatsApp chat bg
content = content.replace(/bg-slate-50/g, 'bg-slate-800/50');
content = content.replace(/bg-slate-100/g, 'bg-slate-800');
content = content.replace(/bg-slate-200/g, 'bg-slate-700');

content = content.replace(/text-\[\#111b21\]/g, 'text-slate-100');
content = content.replace(/text-\[\#41525d\]/g, 'text-slate-200');
content = content.replace(/text-\[\#54656f\]/g, 'text-slate-400');
content = content.replace(/text-\[\#667781\]/g, 'text-slate-400');
content = content.replace(/text-\[\#8696a0\]/g, 'text-slate-500');
content = content.replace(/text-slate-900/g, 'text-slate-100');
content = content.replace(/text-slate-800/g, 'text-slate-200');
content = content.replace(/text-slate-700/g, 'text-slate-300');
content = content.replace(/text-slate-600/g, 'text-slate-300');
content = content.replace(/text-slate-500/g, 'text-slate-400');

content = content.replace(/border-slate-50/g, 'border-slate-800/50');
content = content.replace(/border-slate-100/g, 'border-slate-800');
content = content.replace(/border-slate-200/g, 'border-slate-700');
content = content.replace(/border-slate-300/g, 'border-slate-600');
content = content.replace(/border-\[\#f5f6f6\]/g, 'border-slate-800');

content = content.replace(/bg-\[\#d9fdd3\]/g, 'bg-emerald-600'); // Sent message bg
content = content.replace(/text-\[\#53bdeb\]/g, 'text-blue-400'); // Checkmarks

// Fix specific sections like hover backgrounds that used slate-50/100
content = content.replace(/hover:bg-slate-100/g, 'hover:bg-slate-800');
content = content.replace(/hover:bg-slate-50/g, 'hover:bg-slate-800/50');
content = content.replace(/hover:bg-\[\#f5f6f6\]/g, 'hover:bg-slate-800');

// Fix input backgrounds
content = content.replace(/bg-\[\#f0f2f5\]/g, 'bg-slate-800');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done replacing colors.');
