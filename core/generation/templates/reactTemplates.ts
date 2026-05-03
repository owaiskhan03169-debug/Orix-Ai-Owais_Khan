/**
 * React Component Templates
 * 
 * Templates for generating React components.
 */

import { ComponentDefinition } from '../../planning';

export function generateMainTsx(): string {
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
}

export function generateAppTsx(plan: any): string {
  const hasRouter = plan.routes && plan.routes.length > 1;

  if (hasRouter) {
    return `import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './layouts/Layout';
${plan.routes.map((r: any) => `import { ${r.component} } from './pages/${r.component}';`).join('\n')}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
${plan.routes.map((r: any) => `          <Route path="${r.path}" element={<${r.component} />} />`).join('\n')}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
`;
  }

  return `import { Layout } from './layouts/Layout';
import { Home } from './pages/Home';

function App() {
  return (
    <Layout>
      <Home />
    </Layout>
  );
}

export default App;
`;
}

export function generateIndexCss(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: rgba(255, 255, 255, 0.87);
  background-color: #242424;

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}
`;
}

export function generateComponent(component: ComponentDefinition): string {
  const hasState = component.state.length > 0;
  const hasProps = component.props.length > 0;
  
  // Generate imports
  const imports = ['import React'];
  if (hasState || component.hooks.length > 0) {
    const hooks = ['useState', ...component.hooks.filter(h => h !== 'useState')];
    imports.push(`import { ${hooks.join(', ')} } from 'react'`);
  }

  // Generate props interface
  let propsInterface = '';
  if (hasProps) {
    propsInterface = `
interface ${component.name}Props {
${component.props.map(p => `  ${p.name}${p.required ? '' : '?'}: ${p.type};`).join('\n')}
}
`;
  }

  // Generate component
  const propsParam = hasProps ? `{ ${component.props.map(p => p.name).join(', ')} }: ${component.name}Props` : '';

  // Generate state declarations
  const stateDeclarations = component.state.map(s => 
    `  const [${s.name}, set${s.name.charAt(0).toUpperCase() + s.name.slice(1)}] = useState<${s.type}>(${s.initial});`
  ).join('\n');

  return `${imports.join(';\n')};
${propsInterface}
export function ${component.name}(${propsParam}) {
${stateDeclarations ? stateDeclarations + '\n' : ''}
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">${component.name}</h2>
      <p className="text-gray-600">${component.description}</p>
      {/* TODO: Implement ${component.name} component */}
    </div>
  );
}
`;
}

export function generateLayoutComponent(): string {
  return `import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
`;
}

export function generateHeaderComponent(): string {
  return `import React from 'react';
import { Navigation } from './Navigation';

export function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">
            Logo
          </div>
          <Navigation />
        </div>
      </div>
    </header>
  );
}
`;
}

export function generateNavigationComponent(routes: any[]): string {
  return `import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
${routes.map(r => `    { path: '${r.path}', label: '${r.title}' },`).join('\n')}
  ];

  return (
    <nav>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Desktop menu */}
      <ul className="hidden md:flex items-center gap-6">
        {navItems.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile menu */}
      {isOpen && (
        <ul className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg py-4">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}
`;
}

export function generateFooterComponent(): string {
  return `import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-400">
            © {new Date().getFullYear()} All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Built with Orix-AI
          </p>
        </div>
      </div>
    </footer>
  );
}
`;
}

export function generatePageComponent(pageName: string): string {
  return `import React from 'react';

export function ${pageName}() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">${pageName}</h1>
      <p className="text-lg text-gray-600">
        Welcome to the ${pageName} page.
      </p>
      {/* TODO: Implement ${pageName} page content */}
    </div>
  );
}
`;
}

// Made with Bob