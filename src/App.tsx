import React, { useState, useEffect } from 'react';
import {
  Users, Newspaper, Video, GraduationCap, Plus, Trash2,
  ShieldCheck, LayoutDashboard, FileText, Settings, LogOut,
  FolderLock, UserCheck, Menu, X, ArrowLeftRight, CheckCircle2, ShieldAlert,
  Activity, ChevronRight, BarChart3, Cloud, ExternalLink
} from 'lucide-react';
import { Colaborador, Noticia, InspecaoForm, ConformidadeForm, PilulaTreinamento, QuizRespostum, AppConfig } from './types';
import Login from './components/Login';
import DashboardHome from './components/DashboardHome';
import InspecaoFormulario from './components/InspecaoFormulario';
import ConformidadeFormulario from './components/ConformidadeFormulario';
import GestaoAcessos from './components/GestaoAcessos';
import ColaboradorHome from './components/ColaboradorHome';
import LogoPneubras from './PneuBras.png';

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
  const [activeAdminTab, setActiveAdminTab] = useState<'painel' | 'inspecao' | 'conformidade' | 'dados'>('painel');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const syncDatabase = async () => {
    // Simulando o tempo de carregamento
    setTimeout(() => {
      setColaboradores([]);
      
      // 1. INSERINDO NOTÍCIAS DE EXEMPLO
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
      
      // 2. INSERINDO PÍLULAS DE TREINAMENTO (VÍDEOS) DE EXEMPLO
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-emerald-800 font-medium space-y-8">
        {/* Aumentado o logo no loading para seguir a mesma identidade */}
        <div className="relative flex items-center justify-center w-56 h-56 bg-white rounded-full shadow-lg border-8 border-slate-100">
          <div className="absolute inset-0 border-4 border-transparent border-t-emerald-600 rounded-full animate-spin"></div>
          
          {!logoError ? (
            <img 
              src={LogoPneubras} 
              alt="Logo Grupo PneuBras" 
              className="w-40 h-auto object-contain animate-pulse"
              onError={() => setLogoError(true)} 
            />
          ) : (
            <ShieldCheck className="w-16 h-16 text-emerald-600 animate-pulse" />
          )}
        </div>
        <div className="text-center">
          <h2 className="text-2xl tracking-wide font-extrabold text-slate-800">Iniciando Ambiente Seguro</h2>
          <p className="text-base text-slate-500 mt-2">Carregando módulos de SST...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* Header mais profissional, border bottom sutil e bg sólido */}
      <header className="bg-slate-900 border-b-2 border-emerald-700/50 text-white py-3 px-6 flex justify-between items-center sticky top-0 z-40 shadow-md">
        <div className="flex items-center space-x-5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-lg outline-none transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-5 group cursor-pointer">
            {/* LOGOMARCA MAIOR E COM FUNDO BRANCO DESTACADO */}
            <div className="h-20 bg-white rounded-2xl py-2 px-6 flex items-center justify-center shadow-lg ring-2 ring-white/10 group-hover:scale-105 transition-transform duration-300">
              {!logoError ? (
                <img 
                  src={LogoPneubras} 
                  alt="Logo Grupo PneuBras" 
                  className="h-full w-auto object-contain" 
                  onError={() => setLogoError(true)}
                />
              ) : (
                <ShieldCheck className="w-10 h-10 text-emerald-600" title="Logo não encontrada" />
              )}
            </div>
            
            <div className="hidden sm:flex flex-col justify-center border-l-2 border-slate-700 pl-5">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold leading-none mb-1.5">
                Portal Corporativo
              </span>
              <span className="text-lg font-bold text-white tracking-wide leading-none">
                Gestão SST
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm font-medium">
          {user.isAdmin && (
            <div className="hidden sm:flex items-center bg-slate-800 rounded-full p-1 ring-1 ring-slate-700 shadow-inner">
              <button
                onClick={() => setIsAdminViewMode(true)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center space-x-2 ${
                  isAdminViewMode ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Gestão</span>
              </button>
              <button
                onClick={() => setIsAdminViewMode(false)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center space-x-2 ${
                  !isAdminViewMode ? 'bg-amber-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Colaborador</span>
              </button>
            </div>
          )}

          <div className="flex items-center space-x-4 border-l-2 border-slate-700 pl-6">
            <div className="text-right hidden md:block">
              <p className="text-white font-bold leading-none text-sm">{user.nome}</p>
              <p className="text-xs text-emerald-300/80 mt-1">{user.email}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border-2 border-emerald-500/30 text-emerald-400 font-bold shadow-sm">
              {user.nome.charAt(0)}
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2.5 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors group"
            title="Sair do sistema"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative overflow-hidden">
        
        <aside className={`bg-[#0B1120] text-slate-400 w-64 flex flex-col justify-between shrink-0 transition-transform duration-300 ease-in-out z-30
          absolute md:static top-0 bottom-0 left-0 md:transform-none border-r border-slate-800 ${
            mobileMenuOpen ? 'translate-x-0 shadow-2xl h-[calc(100vh-88px)]' : '-translate-x-full md:translate-x-0'
          }`}
        >
          <div className="py-6 flex-1 flex flex-col overflow-y-auto custom-scrollbar">
            
            <div className="px-6 mb-8">
              <div className="text-emerald-500 flex items-center space-x-2 text-[11px] font-bold uppercase tracking-widest mb-2">
                <Activity className="w-4 h-4" />
                <span>Módulo Ativo</span>
              </div>
              <p className="text-base font-bold text-white tracking-wide">
                {isAdminViewMode ? "Painel Gerencial" : "Área do Colaborador"}
              </p>
            </div>

            {isAdminViewMode ? (
              <nav className="space-y-1.5 text-sm font-medium px-4">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider px-3 py-2 mt-2">Métricas e Dados</p>
                <button
                  onClick={() => { setActiveAdminTab('painel'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeAdminTab === 'painel'
                      ? 'bg-emerald-900/40 text-emerald-400 border-l-4 border-emerald-500 shadow-sm'
                      : 'border-l-4 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </div>
                  {activeAdminTab === 'painel' && <ChevronRight className="w-4 h-4" />}
                </button>

                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider px-3 py-2 pt-4">Rotina Operacional</p>
                <button
                  onClick={() => { setActiveAdminTab('inspecao'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeAdminTab === 'inspecao'
                      ? 'bg-emerald-900/40 text-emerald-400 border-l-4 border-emerald-500 shadow-sm'
                      : 'border-l-4 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Inspeção (SST)</span>
                  </div>
                  {activeAdminTab === 'inspecao' && <ChevronRight className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => { setActiveAdminTab('conformidade'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeAdminTab === 'conformidade'
                      ? 'bg-emerald-900/40 text-emerald-400 border-l-4 border-emerald-500 shadow-sm'
                      : 'border-l-4 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Conformidade</span>
                  </div>
                  {activeAdminTab === 'conformidade' && <ChevronRight className="w-4 h-4" />}
                </button>

                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider px-3 py-2 pt-4">Administração</p>
                <button
                  onClick={() => { setActiveAdminTab('dados'); setMobileMenuOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between transition-all duration-200 ${
                    activeAdminTab === 'dados'
                      ? 'bg-emerald-900/40 text-emerald-400 border-l-4 border-emerald-500 shadow-sm'
                      : 'border-l-4 border-transparent hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-4 h-4" />
                    <span>Configurações</span>
                  </div>
                  {activeAdminTab === 'dados' && <ChevronRight className="w-4 h-4" />}
                </button>
              </nav>
            ) : (
              <div className="px-4 space-y-5">
                <nav className="space-y-3">
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wider px-2 mb-2">Seu Perfil</p>
                  
                  <div className="w-full text-left px-4 py-3.5 text-emerald-300 bg-gradient-to-br from-emerald-900/50 to-emerald-900/10 rounded-xl font-medium flex items-center space-x-3 border border-emerald-800/50 shadow-md">
                    <UserCheck className="w-5 h-5 text-emerald-400" />
                    <span className="truncate">{user.empresa || "Empresa Vinculada"}</span>
                  </div>

                  <div className="mt-8 p-5 bg-slate-800/40 rounded-xl text-sm leading-relaxed border border-slate-700/50 shadow-inner">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                      <ShieldCheck className="w-5 h-5 text-emerald-400"/>
                    </div>
                    <p className="font-bold text-slate-200 mb-2">A segurança começa por você!</p>
                    <p className="text-slate-400">Complete seus DDS e avaliações comportamentais no painel ao lado para manter sua área 100% segura.</p>
                  </div>
                </nav>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-slate-800/80 bg-[#0B1120] text-xs text-slate-500 text-center">
            <p className="font-bold text-slate-400 flex items-center justify-center space-x-2 mb-1.5">
              <ShieldCheck className="w-4 h-4"/> <span>PneuBras SST • 2026</span>
            </p>
            <p>Sistema aderente às NRs e LGPD.</p>
          </div>
        </aside>

        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-full bg-slate-50">
          <div className="max-w-7xl mx-auto">
            {isAdminViewMode ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeAdminTab === 'painel' && (
                  <DashboardHome colaboradores={colaboradores} inspecoes={inspecoes} conformidades={conformidades} respostasQuiz={respostasQuiz} config={config} onRefresh={syncDatabase} />
                )}
                {activeAdminTab === 'inspecao' && (
                  <InspecaoFormulario user={user} config={config} onSaved={syncDatabase} />
                )}
                {activeAdminTab === 'conformidade' && (
                  <ConformidadeFormulario user={user} config={config} onSaved={syncDatabase} />
                )}

                {activeAdminTab === 'dados' && (
                  <div className="space-y-8">
                    
                    <div className="bg-white rounded-2xl border border-slate-200/60 p-8 shadow-sm ring-1 ring-slate-900/5">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="font-bold text-slate-800 text-xl flex items-center">
                            <FolderLock className="w-6 h-6 mr-3 text-emerald-600" />
                            Integrações de Dados
                          </h3>
                          <p className="text-sm text-slate-500 mt-1.5">Conecte fontes externas para alimentar o Dashboard Gerencial.</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
                          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
                            <BarChart3 className="w-4 h-4 mr-2" /> Dashboards
                          </h4>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Power BI (Link Iframe)</label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={config.pbiDashboardUrl}
                                onChange={(e) => handleUpdateConfig({ pbiDashboardUrl: e.target.value })}
                                className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-white"
                              />
                              <a 
                                href={config.pbiDashboardUrl || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
                                title="Acessar Dashboard Origem"
                              >
                                <ExternalLink className="w-5 h-5" />
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
                                className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-white"
                              />
                              <a 
                                href={config.lookerStudioUrl || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
                                title="Acessar Dashboard Origem"
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-100">
                          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center">
                            <Cloud className="w-4 h-4 mr-2" /> Nuvem & Repositórios
                          </h4>
                          
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Google Drive - Formulários</label>
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={config.gdriveFormsFolderUrl}
                                onChange={(e) => handleUpdateConfig({ gdriveFormsFolderUrl: e.target.value })}
                                className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-white"
                              />
                              <a 
                                href={config.gdriveFormsFolderUrl || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
                                title="Acessar Pasta no Drive"
                              >
                                <ExternalLink className="w-5 h-5" />
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
                                className="flex-1 px-4 py-3 text-sm border border-slate-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all bg-white"
                              />
                              <a 
                                href={config.gdrivePhotosFolderUrl || '#'} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition-colors shadow-sm"
                                title="Acessar Pasta no Drive"
                              >
                                <ExternalLink className="w-5 h-5" />
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

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
                )}
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <ColaboradorHome user={user} noticias={noticias} pilulas={pilulas} respostasQuiz={respostasQuiz} onSubmitQuiz={handleSubmitQuizRespotum} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}