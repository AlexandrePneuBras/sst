import React, { useState } from 'react';
import { AlertOctagon, CheckCircle, ExternalLink, ArrowRight, Lock } from 'lucide-react';
import { Noticia, PilulaTreinamento, QuizRespostum } from '../types';

interface ColaboradorHomeProps {
  user: any;
  noticias: Noticia[];
  pilulas: PilulaTreinamento[];
  respostasQuiz: QuizRespostum[];
  onSubmitQuiz: (pillId: string, acerto: boolean) => Promise<void>;
  // NOVA PROP: O componente pai vai dizer qual tela mostrar
  activeView: 'noticias' | 'formularios' | 'dialogos'; 
}

export default function ColaboradorHome({
  user,
  noticias,
  pilulas,
  respostasQuiz,
  onSubmitQuiz,
  activeView // Recebendo o estado do componente pai
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

  return (
    <div className="space-y-6 w-full">
      {/* Banner de Boas Vindas */}
      <div className="bg-white rounded-xl p-6 text-slate-850 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

      {/* ÁREA DE CONTEÚDO DINÂMICO (Baseado na activeView recebida via prop) */}
      
      {/* 1. NOTÍCIAS SST SECTION */}
      {activeView === 'noticias' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Notícias de SSMA / Prevenção em Tempo Real</h2>
            <p className="text-xs text-slate-400 mt-1">Canal de conscientização permanente sobre segurança, saúde ocupacional e NR-Portarias</p>
          </div>

          <div className="flex overflow-x-auto pb-4 gap-4 scrollbar-thin scrollbar-thumb-slate-200 snap-x">
            {noticias.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center w-full">Nenhuma notícia publicada pelo administrador do SST.</p>
            ) : (
              noticias.map((n) => (
                <div key={n.id} className="bg-slate-50 rounded-xl border border-slate-200 p-4 min-w-[280px] sm:min-w-[320px] max-w-[320px] flex-shrink-0 snap-start flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div className="space-y-3">
                    <img src={n.imageUrl} alt={n.titulo} className="w-full h-40 object-cover rounded-lg border border-slate-100 bg-white" />
                    <div className="space-y-1">
                      <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">SST NOTÍCIA • {n.dataCriacao}</span>
                      <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{n.titulo}</h4>
                      <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{n.descricao}</p>
                    </div>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-slate-400 truncate max-w-[120px]">{n.linkOriginal}</span>
                    <a href={n.linkOriginal} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white hover:bg-slate-100 text-[11px] font-semibold text-slate-700 rounded flex items-center space-x-1 border border-slate-200 hover:text-slate-900 transition-colors">
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
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Formulários de SST e Coleta de Informações</h3>
                <p className="text-xs text-slate-400 mt-1">Coleções de checks de comportamento e proteção. O seu acesso é limitado de acordo com a empresa cadastrada.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div onClick={() => handleOpenForm('tipo1')} className={`border rounded-xl p-5 cursor-pointer hover:border-slate-300 transition flex flex-col justify-between h-44 relative group overflow-hidden ${authorizedLayout === 'tipo1' ? 'border-blue-200 bg-blue-50/25' : 'border-slate-200 bg-slate-50/50 opacity-60 font-sans'}`}>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Layout Tipo 01</span>
                    <h4 className="font-bold text-slate-800 text-sm">PneuDrive - Serviços</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Filial de Serviços - Inspeções de pista e oficina mecânica de pneus pesados.</p>
                  </div>
                  {authorizedLayout !== 'tipo1' && <Lock className="absolute top-4 right-4 w-4 h-4 text-slate-400" />}
                  {authorizedLayout === 'tipo1' && <span className="text-[11px] font-bold text-blue-600 flex items-center group-hover:underline">Iniciar Inspeção <ArrowRight className="w-3.5 h-3.5 ml-1" /></span>}
                </div>

                <div onClick={() => handleOpenForm('tipo2')} className={`border rounded-xl p-5 cursor-pointer hover:border-slate-300 transition flex flex-col justify-between h-44 relative group overflow-hidden ${authorizedLayout === 'tipo2' ? 'border-blue-200 bg-blue-50/25' : 'border-slate-200 bg-slate-50/50 opacity-60 font-sans'}`}>
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Layout Tipo 02</span>
                    <h4 className="font-bold text-slate-800 text-sm">PneuBras - Vendas & Adm</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Filial Comercial & Setores Administrativos de Lojas.</p>
                  </div>
                  {authorizedLayout !== 'tipo2' && <Lock className="absolute top-4 right-4 w-4 h-4 text-slate-400" />}
                  {authorizedLayout === 'tipo2' && <span className="text-[11px] font-bold text-blue-600 flex items-center group-hover:underline">Iniciar Inspeção <ArrowRight className="w-3.5 h-3.5 ml-1" /></span>}
                </div>

                <div onClick={() => handleOpenForm('tipo3')} className={`border rounded-xl p-5 cursor-pointer hover:border-slate-300 transition flex flex-col justify-between h-44 relative group overflow-hidden ${authorizedLayout === 'tipo3' ? 'border-blue-200 bg-blue-50/25' : 'border-slate-200 bg-slate-50/50 opacity-60 font-sans'}`}>
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
            <div className="bg-[#FAF9F6] rounded-xl border border-slate-200 overflow-hidden shadow-sm max-w-2xl font-sans">
              <div className="h-4 bg-slate-800" />
              <div className="p-6 space-y-6">
                <div className="bg-white rounded-lg p-6 border border-slate-200 space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                    {activeFormLayout === 'tipo1' ? 'Formulário Tipo 01: PneuDrive Serviços' : activeFormLayout === 'tipo2' ? 'Formulário Tipo 02: PneuBras Vendas & Administrativo' : 'Formulário Tipo 03: PneuBras Matriz'}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">O formulário está integrado no Google Drive SST PneuBras.</p>
                  <p className="text-xs text-slate-700 font-mono italic">Respondendo como: {user?.email}</p>
                </div>
                {!formSubmitted ? (
                  <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-4 text-xs">
                    {activeFormLayout === 'tipo1' && (
                      <div className="bg-white rounded-lg p-5 border border-slate-200 space-y-3">
                        <p className="font-bold text-slate-800 text-sm">1. Os mecânicos estão utilizando os protetores auriculares corretamente? *</p>
                        <div className="space-y-2 font-medium text-slate-600">
                          <label className="flex items-center space-x-2"><input type="radio" required name="qa1" className="text-slate-900 focus:ring-slate-800" /> <span>Sim, integralmente</span></label>
                          <label className="flex items-center space-x-2"><input type="radio" name="qa1" className="text-slate-900 focus:ring-slate-800" /> <span>Não utilizam</span></label>
                        </div>
                      </div>
                    )}
                    {/* Restante dos formulários omitidos para brevidade, mantenha como estava no seu código original */}
                    <div className="flex justify-between items-center pt-2">
                      <button type="button" onClick={() => setActiveFormLayout(null)} className="text-slate-600 font-bold hover:text-slate-800 underline">Voltar para a lista</button>
                      <button type="submit" className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded cursor-pointer text-xs">Enviar Respostas p/ Servidor</button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-white rounded-lg p-8 border border-slate-200 text-center space-y-4">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                    <h4 className="font-bold text-base text-slate-800">Resposta registrada!</h4>
                    <button type="button" onClick={() => { setActiveFormLayout(null); setFormSubmitted(false); }} className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded hover:bg-slate-50 text-xs cursor-pointer">Voltar aos Formulários</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. DIÁLOGOS DE SST */}
      {activeView === 'dialogos' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Diálogos de SST (Treinamento &amp; Pílulas de Conhecimento)</h2>
            <p className="text-xs text-slate-400 mt-1">Assista aos vídeos educativos de SSMA regulamentados e responda aos questionários.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pilulas.map((p) => {
              const info = getPillStatusForUser(p);
              const isLocked = info.status === 'Expirado';

              return (
                <div key={p.id} className="bg-slate-50 rounded-xl border border-slate-200 p-5 space-y-4 relative flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border bg-white ${info.status === 'Concluido' ? 'text-emerald-700 border-emerald-200' : info.status === 'Expirado' ? 'text-rose-700 border-rose-200' : 'text-slate-600 border-slate-200'}`}>
                        {info.status === 'Concluido' ? '✓ CONCLUÍDO' : info.status === 'Expirado' ? '✖ INTERROMPIDO' : '● PENDENTE'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Até {p.dataFim}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{p.titulo}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{p.descricao}</p>
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
                    <div className="space-y-4 pt-4 mt-4 border-t border-slate-200">
                      {info.status === 'Concluido' ? (
                        <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-lg text-xs font-semibold flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                          <span>Você já completou este diálogo com sucesso!</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-black">
                            <iframe src={p.videoUrl} title={p.titulo} className="w-full h-full border-none" allowFullScreen />
                          </div>
                          <button onClick={() => { setActiveQuizPill(p); setQuizFeedback(null); }} className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded transition cursor-pointer shadow-md">
                            Responder Quiz
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Modal de Quiz - Mantenha igual ao seu código original */}
          {activeQuizPill && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
               {/* Conteúdo do Modal (omitido aqui para encurtar a leitura, pode colar a sua versão) */}
               <div className="bg-white rounded-xl max-w-lg w-full p-6 font-sans">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-slate-900">{activeQuizPill.titulo}</h3>
                    <button onClick={() => { setActiveQuizPill(null); setQuizFeedback(null); }} className="text-slate-400 font-bold">Fechar</button>
                  </div>
                  {!quizFeedback ? (
                    <form onSubmit={handleQuizSubmit} className="space-y-4 text-xs">
                      <p className="font-bold">{activeQuizPill.quiz.pergunta}</p>
                      {activeQuizPill.quiz.opcoes.map((opcao, idx) => (
                        <label key={idx} className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer">
                          <input type="radio" name="quizOption" onChange={() => setSelectedQuizOption(idx)} checked={selectedQuizOption === idx} />
                          <span>{opcao}</span>
                        </label>
                      ))}
                      <button type="submit" disabled={selectedQuizOption === null} className="w-full py-2.5 bg-slate-900 text-white font-bold rounded cursor-pointer disabled:opacity-50">Gravar Resposta</button>
                    </form>
                  ) : (
                    <div className="text-center p-4 space-y-4">
                       <p className="font-bold text-slate-800">{quizFeedback.msg}</p>
                       <button onClick={() => { setActiveQuizPill(null); setQuizFeedback(null); }} className="px-4 py-2 bg-slate-100 font-bold rounded text-xs cursor-pointer">Avançar</button>
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