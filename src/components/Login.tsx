
import React, { useState } from 'react';

// Ajuste o caminho da imagem conforme a estrutura do seu projeto
import pneuBrasLogo from '../PneuBras.png'; 

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulação de lógica de login
    // Adapte esta parte para sua autenticação real
    if (isAdmin) {
      if (email === 'sst@pneubras.com.br') { // Senha não é mais necessária aqui
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
          nome: 'Alexandre Esc.',
          email: 'alexandre.esc@gmail.com',
          isAdmin: false,
        });
      } else {
        alert('Credenciais de colaborador inválidas.');
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#0E1A2B]">
      {/* Lado Esquerdo - Informações */}
      <div className="w-1/2 text-white p-12 flex flex-col justify-between">
        <div>
        <div className="flex items-center mb-2">
            <img src={pneuBrasLogo} alt="PneuBras Logo" className="h-10 w-10 mr-3" />
            <div>
              <h1 className="text-xl font-bold">PneuBras</h1>
              <p className="text-sm">SST PORTAL</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-12">SAÚDE, SEGURANÇA E HIGIENE OCUPACIONAL</p>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Padrão corporativo de excelência em segurança e risco zero.
          </h2>
          <p className="text-gray-300">
            Bem-vindo ao Portal de SST integrado da PneuBras e Oficinas PneuDrive. Utilize suas credenciais
            cadastradas na base colaboradora para relatar inspeções físicas, realizar treinamentos de
            conformidade regulatória nas filiais e acompanhar as metas internas.
          </p>
        </div>
        <div className="text-xs text-gray-500">
          <a href="#" className="hover:text-white mr-4">PORTAL-CLIENTE-PNEUBRAS</a>
          <a href="#" className="hover:text-white mr-4">ACESSO-OFICINAS-PNEUDRIVE</a>
          <a href="#" className="hover:text-white">NR-06-REGULAMENTAÇÃO</a>
        </div>
      </div>

      {/* Lado Direito - Formulário de Login */}
      <div className="w-1/2 bg-white flex items-center justify-center p-12">
        <div className="w-full max-w-md">
          <p className="text-sm font-semibold text-green-600">SST CORPORATIVO</p>
          <h3 className="text-2xl font-bold mt-2">Autenticação de Usuário</h3>
          <p className="text-gray-500 mt-1 mb-6">
            Informe suas credenciais para acessar os formulários técnicos ou painel executivo de indicadores.
          </p>

          <div className="flex border-b mb-6">
            <button
              onClick={() => setIsAdmin(false)}
              className={`py-2 px-4 text-sm font-medium ${
                !isAdmin ? 'border-b-2 border-black text-black' : 'text-gray-500'
              }`}
            >
              Acesso Colaborador
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={`py-2 px-4 text-sm font-medium ${
                isAdmin ? 'border-b-2 border-black text-black' : 'text-gray-500'
              }`}
            >
              Modo Administrador
            </button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-600 mb-2">
                E-MAIL CORPORATIVO DO {isAdmin ? 'ADMINISTRADOR' : 'COLABORADOR'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.nome@pneubras.com.br / @pneudrive..."
                className="w-full px-4 py-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Acesso garantido para {isAdmin ? 'administradores' : 'colaboradores'} cadastrados na base.
              </p>
            </div>
            
            {/* O campo de senha foi removido conforme a imagem */}

            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-3 rounded-md hover:bg-gray-800 transition-colors"
            >
              Entrar como {isAdmin ? 'Administrador' : 'Colaborador'} &rarr;
            </button>
          </form>

          <div className="mt-6 border rounded-md p-4 text-xs text-gray-600">
            <p className="font-bold mb-2">CREDENCIAS DE DEMONSTRAÇÃO / HOMOLOGAÇÃO:</p>
            <p>- Colaborador ativo (Matriz): alexandre.esc@gmail.com</p>
            <p>- Administrador: sst@pneubras.com.br / senha: admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
