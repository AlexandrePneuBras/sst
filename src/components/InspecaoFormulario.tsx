import React, { useState } from 'react';
import { FileText, Mail, FileUp, Folder, Download, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { InspecaoForm } from '../types';

interface InspecaoFormProps {
  user: any;
  config: any;
  onSaved: () => void;
}

const QUESTIONS = [
  {
    id: 1,
    categoria: "Equipamentos (Elevadores Automotivos)",
    texto: "Os elevadores automotivos estão com a manutenção preventiva em dia, apresentam travas de segurança mecânicas funcionais e sapatas de borracha em bom estado?"
  },
  {
    id: 2,
    categoria: "Equipamentos (Compressores de Ar)",
    texto: "O compressor de ar possui prontuário/laudo de inspeção (NR-13) válido, manômetro operante e está instalado em local ventilado e protegido contra impactos?"
  },
  {
    id: 3,
    categoria: "Máquinas e Ferramentas",
    texto: "As máquinas montadoras e balanceadoras de pneus possuem proteções físicas nas partes móveis e aterramento elétrico adequado?"
  },
  {
    id: 4,
    categoria: "Uso de EPIs (Mecânicos e Alinhadores)",
    texto: "Os colaboradores estão utilizando corretamente os EPIs obrigatórios no pátio de serviços (botina de segurança, óculos de proteção, luvas adequadas e protetor auricular)?"
  },
  {
    id: 5,
    categoria: "Produtos Químicos e Resíduos",
    texto: "Óleos lubrificantes, graxas e solventes estão armazenados em local contido? Há coletores específicos para descarte de óleo usado e estopas contaminadas?"
  },
  {
    id: 6,
    categoria: "Organização e Limpeza do Ambiente",
    texto: "O piso da área de serviços (valetas, boxes de alinhamento) está limpo, desobstruído e livre de poças de óleo/água que possam causar escorregões?"
  },
  {
    id: 7,
    categoria: "Prevenção e Combate a Incêndio",
    texto: "Os extintores de incêndio estão desobstruídos, com a sinalização visível e dentro do prazo de validade da carga e do teste hidrostático?"
  }
];

export default function InspecaoFormulario({ user, config, onSaved }: InspecaoFormProps) {
  const [unidade, setUnidade] = useState('');
  const [inspetor, setInspetor] = useState(user?.nome || '');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  
  // NOVO: Estado para armazenar o e-mail de destino escolhido na hora
  const [emailDestino, setEmailDestino] = useState(user?.email || '');
  
  // Respostas state
  const [respostas, setRespostas] = useState<{
    [perguntaId: number]: {
      status: 'Conforme' | 'Não Conforme' | 'Outros';
      observacoes: string;
      fotos: { name: string; url: string }[];
    }
  }>(() => {
    const initial: any = {};
    QUESTIONS.forEach(q => {
      initial[q.id] = {
        status: 'Conforme',
        observacoes: '',
        fotos: []
      };
    });
    return initial;
  });

  const [notificacao, setNotificacao] = useState<{ tipo: 'sucesso' | 'erro'; msg: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleStatusChange = (qId: number, status: 'Conforme' | 'Não Conforme' | 'Outros') => {
    setRespostas(prev => ({
      ...prev,
      [qId]: { ...prev[qId], status }
    }));
  };

  const handleObservacoesChange = (qId: number, value: string) => {
    setRespostas(prev => ({
      ...prev,
      [qId]: { ...prev[qId], observacoes: value }
    }));
  };

  const handleFileUpload = (qId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (respostas[qId].fotos.length + files.length > 5) {
      alert("Máximo de 5 fotos por pergunta.");
      return;
    }

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRespostas(prev => {
          const currentPhotos = prev[qId].fotos;
          if (currentPhotos.length >= 5) return prev;
          return {
            ...prev,
            [qId]: {
              ...prev[qId],
              fotos: [...currentPhotos, { name: file.name, url: reader.result as string }]
            }
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (qId: number, index: number) => {
    setRespostas(prev => ({
      ...prev,
      [qId]: {
        ...prev[qId],
        fotos: prev[qId].fotos.filter((_, idx) => idx !== index)
      }
    }));
  };

  const triggerNotification = (tipo: 'sucesso' | 'erro', msg: string) => {
    setNotificacao({ tipo, msg });
    setTimeout(() => setNotificacao(null), 5000);
  };

  // Submit Flow com verificação do email e CORS bypass
  const handleSubmit = async (enviarEmail: boolean, enviarGDrive: boolean) => {
    if (!unidade.trim()) {
      triggerNotification('erro', 'Por favor, informe a Unidade/Loja.');
      return;
    }

    // Trava de segurança: impede o envio se o e-mail não for preenchido
    if (enviarEmail && !emailDestino.trim()) {
      triggerNotification('erro', 'Por favor, informe o e-mail de destino.');
      return;
    }

    setLoading(true);
    try {
      const mappedRespostas: any = {};
      Object.keys(respostas).forEach((key: any) => {
        mappedRespostas[key] = {
          status: respostas[key].status,
          observacoes: respostas[key].observacoes,
          fotos: respostas[key].fotos.map((f: any) => f.url) 
        };
      });

      const payload = {
        tipoDoc: 'Inspecao',
        unidade,
        inspetor,
        data,
        respostas: mappedRespostas,
        enviarEmail,
        enviarGDrive,
        emailDestino: emailDestino, // Aqui o sistema puxa o e-mail digitado no input
        pastaDestinoUrl: config.gdriveFormsFolderUrl
      };

      // SUBSTITUA POR SUA URL DO GOOGLE APPS SCRIPT
      const endpoint = 'https://script.google.com/macros/s/AKfycbyr9wA3Vp7Es0-LWn68oVrhhSLRHsrZ_7k9CF8JAJAeYVBvGxCb276SagUUAeygPpCwpQ/exec';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Contorna o bloqueio de CORS
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Falha na resposta do webhook');
      }

      let msg = "Formulário de Inspeção salvo com sucesso!";
      if (enviarEmail && enviarGDrive) {
        msg = `Inspeção salva! Enviado e-mail para ${emailDestino} e arquivado no GDrive.`;
      } else if (enviarEmail) {
        msg = `Inspeção salva! E-mail enviado com sucesso para ${emailDestino}.`;
      } else if (enviarGDrive) {
        msg = `Inspeção salva! Registrada e arquivada legalmente no GDrive.`;
      }
      
      triggerNotification('sucesso', msg);
      onSaved();
    } catch (e) {
      triggerNotification('erro', 'Erro de conexão com o integrador. O envio falhou.');
    } finally {
      setLoading(false);
    }
  };

  // Printable view toggle for clean PDF compilation
  const handlePrint = () => {
    if (!unidade.trim()) {
      triggerNotification('erro', 'Por favor, preencha a Loja primeiro para gerar um relatório estruturado.');
      return;
    }
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1 font-sans" id="full-inspecao-container">
      {/* Visual notification bar */}
      {notificacao && (
        <div className={`p-4 rounded-lg flex items-center shadow-sm animate-fade-in text-xs ${
          notificacao.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 font-medium' : 'bg-rose-50 text-rose-800 border-l-4 border-rose-500 font-medium'
        }`}>
          {notificacao.tipo === 'sucesso' ? (
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-650" />
          )}
          <span>{notificacao.msg}</span>
        </div>
      )}

      {/* Header card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Inspeção &amp; Conformidade SST</h1>
            <p className="text-xs text-slate-500">Inspeção física e operacional - Varejo de Pneus e Serviços Automotivos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Unidade / Loja (CNPJ)</label>
            <input
              type="text"
              id="inspecao-unidade-input"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              placeholder="Ex: Filial Serviços Centro"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded text-slate-800 outline-none focus:border-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome do Inspetor</label>
            <input
              type="text"
              id="inspecao-inspetor-input"
              value={inspetor}
              onChange={(e) => setInspetor(e.target.value)}
              placeholder="Ex: Técnico de Segurança"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-slate-50 text-slate-500 rounded outline-none block"
              disabled
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data da Inspeção</label>
            <input
              type="date"
              id="inspecao-data-input"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded text-slate-800 outline-none focus:border-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Questions Stack */}
      <div className="space-y-6">
        {QUESTIONS.map((q, qIndex) => {
          const resp = respostas[q.id];
          return (
            <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 mb-2">
                    {q.categoria}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {q.id}. {q.texto}
                  </h3>
                </div>
              </div>

              {/* Status Radio Elements */}
              <div className="flex flex-wrap gap-2 pt-1">
                {(['Conforme', 'Não Conforme', 'Outros'] as const).map(status => {
                  const isActive = resp.status === status;
                  let colorClass = "";
                  if (isActive) {
                    if (status === 'Conforme') colorClass = "bg-emerald-50 text-emerald-800 border-emerald-300";
                    else if (status === 'Não Conforme') colorClass = "bg-rose-50 text-rose-800 border-rose-300";
                    else colorClass = "bg-amber-50 text-amber-800 border-amber-300";
                  } else {
                    colorClass = "bg-white text-slate-600 border-slate-200 hover:bg-slate-50";
                  }

                  return (
                    <button
                      key={status}
                      type="button"
                      id={`btn-status-${q.id}-${status}`}
                      onClick={() => handleStatusChange(q.id, status)}
                      className={`px-3 py-1.5 text-xs font-semibold border rounded cursor-pointer transition ${colorClass}`}
                    >
                      <span>{status}</span>
                    </button>
                  );
                })}
              </div>

              {/* Comments Field */}
              <div className="space-y-1">
                <input
                  type="text"
                  id={`observations-${q.id}`}
                  value={resp.observacoes}
                  onChange={(e) => handleObservacoesChange(q.id, e.target.value)}
                  placeholder="Observações, medidas corretivas urgentes ou justificativas..."
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-800 outline-none focus:border-slate-800"
                />
              </div>

              {/* Photo Upload Panel */}
              <div className="pt-2 space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase flex items-center">
                  <FileUp className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Evidências Fotográficas / Fotos (Máx. 5)
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {/* File Slots */}
                  {resp.fotos.map((foto, fIdx) => (
                    <div key={fIdx} className="relative aspect-square border border-slate-200 rounded overflow-hidden group">
                      <img src={foto.url} alt={foto.name} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(q.id, fIdx)}
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                      <div className="absolute bottom-1 left-1 right-1 truncate text-[8px] text-white bg-slate-900/40 px-1 rounded text-center">
                        FOTO {fIdx + 1}
                      </div>
                    </div>
                  ))}

                  {/* Add Slot if < 5 */}
                  {resp.fotos.length < 5 && (
                    <label className="aspect-square border border-dashed border-slate-200 rounded-lg hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center group">
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-slate-650 mb-1" />
                      <span className="text-[10px] text-slate-400 font-bold group-hover:text-slate-650">ANEXAR FOTO</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleFileUpload(q.id, e)}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons list com Input Dinâmico de E-mail */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
        <div className="text-xs text-slate-400 leading-normal">
          <p className="font-bold text-slate-500 uppercase tracking-wide">Opções Legais e Execução Técnica</p>
          <p>O preenchimento gera arquivamento instantâneo do histórico.</p>
        </div>

        <div className="flex flex-col md:flex-row items-end justify-between gap-4 pt-4 border-t border-slate-100">
          
          {/* Campo para o Gestor inserir o e-mail desejado */}
          <div className="w-full md:w-1/2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">E-mail para envio do relatório:</label>
            <input
              type="email"
              value={emailDestino}
              onChange={(e) => setEmailDestino(e.target.value)}
              placeholder="informe.o.email@pneubras.com.br"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
            <button
              type="button"
              id="btn-inspecao-imprimir-pdf"
              disabled={loading}
              onClick={handlePrint}
              className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded flex items-center cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              {loading ? 'Processando...' : 'Salvar formato .PDF'}
            </button>

            <button
              type="button"
              id="btn-inspecao-submit-gdrive"
              disabled={loading}
              onClick={() => handleSubmit(false, true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center cursor-pointer disabled:opacity-50"
            >
              <Folder className="w-3.5 h-3.5 mr-1.5" />
              {loading ? 'Processando...' : 'Enviar para GDrive'}
            </button>

            <button
              type="button"
              id="btn-inspecao-submit-email"
              disabled={loading}
              onClick={() => handleSubmit(true, false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded flex items-center cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              {loading ? 'Processando...' : 'Enviar para E-mail'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden layout specifically customized for PRINT option styling */}
      {isExporting && (
        <>
          <style type="text/css">
            {`
              @media print {
                body * {
                  visibility: hidden;
                }
                #inspecao-printable-pdf-document, #inspecao-printable-pdf-document * {
                  visibility: visible;
                }
                #inspecao-printable-pdf-document {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                  background: white;
                  padding: 20px;
                }
              }
            `}
          </style>
          
          <div className="fixed inset-0 bg-white z-[9999] p-8 overflow-y-auto" id="inspecao-printable-pdf-document">
            <div className="border border-gray-300 p-8 rounded-lg max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-gray-300">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-gray-900">RELATÓRIO DE INSPEÇÃO SST</h1>
                  <p className="text-xs text-gray-500 uppercase font-mono tracking-wider">PneuBras &amp; PneuDrive - Relatório Oficial de Auditoria Física</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">CÓDIGO: PB-INS-{Date.now().toString().slice(-4)}</p>
                  <p className="text-xs text-gray-400">Data de Geração: {data}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-sm py-4 bg-gray-50 p-4 rounded border border-gray-200">
                <div>
                  <p className="text-xs font-semibold text-gray-400">UNIDADE / LOJA:</p>
                  <p className="font-bold text-gray-800">{unidade}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">INSPETOR RESPONSÁVEL:</p>
                  <p className="font-bold text-gray-800">{inspetor}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400">DATA DA INSPEÇÃO:</p>
                  <p className="font-bold text-gray-800">{data}</p>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                {QUESTIONS.map((q) => (
                  <div key={q.id} className="pb-4 border-b border-gray-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-gray-800 text-sm">
                        {q.id}. {q.texto}
                      </p>
                      <span className={`px-2 py-0.5 text-xs font-black rounded border ${
                        respostas[q.id].status === 'Conforme' ? 'bg-green-100 text-green-800 border-green-300' :
                        respostas[q.id].status === 'Não Conforme' ? 'bg-red-100 text-red-800 border-red-300' :
                        'bg-yellow-100 text-yellow-800 border-yellow-300'
                      }`}>
                        {respostas[q.id].status.toUpperCase()}
                      </span>
                    </div>
                    {respostas[q.id].observacoes && (
                      <p className="text-xs bg-gray-50 p-2 rounded italic text-gray-600 border-l-2 border-gray-400">
                        <strong>Obs:</strong> {respostas[q.id].observacoes}
                      </p>
                    )}
                    {respostas[q.id].fotos.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {respostas[q.id].fotos.map((foto, idx) => (
                          <div key={idx} className="w-16 h-16 rounded border overflow-hidden">
                            <img src={foto.url} alt="anexo" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        <span className="text-[10px] text-gray-400 self-end">({respostas[q.id].fotos.length} fotos anexadas)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs">
                <div className="border-t border-gray-400 pt-4">
                  <p className="font-bold text-gray-800">{inspetor}</p>
                  <p className="text-gray-400">Assinatura Eletrônica do Inspetor</p>
                </div>
                <div className="border-t border-gray-400 pt-4">
                  <p className="font-bold text-gray-800">Equipe SST Matriz PneuBras</p>
                  <p className="text-gray-400">Responsável Geral SST / Engenharia</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}