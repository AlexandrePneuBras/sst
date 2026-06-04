import React, { useState } from 'react';

// Caminho corrigido: volta uma pasta (..) saindo de 'components' para 'src'
import LogoPneubras from '../PneuBras.jpeg';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isAdmin) {
      if (email === 'sst@pneubras.com.br') { 
        onLoginSuccess({
          nome: 'Administrador SST',
          email: 'sst@pneubras.com.br',
          isAdmin: true,
        });
      } else {
        alert('Credenciais de administrador inválidas.');
      }
    } else {
      if (email === 'alexandre.esc@gmail.com') {
        onLoginSuccess({
          nome: 'Alexandre Rêgo',
          email: 'alexandre.esc@gmail.com',
          isAdmin: false,
        });
      } else {
        alert('Credenciais de colaborador inválidas.');
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 font-sans">
      {/* Lado Esquerdo - Informações e Branding (Oculto no Mobile) */}
      <div className="hidden lg:flex w-1/2 text-white p-16 flex-col justify-between relative overflow-hidden bg-[#0B1120] border-r border-slate-800">
        
        {/* Efeito de luz sutil no fundo */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-900/10 to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center mb-10">
            {/* Container branco para dar contraste à logomarca escura */}
            <div className="bg-white px-4 py-2 rounded-xl shadow-lg mr-5">
              <img src={LogoPneubras} alt="PneuBras Logo" className="h-10 w-auto object-contain" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">Portal Integrado</h1>
              <p className="text-[10px] text-emerald-500 font-bold tracking-widest mt-0.5">SST CORPORATIVO</p>
            </div>
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 text-slate-100">
            Padrão de excelência em <span className="text-emerald-500">segurança</span> e risco zero.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
            Bem-vindo ao ambiente seguro da PneuBras e PneuDrive. Centralize suas inspeções, formulários de conformidade regulatória e métricas de desempenho em um único lugar.
          </p>
        </div>

        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex space-x-6 relative z-10">
          <span className="hover:text-emerald-400 transition-colors cursor-pointer">Portal Cliente</span>
          <span className="hover:text-emerald-400 transition-colors cursor-pointer">Oficinas PneuDrive</span>
          <span className="hover:text-emerald-400 transition-colors cursor-pointer">Diretrizes NRs</span>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-full lg:w-1/2 bg-slate-50 flex items-center justify-center p-8 sm:p-12 relative">
        <div className="w-full max-w-md bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-200/60">
          
          {/* Logo Mobile (Aparece apenas em telas pequenas) */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
              <img src={LogoPneubras} alt="PneuBras Logo" className="h-12 w-auto object-contain" />
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[11px] font-bold text-emerald-600 tracking-widest uppercase mb-1">Acesso Restrito</p>
            <h3 className="text-3xl font-extrabold text-slate-900">Autenticação</h3>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              Informe suas credenciais para acessar os painéis operacionais e gerenciais de SST.
            </p>
          </div>

          {/* Toggle de Tipo de Acesso */}
          <div className="flex p-1 bg-slate-100/80 rounded-xl mb-8 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setIsAdmin(false)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                !isAdmin ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Colaborador
            </button>
            <button
              type="button"
              onClick={() => setIsAdmin(true)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-200 ${
                isAdmin ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Administrador
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                E-mail Corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdmin ? "admin@pneubras.com.br" : "seu.nome@pneubras.com.br"}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-slate-800 font-medium placeholder-slate-400"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 active:scale-[0.98] transition-all flex justify-center items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <span>Acessar Painel</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Credenciais de Demonstração</p>
            <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/60 text-xs text-slate-600 space-y-2">
              <p className="flex justify-between items-center"><span className="font-semibold text-slate-700">Colaborador</span> <span className="font-mono text-[11px] bg-white px-2 py-1 rounded border border-slate-200">alexandre.esc@gmail.com</span></p>
              <p className="flex justify-between items-center"><span className="font-semibold text-slate-700">Gestor SST</span> <span className="font-mono text-[11px] bg-white px-2 py-1 rounded border border-slate-200">sst@pneubras.com.br</span></p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}