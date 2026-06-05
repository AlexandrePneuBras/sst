import React, { useState } from 'react';
import { Newspaper, Video, HelpCircle, FileSpreadsheet, Lock, AlertOctagon, HelpCircle as HelpIcon, CheckCircle, ExternalLink, BookmarkCheck, ArrowRight, ArrowLeft, LayoutGrid } from 'lucide-react';
import { Noticia, PilulaTreinamento, QuizRespostum } from '../types';

interface ColaboradorHomeProps {
  user: any;
  noticias: Noticia[];
  pilulas: PilulaTreinamento[];
  respostasQuiz: QuizRespostum[];
  onSubmitQuiz: (pillId: string, acerto: boolean) => Promise<void>;
}

export default function ColaboradorHome({
  user,
  noticias,
  pilulas,
  respostasQuiz,
  onSubmitQuiz
}: ColaboradorHomeProps) {
  // Alterado: Novo estado 'menu' adicionado e definido como padrão
  const [activeSubView, setActiveSubView] = useState<'menu' | 'noticias' | 'formularios' | 'dialogos'>('menu');
  
  // Quiz states
  const [activeQuizPill, setActiveQuizPill] = useState<PilulaTreinamento | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Form submission simulators state (mocking Google Forms layout)
  const [activeFormLayout, setActiveFormLayout] = useState<'tipo1' | 'tipo2' | 'tipo3' | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  // Decide which layout matches current user
  const getUserAuthorizedLayout = () => {
    if (user?.empresa === 'PneuDrive - Serviços') return 'tipo1';
    if (user?.empresa === 'PneuBras - Vendas' || user?.empresa === 'PneuBras - Administrativo') return 'tipo2';
    if (user?.empresa === 'PneuBras - Matriz') return 'tipo3';
    return 'tipo1';
  };

  const authorizedLayout = getUserAuthorizedLayout();

  const handleOpenForm = (layout: 'tipo1' | 'tipo2' | 'tipo3') => {
    if (layout !== authorizedLayout) {
      alert(`Acesso não autorizado! De acordo com a Base Colaboradores, sua empresa cadastrada é "${user?.empresa}". O seu formulário de SST obrigatório é o de Tipo ${authorizedLayout === 'tipo1' ? '1 (Serviços)' : authorizedLayout === 'tipo2' ? '2 (Vendas / Adm)' : '3 (Matriz)'}.`);
      return;
    }
    setActiveFormLayout(layout);
    setFormSubmitted(false);
  };

  const handleQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeQuizPill || selectedQuizOption === null) return;

    const isCorrect = selectedQuizOption === activeQuizPill.quiz.respostaCorreta;
    try {
      await onSubmitQuiz(activeQuizPill.id, isCorrect);
      setQuizFeedback({
        success: isCorrect,
        msg: isCorrect 
          ? "Excelente! Resposta correta sobre segurança no trabalho!" 
          : `Gabarito incorreto. A resposta exata era: "${activeQuizPill.quiz.opcoes[activeQuizPill.quiz.respostaCorreta]}". Estude os guias e revise as normas!`
      });
      setSelectedQuizOption(null);
    } catch (e) {
      alert("Houve uma falha ao computar resposta.");
    }
  };

  // Check status of pill for this coworker
  const getPillStatusForUser = (p: PilulaTreinamento) => {
    const resp = respostasQuiz.find(r => r.pilulaId === p.id && r.colaboradorEmail.toLowerCase() === user?.email.toLowerCase());
    
    // Check if end date passed
    const currentDate = new Date().toISOString().split('T')[0];
    const isExpired = p.dataFim < currentDate;

    if (resp?.respondeuQuiz) {
      return { status: 'Concluido' as const, style: 'bg-emerald-50 text-emerald-800' };
    }
    if (isExpired) {
      return { status: 'Expirado' as const, style: 'bg-rose-50 text-rose-800' };
    }
    return { status: 'Pendente' as const, style: 'bg-amber-50 text-amber-800' };
  };

  return (
    <div className="space-y-6">
      {/* Coworker Identity Banner */}
      <div className="bg-white rounded-xl p-6 text-slate-850 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block">
            Portal do Colaborador SST
          </span>
          <h1 className="text-lg font-bold tracking-tight text-slate-950 mt-1">Seja bem-vindo, {user?.nome || "Colaborador"}</h1>
          <p className="text-xs text-slate-500">
            Unidade: <strong className="text-slate-700">{user?.loja}</strong> | Empresa: <strong className="text-slate-700">{user?.empresa}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 bg-slate-50 text-slate-700 rounded text-xs font-semibold border border-slate-200 whitespace-nowrap">
            Layout Tipo {authorizedLayout === 'tipo1' ? '1 - Serviços' : authorizedLayout === 'tipo2' ? '2 - Administrativo/Vendas' : '3 - Matriz'}
          </span>
        </div>
      </div>

      {/* Botão de Voltar (Aparece apenas quando não estamos no menu principal) */}
      {activeSubView !== 'menu' && (
        <button
          onClick={() => { setActiveSubView('menu'); setActiveFormLayout(null); }}
          className="flex items-center text-slate-500 hover:text-slate-900 text-xs font-bold transition-colors mb-2 cursor-pointer w-fit"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          Voltar ao Menu Principal
        </button>
      )}

      {/* 0. MENU PRINCIPAL (HOME DASHBOARD) */}
      {activeSubView === 'menu' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Menu de Acesso Rápido
            </h2>
            <p className="text-xs text-slate-400">Selecione um dos módulos abaixo para acessar os conteúdos de SSMA.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button 
              onClick={() => setActiveSubView('noticias')}
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left flex flex-col gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Newspaper className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Notícias SST</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Canal de conscientização permanente sobre segurança, saúde ocupacional e normas.</p>
              </div>
            </button>

            <button 
              onClick={() => setActiveSubView('formularios')}
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all text-left flex flex-col gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Formulários Comportamentais</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Coleções de checks de comportamento e proteção específicos para sua unidade.</p>
              </div>
            </button>

            <button 
              onClick={() => setActiveSubView('dialogos')}
              className="bg-white p-6 rounded-xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all text-left flex flex-col gap-4 group cursor-pointer"
            >
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-base">Diálogos de SST</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">Assista aos vídeos educativos de treinamento e responda aos questionários de validação.</p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 1. NOTÍCIAS SST SECTION */}
      {activeSubView === 'noticias' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Notícias de SSMA / Prevenção em Tempo Real</h2>
            <p className="text-xs text-slate-400">Canal de conscientização permanente sobre segurança, saúde ocupacional e NR-Portarias</p>
          </div>

          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-slate-200 snap-x">
            {noticias.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center w-full">Nenhuma notícia publicada pelo administrador do SST.</p>
            ) : (
              noticias.map((n) => (
                <div 
                  key={n.id} 
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm min-w-[280px] sm:min-w-[360px] max-w-[360px] flex-shrink-0 snap-start flex flex-col justify-between hover:border-slate-300 transition-colors"
                >
                  <div className="space-y-3">
                    <img
                      src={n.imageUrl}
                      alt={n.titulo}
                      className="w-full h-40 object-cover rounded-lg border border-slate-100"
                    />
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                        SST NOTÍCIA • {n.dataCriacao}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                        {n.titulo}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                        {n.descricao}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">
                      {n.linkOriginal}
                    </span>
                    <a
                      href={n.linkOriginal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 rounded flex items-center space-x-1 border border-slate-200 hover:text-slate-900"
                    >
                      <span>Acessar Fonte</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2. FORMULÁRIOS COMPORTAMENTAIS GForms simulator */}
      {activeSubView === 'formularios' && (
        <div className="space-y-6">
          {activeFormLayout === null ? (
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-2">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Formulários de SST e Coleta de Informações</h3>
                <p className="text-xs text-slate-400">Coleções de checks de comportamento e proteção. O seu acesso é limitado de acordo com a empresa cadastrada.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* layout 1 */}
                <div 
                  onClick={() => handleOpenForm('tipo1')}
                  className={`border rounded-xl p-5 cursor-pointer hover:border-slate-300 transition flex flex-col justify-between h-44 relative group overflow-hidden ${
                    authorizedLayout === 'tipo1' ? 'border-blue-200 bg-blue-50/25' : 'border-slate-200 bg-slate-50/50 opacity-60 font-sans'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Layout Tipo 01</span>
                    <h4 className="font-bold text-slate-800 text-sm">PneuDrive - Serviços</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Filial de Serviços - Inspeções de pista e oficina mecânica de pneus pesados.</p>
                  </div>
                  {authorizedLayout !== 'tipo1' && <Lock className="absolute top-4 right-4 w-4 h-4 text-slate-400" />}
                  {authorizedLayout === 'tipo1' && (
                    <span className="text-[11px] font-bold text-blue-600 flex items-center group-hover:underline">
                      Iniciar Inspeção <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  )}
                </div>

                {/* layout 2 */}
                <div 
                  onClick={() => handleOpenForm('tipo2')}
                  className={`border rounded-xl p-5 cursor-pointer hover:border-slate-300 transition flex flex-col justify-between h-44 relative group overflow-hidden ${
                    authorizedLayout === 'tipo2' ? 'border-blue-200 bg-blue-50/25' : 'border-slate-200 bg-slate-50/50 opacity-60 font-sans'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Layout Tipo 02</span>
                    <h4 className="font-bold text-slate-800 text-sm">PneuBras - Vendas</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Filial Comercial &amp; Setores Administrativos de Lojas.</p>
                  </div>
                  {authorizedLayout !== 'tipo2' && <Lock className="absolute top-4 right-4 w-4 h-4 text-slate-400" />}
                  {authorizedLayout === 'tipo2' && (
                    <span className="text-[11px] font-bold text-blue-600 flex items-center group-hover:underline">
                      Iniciar Inspeção <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  )}
                </div>

                {/* layout 2.1 */}
                <div 
                  onClick={() => handleOpenForm('tipo2')}
                  className={`border rounded-xl p-5 cursor-pointer hover:border-slate-300 transition flex flex-col justify-between h-44 relative group overflow-hidden ${
                    authorizedLayout === 'tipo2' ? 'border-blue-200 bg-blue-50/25' : 'border-slate-200 bg-slate-50/50 opacity-60 font-sans'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Layout Tipo 02</span>
                    <h4 className="font-bold text-slate-800 text-sm">PneuBras - Administrativo</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Filial Comercial &amp; Setores Administrativos de Lojas.</p>
                  </div>
                  {authorizedLayout !== 'tipo2' && <Lock className="absolute top-4 right-4 w-4 h-4 text-slate-400" />}
                  {authorizedLayout === 'tipo2' && (
                    <span className="text-[11px] font-bold text-blue-600 flex items-center group-hover:underline">
                      Iniciar Inspeção <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  )}
                </div>

                {/* layout 3 */}
                <div 
                  onClick={() => handleOpenForm('tipo3')}
                  className={`border rounded-xl p-5 cursor-pointer hover:border-slate-300 transition flex flex-col justify-between h-44 relative group overflow-hidden ${
                    authorizedLayout === 'tipo3' ? 'border-blue-200 bg-blue-50/25' : 'border-slate-200 bg-slate-50/50 opacity-60 font-sans'
                  }`}
                >
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Layout Tipo 03</span>
                    <h4 className="font-bold text-slate-800 text-sm">PneuBras - Matriz</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Estrutura de Matriz, portarias, brigadas e exames periódicos.</p>
                  </div>
                  {authorizedLayout !== 'tipo3' && <Lock className="absolute top-4 right-4 w-4 h-4 text-slate-400" />}
                  {authorizedLayout === 'tipo3' && (
                    <span className="text-[11px] font-bold text-blue-600 flex items-center group-hover:underline">
                      Iniciar Inspeção <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Mocked Google Forms layout according to layout rules */
            <div className="bg-[#FAF9F6] rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl mx-auto font-sans">
              <div className="h-4 bg-slate-800" />
              
              <div className="p-6 space-y-6">
                <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                    {activeFormLayout === 'tipo1' ? 'Formulário Tipo 01: PneuDrive Serviços' :
                     activeFormLayout === 'tipo2' ? 'Formulário Tipo 02: PneuBras Vendas & Administrativo' :
                     'Formulário Tipo 03: PneuBras Matriz'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    O formulário está hospedado de forma corporativa e integrada no Google Drive SST PneuBras. Seus dados e e-mail estão vinculados para conformidade documental.
                  </p>
                  <p className="text-xs text-slate-700 font-mono italic">Respondendo como: {user?.email}</p>
                </div>

                {!formSubmitted ? (
                  <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-4 text-xs">
                    {activeFormLayout === 'tipo1' && (
                      <>
                        <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
                          <p className="font-bold text-slate-800 text-sm">1. Os mecânicos estão utilizando os protetores auriculares corretamente no elevador? *</p>
                          <div className="space-y-2 font-medium text-slate-600">
                            <label className="flex items-center space-x-2"><input type="radio" required name="qa1" className="text-slate-900 focus:ring-slate-800" /> <span>Sim, integralmente</span></label>
                            <label className="flex items-center space-x-2"><input type="radio" name="qa1" className="text-slate-900 focus:ring-slate-800" /> <span>Parcialmente (reclamam de desconforto)</span></label>
                            <label className="flex items-center space-x-2"><input type="radio" name="qa1" className="text-slate-900 focus:ring-slate-800" /> <span>Não utilizam</span></label>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
                          <p className="font-bold text-slate-800 text-sm">2. Os coletores de óleo queimado e solventes estão tampados e em local protegido? *</p>
                          <div className="space-y-2 font-medium text-slate-600">
                            <label className="flex items-center space-x-2"><input type="radio" required name="qa2" className="text-slate-900 focus:ring-slate-800" /> <span>Sim, conforme NR-26</span></label>
                            <label className="flex items-center space-x-2"><input type="radio" name="qa2" className="text-slate-900 focus:ring-slate-800" /> <span>Não, há tambores abertos</span></label>
                          </div>
                        </div>
                      </>
                    )}

                    {activeFormLayout === 'tipo2' && (
                      <>
                        <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
                          <p className="font-bold text-slate-800 text-sm">1. A cadeira de trabalho possui ajuste de altura regulado de forma ergonômica? *</p>
                          <div className="space-y-2 font-medium text-slate-600">
                            <label className="flex items-center space-x-2"><input type="radio" required name="qb1" className="text-slate-900 focus:ring-slate-800" /> <span>Sim, regulada perfeitamente</span></label>
                            <label className="flex items-center space-x-2"><input type="radio" name="qb1" className="text-slate-900 focus:ring-slate-800" /> <span>Não / Cadeira sem ajustes</span></label>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
                          <p className="font-bold text-slate-800 text-sm">2. Há reflexos prejudiciais da luz nas telas dos computadores? *</p>
                          <div className="space-y-2 font-medium text-slate-600">
                            <label className="flex items-center space-x-2"><input type="radio" required name="qb2" className="text-slate-900 focus:ring-slate-800" /> <span>Não, iluminação confortável</span></label>
                            <label className="flex items-center space-x-2"><input type="radio" name="qb2" className="text-slate-900 focus:ring-slate-800" /> <span>Sim, excesso de luz solar ou luminária direta</span></label>
                          </div>
                        </div>
                      </>
                    )}

                    {activeFormLayout === 'tipo3' && (
                      <>
                        <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
                          <p className="font-bold text-slate-800 text-sm">1. Os extintores das salas de reunião e copa estão com a trava plástica inviolada? *</p>
                          <div className="space-y-2 font-medium text-slate-600">
                            <label className="flex items-center space-x-2"><input type="radio" required name="qc1" className="text-slate-900 focus:ring-slate-800" /> <span>Sim, todos revisados</span></label>
                            <label className="flex items-center space-x-2"><input type="radio" name="qc1" className="text-slate-900 focus:ring-slate-800" /> <span>Não/Inconsistentes em alguma área</span></label>
                          </div>
                        </div>

                        <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
                          <p className="font-bold text-slate-800 text-sm">2. O plano de saída de emergência geral da Matriz está afixado em local visível ao lado do elevador? *</p>
                          <div className="space-y-2 font-medium text-slate-600">
                            <label className="flex items-center space-x-2"><input type="radio" required name="qc2" className="text-slate-900 focus:ring-slate-800" /> <span>Sim</span></label>
                            <label className="flex items-center space-x-2"><input type="radio" name="qc2" className="text-slate-900 focus:ring-slate-800" /> <span>Não localizado</span></label>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveFormLayout(null)}
                        className="text-slate-600 font-bold hover:text-slate-800 underline"
                      >
                        Voltar para a lista
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-2.5 bg-[#1E293B] hover:bg-slate-800 text-white font-semibold rounded cursor-pointer text-xs"
                      >
                        Enviar Respostas p/ Servidor GDrive
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-white rounded-lg p-8 border border-slate-200 text-center space-y-4">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h4 className="font-bold text-base text-slate-800">Sua resposta foi registrada no Google Forms de SST!</h4>
                    <p className="text-xs text-slate-500">Muito obrigado pela cooperação no programa de atos comportamentais de SSMA PneuBras.</p>
                    <button
                      type="button"
                      onClick={() => { setActiveFormLayout(null); setFormSubmitted(false); }}
                      className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded hover:bg-slate-50 text-xs cursor-pointer"
                    >
                      Voltar aos Formulários
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. DIÁLOGOS DE SST - TRAINING PILLS AND QUIZ WITH DATES Trava / Lock check */}
      {activeSubView === 'dialogos' && (
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-2">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Diálogos de SST (Treinamento &amp; Pílulas de Conhecimento)</h2>
            <p className="text-xs text-slate-400">Assista aos vídeos educativos de SSMA regulamentados e responda aos questionários de validação para afastar pendências corporativas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pilulas.map((p) => {
              const info = getPillStatusForUser(p);
              const isLocked = info.status === 'Expirado';

              return (
                <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4 relative flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                        info.status === 'Concluido' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        info.status === 'Expirado' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                      }`}>
                        {info.status === 'Concluido' ? '✓ CONCLUÍDO NO PRAZO' :
                         info.status === 'Expirado' ? '✖ INTERROMPIDO / TRAVADO' : '● PENDENTE DE ACESSO'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Até {p.dataFim}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.titulo}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.descricao}</p>
                  </div>

                  {/* If expired show RED BLOCKED STUFF */}
                  {isLocked ? (
                    <div className="p-4 bg-rose-50 rounded-lg border border-rose-200 flex items-start space-x-3 text-xs mt-4">
                      <AlertOctagon className="w-5 h-5 text-rose-500 flex-shrink-0" />
                      <div className="space-y-1">
                        <p className="font-bold text-rose-800 uppercase tracking-wide">ATENÇÃO – TRAVA POR INDICAÇÃO DE PENDÊNCIA</p>
                        <p className="text-rose-700 leading-relaxed">
                          O prazo regulamentar para assistir a este vídeo e responder ao quiz expirou em <strong>{p.dataFim}</strong> sem que houvesse registro eletrônico do seu acesso corporativo.
                        </p>
                        <p className="font-bold text-rose-800 uppercase underline pt-1">
                          PROCURE O GESTOR DE SST DA SUA UNIDADE IMEDIATAMENTE PARA REGULARIZAR A PENDÊNCIA.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Display video player & question quiz trigger if open or completed */
                    <div className="space-y-4 pt-4 mt-4 border-t border-slate-150">
                      {info.status === 'Concluido' ? (
                        <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-lg text-xs font-semibold flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                          <span>Você já completou este diálogo com sucesso! Registro consolidado para auditorias de CIPA.</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Video container */}
                          <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-black">
                            <iframe
                              src={p.videoUrl}
                              title={p.titulo}
                              className="w-full h-full border-none"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>

                          <button
                            onClick={() => { setActiveQuizPill(p); setQuizFeedback(null); }}
                            className="w-full py-2 bg-[#1E293B] hover:bg-slate-800 text-white font-semibold text-xs rounded transition cursor-pointer"
                          >
                            Responder Quiz de Validação
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Quiz interaction overlay Modal */}
          {activeQuizPill && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-xl font-sans">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-200 rounded">
                      QUESTIONÁRIO SST
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm mt-1">{activeQuizPill.titulo}</h3>
                  </div>
                  <button
                    onClick={() => { setActiveQuizPill(null); setQuizFeedback(null); }}
                    className="text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    Fechar
                  </button>
                </div>

                {!quizFeedback ? (
                  <form onSubmit={handleQuizSubmit} className="space-y-4 text-xs">
                    <p className="font-bold text-slate-800">{activeQuizPill.quiz.pergunta}</p>
                    <div className="space-y-2">
                      {activeQuizPill.quiz.opcoes.map((opcao, idx) => (
                        <label
                          key={idx}
                          className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors ${
                            selectedQuizOption === idx ? 'border-slate-800 bg-slate-50/10' : 'border-slate-200'
                          }`}
                        >
                          <input
                            type="radio"
                            name="quizOption"
                            checked={selectedQuizOption === idx}
                            onChange={() => setSelectedQuizOption(idx)}
                            className="text-slate-900 focus:ring-slate-800 border-slate-300"
                          />
                          <span className="font-medium text-slate-700">{opcao}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      type="submit"
                      disabled={selectedQuizOption === null}
                      className="w-full py-2.5 bg-slate-900 text-white font-bold rounded cursor-pointer disabled:opacity-50"
                    >
                      Gravar Minha Resposta na Ficha
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4 text-center p-4">
                    {quizFeedback.success ? (
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle className="w-6 h-6 animate-pulse" />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                        <AlertOctagon className="w-6 h-6" />
                      </div>
                    )}
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      {quizFeedback.msg}
                    </p>
                    <button
                      onClick={() => { setActiveQuizPill(null); setQuizFeedback(null); }}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded text-xs cursor-pointer"
                    >
                      Avançar Diálogos
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}