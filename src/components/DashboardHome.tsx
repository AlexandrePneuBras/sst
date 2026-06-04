import React, { useState } from 'react';
import { LayoutDashboard, Users, AlertTriangle, CheckCircle2, Star, Link, ExternalLink, RefreshCw, FolderOpen, Video } from 'lucide-react';
import { Colaborador, InspecaoForm, ConformidadeForm, AppConfig, QuizRespostum } from '../types';

interface DashboardHomeProps {
  colaboradores: Colaborador[];
  inspecoes: InspecaoForm[];
  conformidades: ConformidadeForm[];
  respostasQuiz: QuizRespostum[];
  config: AppConfig;
  onRefresh: () => void;
}

export default function DashboardHome({
  colaboradores,
  inspecoes,
  conformidades,
  respostasQuiz,
  config,
  onRefresh
}: DashboardHomeProps) {
  const [activeFrame, setActiveFrame] = useState<'none' | 'pbi' | 'looker'>('none');

  // Compute stats dynamically
  const emailColaboradoresCount = colaboradores.length;

  // Let's compute SST actions declared in forms (We can count questions/answers that have remarks/observacoes or are non-conforming)
  let sstActionsCount = 0;
  let nonConformitiesCount = 0;
  let totalAuditQuestions = 0;
  let conforAuditQuestions = 0;

  // From Inspecao
  inspecoes.forEach(ins => {
    Object.keys(ins.respostas).forEach((key: any) => {
      const resp = ins.respostas[key];
      totalAuditQuestions++;
      if (resp.status === 'Conforme') {
        conforAuditQuestions++;
      } else {
        nonConformitiesCount++;
      }
      if (resp.observacoes && resp.observacoes.trim().length > 0) {
        sstActionsCount++;
      }
    });
  });

  // From Conformidade
  conformidades.forEach(conf => {
    Object.keys(conf.respostas).forEach((key: any) => {
      const resp = conf.respostas[key];
      totalAuditQuestions++;
      if (resp.status === 'Conforme') {
        conforAuditQuestions++;
      } else {
        nonConformitiesCount++;
      }
      if (resp.referenciaLegal && resp.referenciaLegal.trim().length > 0) {
        // Actions can be represented by legal inputs on non-compliance
        sstActionsCount++;
      }
    });
  });

  // Total Quizzes pending and completed to show interactive pílulas stats
  const totalQuizCompleted = respostasQuiz.filter(r => r.status === 'Concluido').length;
  const totalQuizPending = respostasQuiz.filter(r => r.status === 'Pendente').length;
  const totalQuizExpired = respostasQuiz.filter(r => r.status === 'Expirado').length;

  // Degree of conformity (Percentage)
  const percentConformity = totalAuditQuestions > 0 
    ? Math.round((conforAuditQuestions / totalAuditQuestions) * 100)
    : 88; // Excellent default indicator

  const conformityGoal = 85;
  const isInsideGoal = percentConformity >= conformityGoal;

  return (
    <div className="space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-250 border-slate-200 shadow-sm">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center">
            Painel Consolidado de Gestão SST
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Acompanhamento consolidado de conformidades, termos legais e pílulas de conhecimento</p>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-2 px-3.5 py-1.5 border border-slate-300 text-xs font-semibold text-slate-600 rounded hover:bg-slate-50 transition cursor-pointer bg-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sincronizar Dados</span>
        </button>
      </div>

      {/* Grid of indicators / KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* KPI 1: Conformidade (%) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3 relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Grau de Conformidade</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-bold text-emerald-600">{percentConformity}%</span>
              <span className="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                +1.2%
              </span>
            </div>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(percentConformity, 100)}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Ações SST */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Ações SST Declaradas</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-2">
              {sstActionsCount}
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Registros salvos em vistorias
          </p>
        </div>

        {/* KPI 3: Não Conformidades */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pendências Ativas</span>
            <span className="text-3xl font-bold text-rose-500 block mt-2">
              {nonConformitiesCount}
            </span>
          </div>
          <p className="text-[10px] text-rose-500 font-medium mt-2">
            Requer atenção imediata
          </p>
        </div>

        {/* KPI 4: Colaboradores cadastrados */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Base Colaboradores</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-bold text-blue-600">
                {emailColaboradoresCount}
              </span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            E-mails de portaria sincronizados
          </p>
        </div>

        {/* KPI 5: Respostas a Pílulas / Treinamento */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none">Pílulas Respondidas</span>
            <div className="flex items-baseline mt-2">
              <span className="text-3xl font-bold text-slate-900">
                {totalQuizCompleted}
              </span>
              <span className="text-[10px] text-slate-400 ml-1">concluídas</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">
            Quizzes e pílulas respondidas
          </p>
        </div>
      </div>

      {/* Embedded Dashboards Segment (Power BI & Looker Studio switcher) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-150 border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Relatórios e Business Intelligence (BI) integrado</h2>
            <p className="text-xs text-slate-400">Alternar visualizadores oficiais configurados no painel de acessos</p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setActiveFrame(activeFrame === 'pbi' ? 'none' : 'pbi')}
              className={`px-4 py-1.5 rounded text-xs font-medium border transition cursor-pointer flex items-center space-x-2 ${
                activeFrame === 'pbi' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Power BI</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setActiveFrame(activeFrame === 'looker' ? 'none' : 'looker')}
              className={`px-4 py-1.5 rounded text-xs font-medium border transition cursor-pointer flex items-center space-x-2 ${
                activeFrame === 'looker' ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>Looker Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic iframe output */}
        {activeFrame !== 'none' ? (
          <div className="bg-slate-50 border-t border-slate-200">
            <div className="p-2.5 bg-slate-100/80 text-[10px] text-slate-600 text-center font-mono">
              Visualizando link interno: {activeFrame === 'pbi' ? config.pbiDashboardUrl : config.lookerStudioUrl}
            </div>
            <div className="aspect-video w-full max-h-[500px]">
              <iframe
                src={activeFrame === 'pbi' ? config.pbiDashboardUrl : config.lookerStudioUrl}
                className="w-full h-full border-none"
                title="SST Analytics Dashboard"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-12 text-center text-xs text-slate-400 flex flex-col items-center space-y-2">
            <LayoutDashboard className="w-10 h-10 text-slate-300 stroke-[1.2]" />
            <p className="font-bold text-slate-700 text-sm">Nenhum painel externo ativado para incorporação</p>
            <p className="max-w-sm text-[11px] text-slate-400">Use os botões de ação superiores para abrir os relatórios estruturados do Power BI ou Looker Studio neste painel.</p>
          </div>
        )}
      </div>

      {/* Links to Google Drive folders as requested */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Forms Folder Link */}
        <a
          href={config.gdriveFormsFolderUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between group hover:border-slate-300 transition-colors"
        >
          <div className="space-y-1.5">
            <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
              Legislação PneuBras
            </span>
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <FolderOpen className="w-4.5 h-4.5 mr-2 text-slate-600" />
              Diretório GDrive (Modelos &amp; PDFs)
            </h3>
            <p className="text-slate-400 text-xs">Pasta de destino onde os formulários físicos de SST são arquivados.</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg group-hover:bg-slate-100 transition-all text-slate-600">
            <ExternalLink className="w-4 h-4" />
          </div>
        </a>

        {/* Photos Folder Link */}
        <a
          href={config.gdrivePhotosFolderUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between group hover:border-slate-300 transition-colors"
        >
          <div className="space-y-1.5">
            <span className="bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
              Anexos e Vistorias
            </span>
            <h3 className="text-sm font-bold text-slate-800 flex items-center">
              <FolderOpen className="w-4.5 h-4.5 mr-2 text-slate-600" />
              Evidências &amp; Pasta de Fotos (GDrive)
            </h3>
            <p className="text-slate-400 text-xs">Pasta onde as imagens capturadas e evidências estão sendo enviadas.</p>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg group-hover:bg-slate-100 transition-all text-slate-600">
            <ExternalLink className="w-4 h-4" />
          </div>
        </a>
      </div>

      {/* Recent submissions brief stream */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 text-sm mb-4 uppercase tracking-wider text-xs">Atividade Recente de Formulários e Auditoria</h3>
        <div className="space-y-3">
          {inspecoes.length === 0 && conformidades.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Nenhuma atividade recente registrada nos relatórios.</p>
          ) : (
            <>
              {inspecoes.slice(0, 2).map((ins) => (
                <div key={ins.id} className="flex justify-between items-center bg-slate-50 p-3.5 rounded border border-slate-150 border-slate-200/50 text-xs text-slate-700">
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                    <div>
                      <p className="font-bold text-slate-850">Inspeção Física: {ins.unidade}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">Por <strong>{ins.inspetor}</strong> em {ins.data}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded font-bold">
                      INSPEÇÃO REGISTRADA
                    </span>
                  </div>
                </div>
              ))}
              {conformidades.slice(0, 2).map((conf) => (
                <div key={conf.id} className="flex justify-between items-center bg-slate-50 p-3.5 rounded border border-slate-150 border-slate-200/50 text-xs text-slate-700">
                  <div className="flex items-center space-x-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div>
                      <p className="font-bold text-slate-850">Conformidade Legal: {conf.unidade}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">Por <strong>{conf.auditor}</strong> em {conf.data}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded font-bold">
                      AUDITORIA CONCLUÍDA
                    </span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
