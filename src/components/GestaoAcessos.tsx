import React, { useState } from 'react';
import { Users, Newspaper, Video, GraduationCap, Plus, Trash2, Shield, Eye, ShieldAlert, Calendar, ArrowRight, Ban, CheckCircle } from 'lucide-react';
import { Colaborador, Noticia, PilulaTreinamento, QuizRespostum } from '../types';

interface GestaoAcessosProps {
  colaboradores: Colaborador[];
  noticias: Noticia[];
  pilulas: PilulaTreinamento[];
  respostasQuiz: QuizRespostum[];
  onAddColaborador: (col: Omit<Colaborador, 'id'>) => Promise<void>;
  onUpdateColaborador: (id: string, col: Partial<Colaborador>) => Promise<void>;
  onDeleteColaborador: (id: string) => Promise<void>;
  onAddNoticia: (noticia: Omit<Noticia, 'id' | 'dataCriacao'>) => Promise<void>;
  onDeleteNoticia: (id: string) => Promise<void>;
  onAddPilula: (pilula: Omit<PilulaTreinamento, 'id'>) => Promise<void>;
  onDeletePilula: (id: string) => Promise<void>;
}

export default function GestaoAcessos({
  colaboradores,
  noticias,
  pilulas,
  respostasQuiz,
  onAddColaborador,
  onUpdateColaborador,
  onDeleteColaborador,
  onAddNoticia,
  onDeleteNoticia,
  onAddPilula,
  onDeletePilula
}: GestaoAcessosProps) {
  const [activeSubTab, setActiveSubTab] = useState<'colaboradores' | 'noticias' | 'pilulas' | 'relatorios'>('colaboradores');

  // Helpers for filtering colaboradores
  const [filterNome, setFilterNome] = useState('');
  const [filterEmail, setFilterEmail] = useState('');
  const [filterLoja, setFilterLoja] = useState('');

  // Collaborator creation form
  const [newColNome, setNewColNome] = useState('');
  const [newColEmail, setNewColEmail] = useState('');
  const [newColLoja, setNewColLoja] = useState('');
  const [newColEmpresa, setNewColEmpresa] = useState<'PneuBras - Vendas' | 'PneuBras - Administrativo' | 'PneuBras - Matriz' | 'PneuDrive - Serviços'>('PneuDrive - Serviços');

  // Inactivation scheduler
  const [schedInativoData, setSchedInativoData] = useState('');
  const [selectedColToInactivate, setSelectedColToInactivate] = useState<string | null>(null);

  // News publication manager
  const [newsTitulo, setNewsTitulo] = useState('');
  const [newsDescricao, setNewsDescricao] = useState('');
  const [newsLink, setNewsLink] = useState('');
  const [newsImage, setNewsImage] = useState('');

  // Training Pills / educational videos manager
  const [pillTitulo, setPillTitulo] = useState('');
  const [pillDescricao, setPillDescricao] = useState('');
  const [pillVideoUrl, setPillVideoUrl] = useState('');
  const [pillQuizPergunta, setPillQuizPergunta] = useState('');
  const [pillQuizOpcaAO, setPillQuizOpcaaO] = useState('');
  const [pillQuizOpcaBO, setPillQuizOpcaBO] = useState('');
  const [pillQuizOpcaCO, setPillQuizOpcaCO] = useState('');
  const [pillQuizOpcaDO, setPillQuizOpcaDO] = useState('');
  const [pillQuizRespostaCorreta, setPillQuizRespostaCorreta] = useState<number>(0);
  const [pillDataInicio, setPillDataInicio] = useState(new Date().toISOString().split('T')[0]);
  const [pillDataFim, setPillDataFim] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.toISOString().split('T')[0];
  });

  const [notif, setNotif] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setNotif(msg);
    setTimeout(() => setNotif(null), 4000);
  };

  const clearAddColForm = () => {
    setNewColNome('');
    setNewColEmail('');
    setNewColLoja('');
  };

  const handleCreateColaborador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColNome || !newColEmail || !newColLoja) {
      showToast("Por favor preencha todos os campos do novo colaborador.");
      return;
    }
    try {
      await onAddColaborador({
        nome: newColNome,
        email: newColEmail,
        loja: newColLoja,
        empresa: newColEmpresa,
        status: 'Ativo'
      });
      clearAddColForm();
      showToast("Colaborador cadastrado com sucesso!");
    } catch (err: any) {
      showToast(err.message || "Erro ao cadastrar.");
    }
  };

  const handleStatusChange = async (colId: string, status: 'Ativo' | 'Bloqueado' | 'Inativo', inativoAteValue?: string) => {
    try {
      await onUpdateColaborador(colId, { 
        status, 
        inativoAte: status === 'Inativo' ? (inativoAteValue || '2026-06-30') : undefined 
      });
      showToast(`Status atualizado para: ${status}!`);
      setSelectedColToInactivate(null);
    } catch (e) {
      showToast("Não foi possível alterar status.");
    }
  };

  const handleCreateNoticia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitulo || !newsDescricao) {
      showToast("Por favor, preencha o título e a descrição da notícia.");
      return;
    }
    try {
      await onAddNoticia({
        titulo: newsTitulo,
        descricao: newsDescricao,
        linkOriginal: newsLink || "https://www.google.com",
        imageUrl: newsImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60"
      });
      setNewsTitulo('');
      setNewsDescricao('');
      setNewsLink('');
      setNewsImage('');
      showToast("Notícia SST de segurança publicada com sucesso!");
    } catch (e) {
      showToast("Erro ao publicar notícia.");
    }
  };

  const handleCreatePilula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pillTitulo || !pillDescricao || !pillQuizPergunta || !pillQuizOpcaAO || !pillQuizOpcaBO) {
      showToast("Defina título, descrição, pergunta e ao menos duas opções de resposta.");
      return;
    }

    const options = [pillQuizOpcaAO, pillQuizOpcaBO];
    if (pillQuizOpcaCO) options.push(pillQuizOpcaCO);
    if (pillQuizOpcaDO) options.push(pillQuizOpcaDO);

    try {
      await onAddPilula({
        titulo: pillTitulo,
        descricao: pillDescricao,
        videoUrl: pillVideoUrl || "https://www.youtube.com/embed/5D34B8m4qX0",
        quiz: {
          pergunta: pillQuizPergunta,
          opcoes: options,
          respostaCorreta: Math.min(pillQuizRespostaCorreta, options.length - 1)
        },
        dataInicio: pillDataInicio,
        dataFim: pillDataFim
      });

      setPillTitulo('');
      setPillDescricao('');
      setPillVideoUrl('');
      setPillQuizPergunta('');
      setPillQuizOpcaaO('');
      setPillQuizOpcaBO('');
      setPillQuizOpcaCO('');
      setPillQuizOpcaDO('');
      showToast("Pílula Educativa e Quiz cadastrados com sucesso!");
    } catch (e) {
      showToast("Erro ao cadastrar pílula.");
    }
  };

  const filteredColaboradores = colaboradores.filter(c => {
    const matchNome = c.nome.toLowerCase().includes(filterNome.toLowerCase());
    const matchEmail = c.email.toLowerCase().includes(filterEmail.toLowerCase());
    const matchLoja = c.loja.toLowerCase().includes(filterLoja.toLowerCase());
    return matchNome && matchEmail && matchLoja;
  });

  return (
    // Fundo transparente para aproveitar o wallpaper vindo do App.tsx
    <div className="w-full space-y-6">
      
      {/* Dynamic Alerts */}
      {notif && (
        <div className="p-3 bg-slate-900 text-white rounded text-xs font-mono fixed right-6 top-6 shadow-xl z-50 animate-fade-in border border-slate-950">
          {notif}
        </div>
      )}

      {/* Internal Navigation Subtabs (Wrapped in a white card for readability over the dark background) */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-slate-200 p-2 shadow-sm flex flex-wrap gap-1">
        <button
          onClick={() => setActiveSubTab('colaboradores')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'colaboradores' ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm' : 'border border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Controle de Acessos</span>
        </button>

        <button
          onClick={() => setActiveSubTab('noticias')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'noticias' ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm' : 'border border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>Painel de Notícias</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pilulas')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'pilulas' ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm' : 'border border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Gestão de Pílulas &amp; Quiz</span>
        </button>

        <button
          onClick={() => setActiveSubTab('relatorios')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-2 cursor-pointer ${
            activeSubTab === 'relatorios' ? 'bg-slate-100 text-slate-900 border border-slate-200 shadow-sm' : 'border border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Relatórios de Treinamento</span>
        </button>
      </div>

      {/* Subtab Contents */}

      {/* 1. COLLABORATORS (ACCESS MANAGEMENT) */}
      {activeSubTab === 'colaboradores' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List and filters */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-xl lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold text-gray-800">Base Colaboradores SST</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold border border-slate-200">
                {filteredColaboradores.length} listados
              </span>
            </div>

            {/* In-app Filtering */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Filtrar por nome..."
                value={filterNome}
                onChange={(e) => setFilterNome(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Filtrar por e-mail..."
                value={filterEmail}
                onChange={(e) => setFilterEmail(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-emerald-500"
              />
              <input
                type="text"
                placeholder="Filtrar por loja..."
                value={filterLoja}
                onChange={(e) => setFilterLoja(e.target.value)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:border-emerald-500"
              />
            </div>

            <div className="overflow-x-auto border border-gray-100 rounded-xl shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-gray-200">
                    <th className="p-3">Nome / Loja</th>
                    <th className="p-3">E-mail de Trabalho</th>
                    <th className="p-3">Tipo de Filtro</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredColaboradores.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 bg-white">
                      <td className="p-3">
                        <p className="font-bold text-gray-900">{c.nome}</p>
                        <p className="text-[10px] text-gray-400">{c.loja}</p>
                      </td>
                      <td className="p-3">
                        <span className="font-mono text-slate-600">{c.email}</span>
                      </td>
                      <td className="p-3 text-gray-500 font-semibold text-[10px]">
                        {c.empresa}
                      </td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          c.status === 'Ativo' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          c.status === 'Bloqueado' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          {c.status} {c.status === 'Inativo' && c.inativoAte ? `(Até ${c.inativoAte})` : ''}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          title="Ativar acesso"
                          onClick={() => handleStatusChange(c.id, 'Ativo')}
                          className="p-1 text-emerald-600 border border-emerald-100 rounded hover:bg-emerald-50 cursor-pointer bg-white"
                        >
                          Ativar
                        </button>
                        <button
                          title="Bloquear acesso temporário"
                          onClick={() => handleStatusChange(c.id, 'Bloqueado')}
                          className="p-1 text-red-600 border border-red-100 rounded hover:bg-red-50 cursor-pointer bg-white"
                        >
                          Bloquear
                        </button>
                        <button
                          title="Inativar Programado"
                          onClick={() => setSelectedColToInactivate(c.id)}
                          className="p-1 text-amber-600 border border-amber-100 rounded hover:bg-amber-50 cursor-pointer bg-white"
                        >
                          Programar
                        </button>
                        <button
                          title="Excluir Colaborador"
                          onClick={() => onDeleteColaborador(c.id)}
                          className="p-1 text-rose-600 border border-rose-100 rounded hover:bg-rose-50 cursor-pointer bg-white"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Scheduled Inactivation selector overlay */}
            {selectedColToInactivate && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2 text-xs shadow-sm">
                <p className="font-semibold text-amber-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-amber-600" />
                  Programar Inativação Temporária de Colaborador
                </p>
                <div className="flex items-center space-x-3">
                  <input
                    type="date"
                    value={schedInativoData}
                    onChange={(e) => setSchedInativoData(e.target.value)}
                    className="p-1.5 border border-amber-300 rounded text-gray-800 bg-white"
                  />
                  <button
                    onClick={() => handleStatusChange(selectedColToInactivate, 'Inativo', schedInativoData)}
                    className="px-3 py-1.5 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 cursor-pointer shadow-sm"
                  >
                    Confirmar Trava
                  </button>
                  <button
                    onClick={() => setSelectedColToInactivate(null)}
                    className="text-gray-500 hover:text-gray-800 underline font-semibold"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Register Form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-xl h-fit">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
              <Plus className="w-4 h-4 mr-1 text-emerald-500" />
              Cadastrar Colaborador
            </h3>
            <form onSubmit={handleCreateColaborador} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 font-semibold mb-1">Nome Completo</label>
                <input
                  type="text"
                  placeholder="Carlos Silva"
                  value={newColNome}
                  onChange={(e) => setNewColNome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">E-mail Corporativo</label>
                <input
                  type="email"
                  placeholder="silva@pneubras.com.br"
                  value={newColEmail}
                  onChange={(e) => setNewColEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Unidade / Loja Física</label>
                <input
                  type="text"
                  placeholder="Ex: Filial Sul"
                  value={newColLoja}
                  onChange={(e) => setNewColLoja(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Empresa de Atuação</label>
                <select
                  value={newColEmpresa}
                  onChange={(e: any) => setNewColEmpresa(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none bg-white font-semibold text-gray-700 focus:border-emerald-400"
                >
                  <option value="PneuDrive - Serviços">PneuDrive - Serviços (Layout Tipo 1)</option>
                  <option value="PneuBras - Vendas">PneuBras - Vendas (Layout Tipo 2)</option>
                  <option value="PneuBras - Administrativo">PneuBras - Administrativo (Layout Tipo 2)</option>
                  <option value="PneuBras - Matriz">PneuBras - Matriz (Layout Tipo 3)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 cursor-pointer transition shadow-md"
              >
                Salvar Colaborador na Base
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. NEWS CONFIG PANEL */}
      {activeSubTab === 'noticias' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-xl lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Notícias SSMA Publicadas</h3>
            <div className="space-y-4">
              {noticias.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Nenhuma notícia publicada ainda.</p>
              ) : (
                noticias.map((n) => (
                  <div key={n.id} className="flex gap-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm group relative">
                    <img
                      src={n.imageUrl}
                      alt={n.titulo}
                      className="w-20 h-20 object-cover rounded-lg border border-gray-100 flex-shrink-0"
                    />
                    <div className="space-y-1 text-xs">
                      <h4 className="font-bold text-gray-900 group-hover:text-emerald-600 transition">{n.titulo}</h4>
                      <p className="text-gray-500 line-clamp-2">{n.descricao}</p>
                      <p className="text-[10px] text-gray-400 italic">Link de Origem: {n.linkOriginal}</p>
                    </div>
                    <button
                      onClick={() => onDeleteNoticia(n.id)}
                      className="absolute right-3 top-3 p-1.5 border border-red-100 bg-white text-red-500 hover:bg-red-50 rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form to post news */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-xl h-fit">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
              <Newspaper className="w-4 h-4 mr-1 text-emerald-500" />
              Publicar Notícia
            </h3>
            <form onSubmit={handleCreateNoticia} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 font-semibold mb-1">Título da Manchete</label>
                <input
                  type="text"
                  placeholder="Acidentes zero na filial Sul esta semana"
                  value={newsTitulo}
                  onChange={(e) => setNewsTitulo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Resumo / Descrição curta</label>
                <textarea
                  rows={3}
                  placeholder="Descreva brevemente os detalhes técnicos e as conquistas regulatórias..."
                  value={newsDescricao}
                  onChange={(e) => setNewsDescricao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Link de Origem (Completo)</label>
                <input
                  type="text"
                  placeholder="https://g1.globo.com/..."
                  value={newsLink}
                  onChange={(e) => setNewsLink(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">URL da Imagem Ilustrativa</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={newsImage}
                  onChange={(e) => setNewsImage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 cursor-pointer shadow-md transition"
              >
                Publicar Notícia SSMA
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. SHIELD PILLS VIDEO & QUIZ MANAGER */}
      {activeSubTab === 'pilulas' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-xl lg:col-span-2 space-y-4">
            <h3 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Pílulas de Conhecimento Registradas</h3>
            <div className="space-y-4">
              {pilulas.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">Nenhuma pílula de conhecimento cadastrada ainda.</p>
              ) : (
                pilulas.map((p) => (
                  <div key={p.id} className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm group relative text-xs">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">{p.titulo}</h4>
                      <button
                        onClick={() => onDeletePilula(p.id)}
                        className="p-1 border border-red-100 bg-white text-red-500 hover:bg-red-50 rounded cursor-pointer shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-gray-500 mb-3">{p.descricao}</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <div>
                        <p className="text-[10px] text-gray-400">DATA DISPONIBILIZAÇÃO:</p>
                        <p className="font-bold font-mono text-gray-700">{p.dataInicio}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400">DATA LIMITE DE TRAVA:</p>
                        <p className="font-bold font-mono text-gray-700">{p.dataFim}</p>
                      </div>
                      <div className="col-span-2 md:col-span-1">
                        <p className="text-[10px] text-gray-400">QUESTÃO DO QUIZ:</p>
                        <p className="font-bold text-emerald-700 truncate">{p.quiz?.pergunta}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form to submit pill */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-xl h-fit">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center border-b border-gray-100 pb-2">
              <Video className="w-4 h-4 mr-1 text-emerald-500" />
              Nova Pílula &amp; Quiz
            </h3>
            <form onSubmit={handleCreatePilula} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-500 font-semibold mb-1">Título do Vídeo Aula</label>
                <input
                  type="text"
                  placeholder="NR-06: Princípios de Proteção Ocular"
                  value={pillTitulo}
                  onChange={(e) => setPillTitulo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Descrição Curta</label>
                <input
                  type="text"
                  placeholder="Orientações e normas para operador de montadora..."
                  value={pillDescricao}
                  onChange={(e) => setPillDescricao(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-gray-500 font-semibold mb-1">Link de Incorporação (YouTube Embed)</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/embed/5D34B8m4qX0"
                  value={pillVideoUrl}
                  onChange={(e) => setPillVideoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-emerald-400"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                <p className="font-bold text-slate-800 border-b border-slate-200 pb-1 uppercase tracking-wider text-[10px]">Configuração do Questionário Quiz</p>
                
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Pergunta do Quiz</label>
                  <input
                    type="text"
                    placeholder="Qual o EPI para ruídos?"
                    value={pillQuizPergunta}
                    onChange={(e) => setPillQuizPergunta(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-gray-800 focus:border-emerald-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-gray-500">Opção A</label>
                    <input type="text" placeholder="Opção 1" value={pillQuizOpcaAO} onChange={e => setPillQuizOpcaaO(e.target.value)} className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">Opção B</label>
                    <input type="text" placeholder="Opção 2" value={pillQuizOpcaBO} onChange={e => setPillQuizOpcaBO(e.target.value)} className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">Opção C (Opcional)</label>
                    <input type="text" placeholder="Opção 3" value={pillQuizOpcaCO} onChange={e => setPillQuizOpcaCO(e.target.value)} className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:border-emerald-400" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500">Opção D (Opcional)</label>
                    <input type="text" placeholder="Opção 4" value={pillQuizOpcaDO} onChange={e => setPillQuizOpcaDO(e.target.value)} className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs outline-none focus:border-emerald-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Opção Correta (Índice)</label>
                  <select
                    value={pillQuizRespostaCorreta}
                    onChange={(e: any) => setPillQuizRespostaCorreta(parseInt(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded text-gray-700 outline-none focus:border-emerald-400"
                  >
                    <option value={0}>Opção A Correta</option>
                    <option value={1}>Opção B Correta</option>
                    <option value={2}>Opção C Correta</option>
                    <option value={3}>Opção D Correta</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Disponibilização</label>
                  <input
                    type="date"
                    value={pillDataInicio}
                    onChange={(e) => setPillDataInicio(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-500 font-semibold mb-1">Prazo de Bloqueio</label>
                  <input
                    type="date"
                    value={pillDataFim}
                    onChange={(e) => setPillDataFim(e.target.value)}
                    className="w-full px-2 py-1.5 border border-gray-200 rounded outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 cursor-pointer shadow-md transition"
              >
                Cadastrar Pílula e Bloqueios
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 4. CONSOLIDATED ENGAGEMENT REPORT TABLE */}
      {activeSubTab === 'relatorios' && (
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-800 text-sm">Relatórios e Aproveitamento Geral dos Diálogos</h3>
              <p className="text-[11px] text-gray-500">Verificação de logs e quizzes respondidos pelos colaboradores dentro do prazo legal</p>
            </div>
            <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full font-bold shadow-sm">
              Desempenho Corporativo
            </span>
          </div>

          <div className="overflow-x-auto border border-gray-200 rounded-xl text-xs shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-gray-200 text-[10px]">
                  <th className="p-3">Nome do Colaborador</th>
                  <th className="p-3">E-mail</th>
                  <th className="p-3">Pílula de SST</th>
                  <th className="p-3">Assistiu Vídeo</th>
                  <th className="p-3">Quiz Answer</th>
                  <th className="p-3">Resultado</th>
                  <th className="p-3">Status de Trava</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {respostasQuiz.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-gray-400 bg-white">Nenhum log de participação registrado.</td>
                  </tr>
                ) : (
                  respostasQuiz.map((rep) => {
                    const pill = pilulas.find(p => p.id === rep.pilulaId);
                    return (
                      <tr key={rep.id} className="hover:bg-slate-50 bg-white">
                        <td className="p-3 font-bold text-gray-900">{rep.colaboradorNome}</td>
                        <td className="p-3 font-mono text-gray-500">{rep.colaboradorEmail}</td>
                        <td className="p-3 font-semibold text-gray-700">{pill ? pill.titulo : "Pílula Removida"}</td>
                        <td className="p-3">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${
                            rep.assistiuVideo ? 'bg-emerald-50 text-emerald-700 font-bold border-emerald-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                          }`}>
                            {rep.assistiuVideo ? "SIM" : "NÃO"}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${
                            rep.respondeuQuiz ? 'bg-blue-50 text-blue-700 font-bold border-blue-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                          }`}>
                            {rep.respondeuQuiz ? "RESPONDIDO" : "-"}
                          </span>
                        </td>
                        <td className="p-3">
                          {rep.respondeuQuiz ? (
                            <span className={`inline-block px-2 py-0.5 rounded-full font-bold text-[9px] border ${
                              rep.acertou ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                              {rep.acertou ? "ACERTOU VISTORIA" : "ERROU"}
                            </span>
                          ) : "-"}
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2 py-0.5 rounded font-black text-[9px] border ${
                            rep.status === 'Concluido' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            rep.status === 'Pendente' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {rep.status?.toUpperCase() || 'EXPIRED'}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}