import React, { useState } from 'react';

// Mantemos a logo apenas para a versão de celular (mobile)
import LogoPneubras from '../PneuBras.jpeg';
// Importação do seu plano de fundo
import FundoInicial from '../lidia.jpg';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); 
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação "Back-end" com e-mail e senha
    if (isAdmin) {
      if (email === 'sst@pneubras.com.br' && senha === 'admin123') { 
        onLoginSuccess({
          nome: 'Administrador SST',
          email: 'sst@pneubras.com.br',
          isAdmin: true,
        });
      } else {
        alert('E-mail ou senha de administrador inválidos.');
      }
    } else {
      if (email === 'alexandre.esc@gmail.com' && senha === 'colab123') {
        onLoginSuccess({
          nome: 'Alexandre Rêgo',
          email: 'alexandre.esc@gmail.com',
          isAdmin: false,
        });
      } else {
        alert('E-mail ou senha de colaborador inválidos.');
      }
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* Lado Esquerdo - Ocupa todo o espaço restante */}
      <div className="hidden lg:flex flex-1 relative flex-col justify-end bg-slate-900">
        
        {/* Imagem preenchendo a tela toda 
            Foi adicionado 'backgroundPosition: right center'. 
            Isso "cola" a imagem no painel direito, evitando que o capacete e as logos sejam cortados em monitores grandes.
        */}
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundImage: `url(${FundoInicial})`,
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat'
          }}
        ></div>
        
        {/* Gradiente escuro inferior suave para dar leitura aos textos sem embaçar a imagem */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/30 to-transparent pointer-events-none z-0"></div>

        {/* Textos de rodapé */}
        <div className="relative z-10 p-10 xl:p-14 max-w-3xl">
          <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mb-3">
            Saúde, Segurança e Higiene Ocupacional
          </p>
          <h2 className="text-3xl xl:text-4xl font-extrabold leading-tight mb-4 text-white drop-shadow-md">
            Padrão corporativo de excelência em <span className="text-emerald-500">segurança</span> e risco zero.
          </h2>
          <p className="text-slate-200 text-sm xl:text-base leading-relaxed mb-8 drop-shadow">
            Bem-vindo ao Portal de SST integrado da PneuBras e Oficinas PneuDrive. Utilize suas credenciais
            cadastradas na base colaboradora para relatar inspeções físicas, realizar treinamentos de
            conformidade regulatória e acompanhar as metas internas.
          </p>
          
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] xl:text-xs text-slate-300 font-bold uppercase tracking-widest">
            <span className="hover:text-emerald-400 transition-colors cursor-pointer">Portal Cliente PneuBras</span>
            <span className="hover:text-emerald-400 transition-colors cursor-pointer">Acesso PneuDrive</span>
            <span className="hover:text-emerald-400 transition-colors cursor-pointer">NR-06 Regulamentação</span>
          </div>
        </div>
      </div>

      {/* Lado Direito - Largura Fixa */}
      <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 bg-white flex flex-col justify-center p-8 sm:p-10 shadow-[-20px_0_40px_-10px_rgba(0,0,0,0.15)] z-10 relative">
        <div className="w-full max-w-sm mx-auto">
          
          {/* Logo Mobile (Só aparece em telas pequenas) */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
              <img src={LogoPneubras} alt="PneuBras Logo" className="h-10 w-auto object-contain" />
            </div>
          </div>

          <div className="mb-8">
            <p className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase mb-1.5">Acesso Restrito</p>
            <h3 className="text-3xl font-extrabold text-slate-900">Autenticação</h3>
            <p className="text-slate-500 mt-2 text-xs leading-relaxed">
              Informe suas credenciais para acessar os painéis operacionais e gerenciais de SST.
            </p>
          </div>

          {/* Toggle de Tipo de Acesso */}
          <div className="flex p-1 bg-slate-100/80 rounded-lg mb-8 border border-slate-200/80">
            <button
              type="button"
              onClick={() => { setIsAdmin(false); setEmail(''); setSenha(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all duration-200 ${
                !isAdmin ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Colaborador
            </button>
            <button
              type="button"
              onClick={() => { setIsAdmin(true); setEmail(''); setSenha(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-md transition-all duration-200 ${
                isAdmin ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/50' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Administrador
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                E-mail Corporativo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAdmin ? "admin@pneubras.com.br" : "seu.nome@pneubras.com.br"}
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 text-sm font-medium placeholder-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
                Senha de Acesso
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-5 py-3.5 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 text-sm font-medium placeholder-slate-400"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full bg-slate-900 text-white text-sm font-bold py-3.5 rounded-lg hover:bg-slate-800 active:scale-[0.98] transition-all flex justify-center items-center space-x-2 shadow-md hover:shadow-lg mt-2"
            >
              <span>Acessar Painel</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          </form>

          {/* Área de credenciais de homologação */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Homologação (Apenas E-mails)</p>
            <div className="bg-slate-50/80 rounded-lg p-3 border border-slate-200/60 text-[10px] text-slate-600 space-y-2.5">
              <p className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Colaborador</span> 
                <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200">alexandre.esc@gmail.com</span>
              </p>
              <p className="flex justify-between items-center">
                <span className="font-semibold text-slate-700">Gestor SST</span> 
                <span className="font-mono bg-white px-2 py-1 rounded border border-slate-200">sst@pneubras.com.br</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}