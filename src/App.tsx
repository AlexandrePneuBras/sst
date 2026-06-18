import React, { useState, useEffect } from 'react';
import {
  Users, Newspaper, Video, GraduationCap, Plus, Trash2,
  ShieldCheck, LayoutDashboard, FileText, Settings, LogOut,
  FolderLock, UserCheck, Menu, X, ArrowLeftRight, CheckCircle2, ShieldAlert,
  Activity, ChevronRight, BarChart3, Cloud, ExternalLink, FileSpreadsheet
} from 'lucide-react';
import { Colaborador, Noticia, InspecaoForm, ConformidadeForm, PilulaTreinamento, QuizRespostum, AppConfig } from './types';
import Login from './components/Login';
import DashboardHome from './components/DashboardHome';
import InspecaoFormulario from './components/InspecaoFormulario';
import ConformidadeFormulario from './components/ConformidadeFormulario';
import GestaoAcessos from './components/GestaoAcessos';
import ColaboradorHome from './components/ColaboradorHome';

// Importação da nova logomarca atualizada
import LogoPneubras from './PneuBras.jpeg';
// Importação do papel de parede
// import imgFundo from '';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAdminViewMode, setIsAdminViewMode] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [inspecoes, setInspecoes] = useState<InspecaoForm[]>([]);
  const [conformidades, setConformidades] = useState<ConformidadeForm[]>([]);
  const [pilulas, setPilulas] = useState<PilulaTreinamento[]>([]);
  const [respostasQuiz, setRespostasQuiz] = useState<QuizRespostum[]>([]);
  const [config, setConfig] = useState<AppConfig>({
    pbiDashboardUrl: '',
    lookerStudioUrl: '',
    gdriveFormsFolderUrl: '',
    gdrivePhotosFolderUrl: ''
  });

  const [loading, setLoading] = useState(true);
  
  // Controle de Abas
  const [activeAdminTab, setActiveAdminTab] = useState<'painel' | 'inspecao' | 'conformidade' | 'dados'>('painel');
  const [activeColaboradorTab, setActiveColaboradorTab] = useState<'noticias' | 'formularios' | 'dialogos'>('noticias');
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const syncDatabase = async () => {
    setTimeout(() => {
      setColaboradores([]);
      
      setNoticias([
        {
          id: 'n3',
          titulo: 'Mudança NR01',
          descricao: 'Mudanças na NR 1 fortalecem o papel do médico do trabalho',
          imageUrl: 'https://cdn.protecao.com.br/wp-content/uploads/2026/02/Capa-site-2026-02-26T132159.526.webp',
          linkOriginal: 'https://protecao.com.br/noticias/geral/mudancas-na-nr-1-fortalecem-o-papel-do-medico-do-trabalho-nas-organizacoes-avalia-diretora-da-anamt/',
          dataCriacao: '28/05/2026'
        }
      ] as any);
      
      setInspecoes([]);
      setConformidades([]);
      
      setPilulas([
        {
          id: 'p1',
          titulo: 'DDS - Levantamento Manual de Peso',
          descricao: 'Aprenda a postura correta para levantar pneus e peças pesadas sem prejudicar a sua coluna e evitando afastamentos médicos.',
          videoUrl: 'https://www.youtube.com/embed/tgbNymZ7vqY', 
          dataFim: '2026-12-31', 
          quiz: {
            pergunta: 'Qual a postura correta ao levantar um peso do chão?',
            opcoes: [
              'Dobrar a coluna e manter as pernas esticadas',
              'Dobrar os joelhos, manter a coluna reta e usar a força das pernas',
              'Puxar o peso rapidamente usando apenas a força dos braços'
            ],
            respostaCorreta: 1
          }
        },
        {
          id: 'p2',
          titulo: 'Treinamento NR-35 - Trabalho em Altura (Vencido)',
          descricao: 'Revisão das normas para trabalho em altura durante a manutenção dos estoques verticais.',
          videoUrl: 'https://www.youtube.com/embed/tgbNymZ7vqY',
          dataFim: '2026-05-15', 
          quiz: {
            pergunta: 'A partir de qual altura é obrigatório o uso de cinto de segurança corporais?',
            opcoes: ['1,0 metro', '2,0 metros', '3,5 metros'],
            respostaCorreta: 1
          }
        }
      ] as any);
      
      setRespostasQuiz([]);
      setConfig({
        pbiDashboardUrl: 'https://app.powerbi.com/view?r=eyJrIjoiMTcxODgwOWEtNDg5NC00YjdhLWJmYjAtOTI3OGQ1Y2Y5OGMzIiwidCI6IjExZGJiZmUyLTg5YjgtNDU0OS1iZTEwLWNlYzM2NGU1OTU1MSIsImMiOjR9',
        lookerStudioUrl: 'https://datastudio.google.com/u/0/reporting/4d9b1459-d544-4986-986d-535db98b26b4/page/tEnnC',
        gdriveFormsFolderUrl: 'https://drive.google.com/drive/u/4/folders/1Qm6eczxgCD5FWCJHnUSY-oawtbwf5ipf',
        gdrivePhotosFolderUrl: 'https://drive.google.com/drive/u/4/folders/1_v2jVzO50VJfHd87npJE-Ibn2mb6ThyiRpfuaun1_kK1WEsgpMko5j-ZS4L-5qD0XhC-w1xU'
      });
      setLoading(false);
    }, 800); 
  };

  useEffect(() => {
    syncDatabase();
  }, []);

  const handleLoginSuccess = (loggedInUser: any) => {
    setUser(loggedInUser);
    setIsAdminViewMode(loggedInUser.isAdmin);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdminViewMode(false);
    setActiveAdminTab('painel');
    setActiveColaboradorTab('noticias');
  };

  // API wrappers
  const handleAddColaborador = async (col: Omit<Colaborador, 'id'>) => {
    try {
      const res = await fetch('/api/colaboradores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(col) });
      if (res.ok) await syncDatabase();
    } catch (e) { console.log('Modo visualização na Vercel ativo'); }
  };
  const handleUpdateColaborador = async (id: string, col: Partial<Colaborador>) => {
    try {
      const res = await fetch(`/api/colaboradores/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(col) });
      if (res.ok) await syncDatabase();
    } catch (e) {}
  };
  const handleDeleteColaborador = async (id: string) => {
    try {
      const res = await fetch(`/api/colaboradores/${id}`, { method: 'DELETE' });
      if (res.ok) await syncDatabase();
    } catch (e) {}
  };
  const handleAddNoticia = async (not: Omit<Noticia, 'id' | 'dataCriacao'>) => {
    try {
      const res = await fetch('/api/noticias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(not) });
      if (res.ok) await syncDatabase();
    } catch (e) {}
  };
  const handleDeleteNoticia = async (id: string) => {
    try {
      const res = await fetch(`/api/noticias/${id}`, { method: 'DELETE' });
      if (res.ok) await syncDatabase();
    } catch (e) {}
  };
  const handleAddPilula = async (pilula: Omit<PilulaTreinamento, 'id'>) => {
    try {
      const res = await fetch('/api/pilulas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(pilula) });
      if (res.ok) await syncDatabase();
    } catch (e) {}
  };
  const handleDeletePilula = async (id: string) => {
    try {
      const res = await fetch(`/api/pilulas/${id}`, { method: 'DELETE' });
      if (res.ok) await syncDatabase();
    } catch (e) {}
  };
  const handleSubmitQuizRespotum = async (pillId: string, acerto: boolean) => {
    try {
      const res = await fetch('/api/respostas-quiz', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilulaId: pillId, colaboradorEmail: user.email, colaboradorNome: user.nome, assistiuVideo: true, respondeuQuiz: true, acertou: acerto, status: 'Concluido' })
      });
      if (res.ok) await syncDatabase();
    } catch (e) {}
  };
  
  const handleUpdateConfig = async (newConf: Partial<AppConfig>) => {
    setConfig(configAnterior => ({
      ...configAnterior,
      ...newConf
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-800 font-sans space-y-8">
        <div className="relative flex items-center justify-center w-72 h-36 bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <div className="absolute inset-0 border-4 border-transparent border-t-emerald-600 rounded-2xl animate-spin-slow opacity-20"></div>
          
          {!logoError ? (
            <img 
              src={LogoPneubras} 
              alt="Logo Grupo PneuBras" 
              className="w-full h-full object-contain animate-pulse"
              onError={() => setLogoError(true)} 
            />
          ) : (
            <ShieldCheck className="w-16 h-16 text-emerald-600 animate-pulse" />
          )}
        </div>
        <div className="text-center">
          <h2 className="text-xl tracking-tight font-extrabold text-slate-800">Iniciando Ambiente Seguro</h2>
          <p className="text-sm text-slate-500 mt-2 font-medium">Carregando módulos de SST...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      <header className="bg-slate-950 border-b border-slate-800 text-white py-3 px-6 flex justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center space-x-5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg outline-none transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-5 group cursor-pointer">
            <div className="h-16 w-44 bg-white rounded-xl py-2 px-4 flex items-center justify-center shadow-md ring-1 ring-white/10 group-hover:scale-105 transition-transform duration-300">
              {!logoError ? (
                <img 
                  src={LogoPneubras} 
                  alt="Logo Grupo PneuBras" 
                  className="h-full w-full object-contain" 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <ShieldCheck className="w-8 h-8 text-emerald-600" title="Logo não encontrada" />
              )}
            </div>
            
            <div className="hidden sm:flex flex-col justify-center border-l border-slate-800 pl-5">
              <span className="text-[10px] uppercase tracking-widest text-emerald-500 font-bold leading-none mb-1.5">
                Portal Corporativo
              </span>
              <span className="text-lg font-bold text-slate-100 tracking-tight leading-none">
                Gestão SST
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm font-medium">
          {user.isAdmin && (
            <div className="hidden sm:flex items-center bg-slate-900 rounded-lg p-1 ring-1 ring-slate-800 shadow-inner">
              <button
                onClick={() => setIsAdminViewMode(true)}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all duration-300 flex items-center space-x-2 ${
                  isAdminViewMode ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Gestão</span>
              </button>
              <button
                onClick={() => setIsAdminViewMode(false)}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all duration-300 flex items-center space-x-2 ${
                  !isAdminViewMode ? 'bg-[#D4AF37] text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Colaborador</span>
              </button>
            </div>
          )}

          <div className="flex items-center space-x-4 border-l border-slate-800 pl-6">
            <div className="text-right hidden md:block">
              <p className="text-slate-200 font-bold leading-none text-sm">{user.nome}</p>
              <p className="text-xs text-slate-400 mt-1">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-slate-700 text-emerald-500 font-bold shadow-sm">
              {user.nome.charAt(0)}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:bg-slate-800 hover:text-red-400 rounded-lg transition-colors group"
            title="Sair do sistema"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative overflow-hidden">
        
        {/* Sidebar */}
        <aside className={`bg-slate-900 text-slate-400 w-64 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out z-30
          absolute md:static top-0 bottom-0 left-0 md:transform-none border-r border-slate-200/10 ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl h-[calc(100vh-89px)]' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="py-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            
            <div className="px-6 mb-8">
              <div className="text-emerald-500 flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest mb-2">
                <Activity className="w-3.5 h-3.5" />
                <span>Módulo Ativo</span>
              </div>
              <p className="text-sm font-bold text-slate-100 tracking-wide">
                {isAdminViewMode ? "Painel Gerencial" : "Área do Colaborador"}
              </p>
            </div>

            {isAdminViewMode ? (
              <nav className="space-y-1 text-sm font-medium px-3">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 py-2 mt-2">Métricas e Dados</p>
                <button
                  onClick={() => { setActiveAdminTab('painel'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeAdminTab === 'painel'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </div>
                  {activeAdminTab === 'painel' && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>

                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 py-2 pt-5">Rotina Operacional</p>
                <button
                  onClick={() => { setActiveAdminTab('inspecao'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeAdminTab === 'inspecao'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Inspeção (SST)</span>
                  </div>
                  {activeAdminTab === 'inspecao' && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>

                <button
                  onClick={() => { setActiveAdminTab('conformidade'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeAdminTab === 'conformidade'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Conformidade</span>
                  </div>
                  {activeAdminTab === 'conformidade' && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>

                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 py-2 pt-5">Administração</p>
                <button
                  onClick={() => { setActiveAdminTab('dados'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeAdminTab === 'dados'
                      ? 'bg-slate-800 text-emerald-400 shadow-sm'
                      : 'hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </div>
                  {activeAdminTab === 'dados' && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
              </nav>
            ) : (
              <div className="px-4 space-y-5">
                <nav className="space-y-3">
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2 mb-2">Seu Perfil</p>
                  
                  <div className="w-full text-left px-4 py-3 text-slate-200 bg-slate-800 rounded-lg font-medium flex items-center space-x-3 border border-slate-700 shadow-sm">
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span className="truncate text-sm">{user.empresa || "Empresa Vinculada"}</span>
                  </div>

                  <div className="mt-8 p-4 bg-slate-800/50 rounded-lg text-sm leading-relaxed border border-slate-700/50">
                    <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center mb-3 border border-slate-700">
                      <ShieldCheck className="w-4 h-4 text-emerald-500"/>
                    </div>
                    <p className="font-bold text-slate-200 mb-1">A segurança começa por você!</p>
                    <p className="text-slate-400 text-xs">Complete seus DDS e avaliações comportamentais no painel ao lado para manter sua área segura.</p>
                  </div>

                  <div className="pt-6">
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-2 mb-3">Menu de Navegação</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => { setActiveColaboradorTab('noticias'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-200 ${
                          activeColaboradorTab === 'noticias'
                            ? 'bg-slate-800 text-emerald-400 shadow-sm'
                            : 'hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Newspaper className="w-4 h-4" />
                          <span className="text-sm">Notícias SST</span>
                        </div>
                        {activeColaboradorTab === 'noticias' && <ChevronRight className="w-4 h-4 opacity-50" />}
                      </button>

                      <button
                        onClick={() => { setActiveColaboradorTab('formularios'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-200 ${
                          activeColaboradorTab === 'formularios'
                            ? 'bg-slate-800 text-emerald-400 shadow-sm'
                            : 'hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <FileSpreadsheet className="w-4 h-4" />
                          <span className="text-sm">Formulários Comportamentais</span>
                        </div>
                        {activeColaboradorTab === 'formularios' && <ChevronRight className="w-4 h-4 opacity-50" />}
                      </button>

                      <button
                        onClick={() => { setActiveColaboradorTab('dialogos'); setMobileMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all duration-200 ${
                          activeColaboradorTab === 'dialogos'
                            ? 'bg-slate-800 text-emerald-400 shadow-sm'
                            : 'hover:bg-slate-800/50 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Video className="w-4 h-4" />
                          <span className="text-sm">Diálogos de SST</span>
                        </div>
                        {activeColaboradorTab === 'dialogos' && <ChevronRight className="w-4 h-4 opacity-50" />}
                      </button>
                    </div>
                  </div>

                </nav>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-slate-800 bg-slate-950 text-xs text-slate-500 text-center">
            <p className="font-bold text-slate-400 flex items-center justify-center space-x-2 mb-1">
              <ShieldCheck className="w-3.5 h-3.5"/> <span>PneuBras SST • 2026</span>
            </p>
            <p className="text-[10px]">Sistema aderente às NRs e LGPD.</p>
          </div>
        </aside>

        {/* --- ATUALIZAÇÃO AQUI: <main> com padding 0 e fundo escuro base --- */}
        <main className="flex-1 overflow-y-auto max-w-full p-0 bg-slate-900">
          <div className="w-full min-h-full flex flex-col">
            {isAdminViewMode ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex-1 flex flex-col">
                
                {/* 1. Dashboard (mantém fundo claro p/ leitura de gráficos) */}
                {activeAdminTab === 'painel' && (
                  <div className="flex-1 bg-slate-50 p-6 md:p-10">
                    <div className="max-w-7xl mx-auto">
                      <DashboardHome colaboradores={colaboradores} inspecoes={inspecoes} conformidades={conformidades} respostasQuiz={respostasQuiz} config={config} onRefresh={syncDatabase} />
                    </div>
                  </div>
                )}
                
                {/* 2. Inspeção (mantém fundo claro) */}
                {activeAdminTab === 'inspecao' && (
                  <div className="flex-1 bg-slate-50 p-6 md:p-10">
                    <div className="max-w-7xl mx-auto">
                      <InspecaoFormulario user={user} config={config} onSaved={syncDatabase} />
                    </div>
                  </div>
                )}

                {/* 3. Conformidade (mantém fundo claro) */}
                {activeAdminTab === 'conformidade' && (
                  <div className="flex-1 bg-slate-50 p-6 md:p-10">
                    <div className="max-w-7xl mx-auto">
                      <ConformidadeFormulario user={user} config={config} onSaved={syncDatabase} />
                    </div>
                  </div>
                )}

                {/* 4. Dados e Acessos (Aqui aplicamos o papel de parede FULL BLEED) */}
                {activeAdminTab === 'dados' && (
                  <div 
                    className="flex-1 w-full flex flex-col"
                    style={{ 
                      backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.85)), url(${imgFundo})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'left top',
                      backgroundRepeat: 'no-repeat'
                    }}
                  >
                    {/* Espaçamento interno adaptável que não corta o papel de parede */}
                    <div className="p-4 sm:p-6 lg:p-10 space-y-6 max-w-7xl mx-auto w-full">
                      
                      {/* Integrações com design translúcido */}
                      <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg flex items-center">
                              <FolderLock className="w-5 h-5 mr-2 text-emerald-600" />
                              Integrações de Dados
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Conecte fontes externas para alimentar o Dashboard Gerencial.</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-6 bg-slate-50/80 p-6 rounded-lg border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                              <BarChart3 className="w-4 h-4 mr-2" /> Dashboards
                            </h4>
                            
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Power BI (Link Iframe)</label>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={config.pbiDashboardUrl}
                                  onChange={(e) => handleUpdateConfig({ pbiDashboardUrl: e.target.value })}
                                  className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white"
                                />
                                <a 
                                  href={config.pbiDashboardUrl || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                  title="Acessar Dashboard Origem"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Looker Studio (Link Iframe)</label>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={config.lookerStudioUrl}
                                  onChange={(e) => handleUpdateConfig({ lookerStudioUrl: e.target.value })}
                                  className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white"
                                />
                                <a 
                                  href={config.lookerStudioUrl || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                  title="Acessar Dashboard Origem"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-6 bg-slate-50/80 p-6 rounded-lg border border-slate-100">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center">
                              <Cloud className="w-4 h-4 mr-2" /> Nuvem & Repositórios
                            </h4>
                            
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Google Drive - Formulários</label>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={config.gdriveFormsFolderUrl}
                                  onChange={(e) => handleUpdateConfig({ gdriveFormsFolderUrl: e.target.value })}
                                  className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white"
                                />
                                <a 
                                  href={config.gdriveFormsFolderUrl || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                  title="Acessar Pasta no Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 mb-2">Google Drive - Imagens (Inspeções)</label>
                              <div className="flex space-x-2">
                                <input
                                  type="text"
                                  value={config.gdrivePhotosFolderUrl}
                                  onChange={(e) => handleUpdateConfig({ gdrivePhotosFolderUrl: e.target.value })}
                                  className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-lg outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all bg-white"
                                />
                                <a 
                                  href={config.gdrivePhotosFolderUrl || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center justify-center transition-colors shadow-sm"
                                  title="Acessar Pasta no Drive"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Componente GestaoAcessos renderiza transparente aproveitando o fundo que definimos */}
                      <GestaoAcessos
                        colaboradores={colaboradores}
                        noticias={noticias}
                        pilulas={pilulas}
                        respostasQuiz={respostasQuiz}
                        onAddColaborador={handleAddColaborador}
                        onUpdateColaborador={handleUpdateColaborador}
                        onDeleteColaborador={handleDeleteColaborador}
                        onAddNoticia={handleAddNoticia}
                        onDeleteNoticia={handleDeleteNoticia}
                        onAddPilula={handleAddPilula}
                        onDeletePilula={handleDeletePilula}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 flex-1 flex flex-col">
                <ColaboradorHome 
                  user={user} 
                  noticias={noticias} 
                  pilulas={pilulas} 
                  respostasQuiz={respostasQuiz} 
                  onSubmitQuiz={handleSubmitQuizRespotum}
                  activeView={activeColaboradorTab} 
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}