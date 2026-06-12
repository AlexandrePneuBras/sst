import React, { useState, useEffect } from 'react';
import { AlertOctagon, CheckCircle, ExternalLink, ArrowRight, Lock } from 'lucide-react';
import { Noticia, PilulaTreinamento, QuizRespostum } from '../types';

// Importação correta da imagem a partir da pasta src
import imgFundo from '../papel.png';

interface ColaboradorHomeProps {
  user: any;
  noticias: Noticia[];
  pilulas: PilulaTreinamento[];
  respostasQuiz: QuizRespostum[];
  onSubmitQuiz: (pillId: string, acerto: boolean) => Promise<void>;
  // Propriedade recebida da barra lateral
  activeView: 'noticias' | 'formularios' | 'dialogos'; 
}

export default function ColaboradorHome({
  user,
  noticias,
  pilulas,
  respostasQuiz,
  onSubmitQuiz,
  activeView
}: ColaboradorHomeProps) {
  
  // Quiz states
  const [activeQuizPill, setActiveQuizPill] = useState<PilulaTreinamento | null>(null);
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ success: boolean; msg: string } | null>(null);

  // Form states
  const [activeFormLayout, setActiveFormLayout] = useState<'tipo1' | 'tipo2' | 'tipo3' | null>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  
  const getUserAuthorizedLayout = () => {
    if (user?.empresa === 'PneuDrive - Serviços') return 'tipo1';
    if (user?.empresa === 'PneuBras - Vendas' || user?.empresa === 'PneuBras - Administrativo') return 'tipo2';
    if (user?.empresa === 'PneuBras - Matriz') return 'tipo3';
    return 'tipo1';
  };

  const authorizedLayout = getUserAuthorizedLayout();

  const handleOpenForm = (layout: 'tipo1' | 'tipo2' | 'tipo3') => {
    if (layout !== authorizedLayout) {
      alert(`Acesso não autorizado! Sua empresa cadastrada é "${user?.empresa}". O seu formulário obrigatório é o Tipo ${authorizedLayout === 'tipo1' ? '1 (Serviços)' : authorizedLayout === 'tipo2' ? '2 (Vendas / Adm)' : '3 (Matriz)'}.`);
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

  const getPillStatusForUser = (p: PilulaTreinamento) => {
    const resp = respostasQuiz.find(r => r.pilulaId === p.id && r.colaboradorEmail.toLowerCase() === user?.email.toLowerCase());
    const currentDate = new Date().toISOString().split('T')[0];
    const isExpired = p.dataFim < currentDate;

    if (resp?.respondeuQuiz) return { status: 'Concluido' as const };
    if (isExpired) return { status: 'Expirado' as const };
    return { status: 'Pendente' as const };
  };

  // Limpa o formulário ativo caso o usuário clique em outra aba na barra lateral
  useEffect(() => {
    setActiveFormLayout(null);
  }, [activeView]);

  return (
    <div 
      className="w-full min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8"
      style={{ 
        backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.85)), url(${imgFundo})`,
        backgroundSize: 'cover',
        // A âncora 'left top' garante que a Logo (situada à esquerda) nunca seja cortada
        backgroundPosition: 'left top', 
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="space-y-6 max-w-7xl mx-auto w-full">
        {/* Banner de Boas Vindas */}
        <div className="bg-white rounded-xl p-6 text-slate-850 border border-slate-200 shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block">
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

        {/* ÁREA DE CONTEÚDO DINÂMICO */}
        
        {/* 1. NOTÍCIAS SST SECTION */}
        {activeView === 'noticias' && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-xl p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Notícias de SSMA / Prevenção em Tempo Real</h2>
              <p className="text-xs text-slate-500 mt-1">Canal de conscientização permanente sobre segurança, saúde ocupacional e NR-Portarias</p>
            </div>

            <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-slate-300 snap-x">
              {noticias.length === 0 ? (
                <p className="text-xs text-slate-500 font-medium py-6 text-center w-full">Nenhuma notícia publicada pelo administrador do SST.</p>
              ) : (
                noticias.map((n) => (
                  <div key={n.id} className="bg-white rounded-xl border border-slate-200 p-4 min-w-[280px] sm:min-w-[320px] max-w-[320px] flex-shrink-0 snap-start flex flex-col justify-between hover:border-slate-300 hover:shadow-md transition-all">
                    <div className="space-y-3">
                      <img src={n.imageUrl} alt={n.titulo} className="w-full h-40 object-cover rounded-lg border border-slate-100 bg-slate-50" />
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">SST NOTÍCIA • {n.dataCriacao}</span>
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{n.titulo}</h4>
                        <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{n.descricao}</p>
                      </div>
                    </div>
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">{n.linkOriginal}</span>
                      <a href={n.linkOriginal} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 rounded flex items-center space-x-1 border border-slate-200 hover:text-slate-900 transition-colors">
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

        {/* 2. FORMULÁRIOS COMPORTAMENTAIS */}
        {activeView === 'formularios' && (
          <div className="space-y-6">
            {activeFormLayout === null ? (
              <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-xl p-6 space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Formulários de SST e Coleta de Informações</h3>
                  <p className="text-xs text-slate-500 mt-1">Coleções de checks de comportamento e proteção. O seu acesso é limitado de acordo com a empresa cadastrada.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div onClick={() => handleOpenForm('tipo1')} className={`border rounded-xl p-5 cursor-pointer hover:border-slate-300 transition flex flex-col justify-between h-44 relative group overflow-hidden shadow-sm ${authorizedLayout === 'tipo1' ? 'border-blue-200 bg-blue-50/80 hover:shadow-md' : 'border-slate-200 bg-slate-50/90 opacity-80 font-sans'}`}>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Layout Tipo 01</span>
                      <h4 className="font-bold text-slate-800 text-sm">PneuDrive - Serviços</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Filial de Serviços - Inspeções de pista e oficina mecânica de pneus pesados.</p>
                    </div>
                    {authorizedLayout !== 'tipo1' && <Lock className="absolute top-4 right-4 w-4 h-4 text-slate-400" />}
                    {authorizedLayout === 'tipo1' && <span className="text-[11px] font-bold text-blue-600 flex items-center group-hover:underline">Iniciar Inspeção <ArrowRight className="w-3.5 h-3.5 ml-1" /></span>}
                  </div>

                  <div onClick={() => handleOpenForm('tipo2')} className={`border rounded-xl p-5 cursor-pointer hover:border-slate-300 transition flex flex-col justify-between h-44 relative group overflow-hidden shadow-sm ${authorizedLayout === 'tipo2' ? 'border-blue-200 bg-blue-50/80 hover:shadow-md' : 'border-slate-200 bg-slate-50/90 opacity-80 font-sans'}`}>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Layout Tipo 02</span>
                      <h4 className="font-bold text-slate-800 text-sm">PneuBras - Vendas & Adm</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Filial Comercial & Setores Administrativos de Lojas.</p>
                    </div>
                    {authorizedLayout !== 'tipo2' && <Lock className="absolute top-4 right-4 w-4 h-4 text-slate-400" />}
                    {authorizedLayout === 'tipo2' && <span className="text-[11px] font-bold text-blue-600 flex items-center group-hover:underline">Iniciar Inspeção <ArrowRight className="w-3.5 h-3.5 ml-1" /></span>}
                  </div>

                  <div onClick={() => handleOpenForm('tipo3')} className={`border rounded-xl p-5 cursor-pointer hover:border-slate-300 transition flex flex-col justify-between h-44 relative group overflow-hidden shadow-sm ${authorizedLayout === 'tipo3' ? 'border-blue-200 bg-blue-50/80 hover:shadow-md' : 'border-slate-200 bg-slate-50/90 opacity-80 font-sans'}`}>
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Layout Tipo 03</span>
                      <h4 className="font-bold text-slate-800 text-sm">PneuBras - Matriz</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">Estrutura de Matriz, portarias, brigadas e exames periódicos.</p>
                    </div>
                    {authorizedLayout !== 'tipo3' && <Lock className="absolute top-4 right-4 w-4 h-4 text-slate-400" />}
                    {authorizedLayout === 'tipo3' && <span className="text-[11px] font-bold text-blue-600 flex items-center group-hover:underline">Iniciar Inspeção <ArrowRight className="w-3.5 h-3.5 ml-1" /></span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#FAF9F6] rounded-xl border border-slate-200 overflow-hidden shadow-2xl max-w-2xl font-sans mx-auto">
                <div className="h-4 bg-slate-800" />
                <div className="p-6 space-y-6">
                  <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm space-y-2">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                      {activeFormLayout === 'tipo1' ? 'Formulário Tipo 01: PneuDrive Serviços' : activeFormLayout === 'tipo2' ? 'Formulário Tipo 02: PneuBras Vendas & Administrativo' : 'Formulário Tipo 03: PneuBras Matriz'}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">O formulário está integrado no Google Drive SST PneuBras.</p>
                    <p className="text-xs text-slate-700 font-mono italic">Respondendo como: {user?.email}</p>
                  </div>
                  {!formSubmitted ? (
                    <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-4 text-xs">
                      {activeFormLayout === 'tipo1' && (
                        <>
                          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
                            <p className="font-bold text-slate-800 text-sm">1. Os mecânicos estão utilizando os protetores auriculares corretamente? *</p>
                            <div className="space-y-2 font-medium text-slate-600">
                              <label className="flex items-center space-x-2"><input type="radio" required name="qa1" className="text-blue-600 focus:ring-blue-500" /> <span>Sim, integralmente</span></label>
                              <label className="flex items-center space-x-2"><input type="radio" name="qa1" className="text-blue-600 focus:ring-blue-500" /> <span>Parcialmente (reclamam de desconforto)</span></label>
                              <label className="flex items-center space-x-2"><input type="radio" name="qa1" className="text-blue-600 focus:ring-blue-500" /> <span>Não utilizam</span></label>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
                            <p className="font-bold text-slate-800 text-sm">2. Os coletores de óleo queimado e solventes estão tampados e em local protegido? *</p>
                            <div className="space-y-2 font-medium text-slate-600">
                              <label className="flex items-center space-x-2"><input type="radio" required name="qa2" className="text-blue-600 focus:ring-blue-500" /> <span>Sim, conforme NR-26</span></label>
                              <label className="flex items-center space-x-2"><input type="radio" name="qa2" className="text-blue-600 focus:ring-blue-500" /> <span>Não, há tambores abertos</span></label>
                            </div>
                          </div>
                        </>
                      )}

                      {activeFormLayout === 'tipo2' && (
                        <>
                          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
                            <p className="font-bold text-slate-800 text-sm">1. A cadeira de trabalho possui ajuste de altura regulado de forma ergonômica? *</p>
                            <div className="space-y-2 font-medium text-slate-600">
                              <label className="flex items-center space-x-2"><input type="radio" required name="qb1" className="text-blue-600 focus:ring-blue-500" /> <span>Sim, regulada perfeitamente</span></label>
                              <label className="flex items-center space-x-2"><input type="radio" name="qb1" className="text-blue-600 focus:ring-blue-500" /> <span>Não / Cadeira sem ajustes</span></label>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
                            <p className="font-bold text-slate-800 text-sm">2. Há reflexos prejudiciais da luz nas telas dos computadores? *</p>
                            <div className="space-y-2 font-medium text-slate-600">
                              <label className="flex items-center space-x-2"><input type="radio" required name="qb2" className="text-blue-600 focus:ring-blue-500" /> <span>Não, iluminação confortável</span></label>
                              <label className="flex items-center space-x-2"><input type="radio" name="qb2" className="text-blue-600 focus:ring-blue-500" /> <span>Sim, excesso de luz solar ou luminária direta</span></label>
                            </div>
                          </div>
                        </>
                      )}

                      {activeFormLayout === 'tipo3' && (
                        <>
                          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
                            <p className="font-bold text-slate-800 text-sm">1. Os extintores das salas de reunião e copa estão com a trava plástica inviolada? *</p>
                            <div className="space-y-2 font-medium text-slate-600">
                              <label className="flex items-center space-x-2"><input type="radio" required name="qc1" className="text-blue-600 focus:ring-blue-500" /> <span>Sim, todos revisados</span></label>
                              <label className="flex items-center space-x-2"><input type="radio" name="qc1" className="text-blue-600 focus:ring-blue-500" /> <span>Não/Inconsistentes em alguma área</span></label>
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm space-y-3">
                            <p className="font-bold text-slate-800 text-sm">2. O plano de saída de emergência geral da Matriz está afixado em local visível ao lado do elevador? *</p>
                            <div className="space-y-2 font-medium text-slate-600">
                              <label className="flex items-center space-x-2"><input type="radio" required name="qc2" className="text-blue-600 focus:ring-blue-500" /> <span>Sim</span></label>
                              <label className="flex items-center space-x-2"><input type="radio" name="qc2" className="text-blue-600 focus:ring-blue-500" /> <span>Não localizado</span></label>
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center pt-2">
                        <button type="button" onClick={() => setActiveFormLayout(null)} className="text-slate-600 font-bold hover:text-slate-900 transition-colors">Voltar para a lista</button>
                        <button type="submit" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded shadow-md cursor-pointer transition-colors text-xs">Enviar Respostas</button>
                      </div>
                    </form>
                  ) : (
                    <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm text-center space-y-4">
                      <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                      <h4 className="font-bold text-lg text-slate-800">Resposta registrada!</h4>
                      <button type="button" onClick={() => { setActiveFormLayout(null); setFormSubmitted(false); }} className="px-5 py-2.5 border border-slate-300 text-slate-700 font-bold rounded hover:bg-slate-50 transition-colors text-xs cursor-pointer shadow-sm">Voltar aos Formulários</button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. DIÁLOGOS DE SST */}
        {activeView === 'dialogos' && (
          <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 shadow-xl p-6 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Diálogos de SST (Treinamento &amp; Pílulas de Conhecimento)</h2>
              <p className="text-xs text-slate-500 mt-1">Assista aos vídeos educativos de SSMA regulamentados e responda aos questionários.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pilulas.map((p) => {
                const info = getPillStatusForUser(p);
                const isLocked = info.status === 'Expirado';

                return (
                  <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 relative flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${info.status === 'Concluido' ? 'text-emerald-700 border-emerald-200 bg-emerald-50' : info.status === 'Expirado' ? 'text-rose-700 border-rose-200 bg-rose-50' : 'text-blue-700 border-blue-200 bg-blue-50'}`}>
                          {info.status === 'Concluido' ? '✓ CONCLUÍDO' : info.status === 'Expirado' ? '✖ INTERROMPIDO' : '● PENDENTE'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono font-medium bg-slate-100 px-2 py-0.5 rounded">Até {p.dataFim}</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.titulo}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{p.descricao}</p>
                    </div>

                    {isLocked ? (
                      <div className="p-4 bg-rose-50 rounded-lg border border-rose-200 flex items-start space-x-3 text-xs mt-4">
                        <AlertOctagon className="w-5 h-5 text-rose-500 flex-shrink-0" />
                        <div className="space-y-1">
                          <p className="font-bold text-rose-800 uppercase tracking-wide">TRAVA DE PENDÊNCIA</p>
                          <p className="text-rose-700 leading-relaxed">O prazo expirou em <strong>{p.dataFim}</strong>.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 pt-4 mt-4 border-t border-slate-100">
                        {info.status === 'Concluido' ? (
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-lg text-xs font-semibold flex items-center shadow-sm">
                            <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                            <span>Você já completou este diálogo com sucesso!</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-black shadow-sm">
                              <iframe src={p.videoUrl} title={p.titulo} className="w-full h-full border-none" allowFullScreen />
                            </div>
                            <button onClick={() => { setActiveQuizPill(p); setQuizFeedback(null); }} className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded transition-colors cursor-pointer shadow-md">
                              Responder Quiz de Fixação
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal de Quiz */}
            {activeQuizPill && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[9999]">
                 <div className="bg-white rounded-xl max-w-lg w-full p-6 font-sans shadow-2xl">
                    <div className="flex justify-between items-start mb-5 border-b border-slate-100 pb-3">
                      <h3 className="font-bold text-slate-900 pr-4">{activeQuizPill.titulo}</h3>
                      <button onClick={() => { setActiveQuizPill(null); setQuizFeedback(null); }} className="text-slate-400 font-bold hover:text-slate-800 transition-colors bg-slate-100 px-2 py-1 rounded text-xs">Fechar</button>
                    </div>
                    {!quizFeedback ? (
                      <form onSubmit={handleQuizSubmit} className="space-y-5 text-xs">
                        <p className="font-bold text-slate-800 text-sm">{activeQuizPill.quiz.pergunta}</p>
                        <div className="space-y-2">
                          {activeQuizPill.quiz.opcoes.map((opcao, idx) => (
                            <label key={idx} className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${selectedQuizOption === idx ? 'bg-blue-50 border-blue-300 shadow-sm' : 'border-slate-200 hover:bg-slate-50'}`}>
                              <input type="radio" name="quizOption" onChange={() => setSelectedQuizOption(idx)} checked={selectedQuizOption === idx} className="text-blue-600 focus:ring-blue-500" />
                              <span className="font-medium text-slate-700">{opcao}</span>
                            </label>
                          ))}
                        </div>
                        <button type="submit" disabled={selectedQuizOption === null} className="w-full py-3 bg-slate-900 text-white font-bold rounded shadow-md cursor-pointer disabled:opacity-50 transition-colors">
                          Gravar Resposta Oficial
                        </button>
                      </form>
                    ) : (
                      <div className="text-center p-6 space-y-5">
                         {quizFeedback.success ? <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" /> : <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />}
                         <p className={`font-bold text-sm ${quizFeedback.success ? 'text-emerald-800' : 'text-slate-800'}`}>{quizFeedback.msg}</p>
                         <button onClick={() => { setActiveQuizPill(null); setQuizFeedback(null); }} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded text-xs cursor-pointer shadow-md hover:bg-slate-800 transition-colors">
                           Avançar
                         </button>
                      </div>
                    )}
                 </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}