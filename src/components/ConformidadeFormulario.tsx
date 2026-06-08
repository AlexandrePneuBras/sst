import React, { useState } from 'react';
import { ShieldCheck, Mail, FolderOpen, Download, AlertTriangle, Plus, Trash2, CheckSquare } from 'lucide-react';
import { ConformidadeForm } from '../types';

interface ConformidadeFormProps {
  user: any;
  config: any;
  onSaved: () => void;
}

const QUESTIONS = [
  {
    id: 1,
    nrReference: "Gestão de Riscos (NR-01 e NR-07)",
    texto: "O Programa de Gerenciamento de Riscos (PGR) e o PCMSO da unidade estão atualizados, vigentes e os Atestados de Saúde Ocupacional (ASO) dos mecânicos estão arquivados e dentro da validade?",
    legalRef: "NR-01 item 1.5 e NR-07"
  },
  {
    id: 2,
    nrReference: "Controle de EPIs (NR-06)",
    texto: "As fichas de controle de entrega de EPIs estão preenchidas, assinadas individualmente pelos colaboradores e registram o número do Certificado de Aprovação (CA) válido para cada item entregue?",
    legalRef: "NR-06 item 6.1"
  },
  {
    id: 3,
    nrReference: "Laudos de Equipamentos (NR-13)",
    texto: "O(s) compressor(es) de ar da oficina possui(em) prontuário físico atualizado, laudo de inspeção rigorosa vigente (teste hidrostático/espessura) e ART assinada por engenheiro responsável?",
    legalRef: "NR-13 item 13.4"
  },
  {
    id: 4,
    nrReference: "Treinamento e Capacitação (NR-11 e NR-12)",
    texto: "Os mecânicos e alinhadores possuem certificados válidos de treinamento para operação segura de máquinas (desmontadoras/balanceadoras) e, se aplicável, para operação de empilhadeiras?",
    legalRef: "NR-11 e NR-12 item 12.16"
  },
  {
    id: 5,
    nrReference: "Produtos Químicos (NR-26)",
    texto: "As Fichas de Informação de Segurança de Produtos Químicos (FISPQ) de todos os óleos, solventes, graxas e fluidos utilizados estão impressas, atualizadas e disponíveis para consulta imediata na área de serviço?",
    legalRef: "NR-26 item 26.2"
  },
  {
    id: 6,
    nrReference: "Prevenção de Incêndio (NR-23)",
    texto: "O Auto de Vistoria do Corpo de Bombeiros (AVCB) ou CLCB da loja está dentro do prazo de validade, em nome da razão social correta e afixado em local visível ao público e aos funcionários?",
    legalRef: "NR-23"
  },
  {
    id: 7,
    nrReference: "Manutenção de Equipamentos (NR-12)",
    texto: "Existe um cronograma documentado e registros (ordens de serviço/notas fiscais) comprovando a realização da manutenção preventiva dos elevadores automotivos por empresa/profissional qualificado?",
    legalRef: "NR-12 item 12.11"
  }
];

export default function ConformidadeFormulario({ user, config, onSaved }: ConformidadeFormProps) {
  const [unidade, setUnidade] = useState('');
  const [auditor, setAuditor] = useState(user?.nome || '');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);

  // NOVO: Estado para armazenar o e-mail de destino escolhido pelo Gestor
  const [emailDestino, setEmailDestino] = useState(user?.email || '');

  // Respostas
  const [respostas, setRespostas] = useState<{
    [perguntaId: number]: {
      status: 'Conforme' | 'Não Conforme' | 'Outros';
      referenciaLegal: string;
      fotos: { name: string; url: string }[];
    }
  }>(() => {
    const initial: any = {};
    QUESTIONS.forEach(q => {
      initial[q.id] = {
        status: 'Conforme',
        referenciaLegal: q.legalRef,
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

  const handleRefSelectionChange = (qId: number, value: string) => {
    setRespostas(prev => ({
      ...prev,
      [qId]: { ...prev[qId], referenciaLegal: value }
    }));
  };

  const handleFileUpload = (qId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (respostas[qId].fotos.length + files.length > 5) {
      alert("Máximo de 5 fotos de evidência.");
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

  // Submit Flow Atualizado (CORS Bypass + Dynamic Email)
  const handleSubmit = async (enviarEmail: boolean, enviarGDrive: boolean) => {
    if (!unidade.trim()) {
      triggerNotification('erro', 'Por favor, informe a Unidade/Loja para fins fiscais.');
      return;
    }

    if (enviarEmail && !emailDestino.trim()) {
      triggerNotification('erro', 'Por favor, informe o e-mail de destino.');
      return;
    }

    setLoading(true);
    try {
      const mappedRespostas: any = {};
      Object.keys(respostas).forEach((key: any) => {
        const questionData = QUESTIONS.find(q => q.id.toString() === key.toString());
        mappedRespostas[key] = {
          pergunta: questionData ? `${questionData.texto} (Ref: ${questionData.nrReference})` : `Pergunta ${key}`,
          status: respostas[key].status,
          observacoes: respostas[key].referenciaLegal, // O script Google lerá isso como a coluna de observações
          fotos: respostas[key].fotos.map((f: any) => f.url)
        };
      });

      const payload = {
        tipoDoc: 'Conformidade',
        unidade,
        inspetor: auditor, // Mapeado como inspetor para o Webhook compreender o layout
        data,
        respostas: mappedRespostas,
        enviarEmail,
        enviarGDrive,
        emailDestino: emailDestino,
        pastaDestinoUrl: config.gdriveFormsFolderUrl
      };

      // COLE AQUI A MESMA URL DO SEU GOOGLE APPS SCRIPT
      const endpoint = 'https://script.google.com/macros/s/SUA_URL_AQUI/exec';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // Bloqueio de CORS contornado
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Falha na resposta do webhook');
      }

      let msg = "Auditoria de Conformidade salva com sucesso!";
      if (enviarEmail && enviarGDrive) {
        msg = `Conformidade registrada! PDF enviado para ${emailDestino} e arquivado no GDrive de SST.`;
      } else if (enviarEmail) {
        msg = `Auditoria enviada com sucesso para o e-mail: ${emailDestino}`;
      } else if (enviarGDrive) {
        msg = `Salvo de forma legal e arquivado no Google Drive.`;
      }
      
      triggerNotification('sucesso', msg);
      onSaved();
    } catch (e) {
      triggerNotification('erro', 'Falha de comunicação com o Integrador Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!unidade.trim()) {
      triggerNotification('erro', 'Insira o nome da Unidade/Loja para gerar a peça relatorial de Conformidade.');
      return;
    }
    setIsExporting(true);
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-1 font-sans" id="full-conformidade-container">
      {/* Visual notifications */}
      {notificacao && (
        <div className={`p-4 rounded-lg flex items-center shadow-sm animate-fade-in text-xs ${
          notificacao.tipo === 'sucesso' ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 font-medium' : 'bg-rose-50 text-rose-800 border-l-4 border-rose-500 font-medium'
        }`}>
          {notificacao.tipo === 'sucesso' ? (
            <ShieldCheck className="w-4 h-4 mr-2 flex-shrink-0 text-emerald-600" />
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
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Conformidade Documental SST</h1>
            <p className="text-xs text-slate-500">Auditoria Legal Integrada de Portarias e Normas Regulamentadoras (MTE)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Unidade / Loja (CNPJ)</label>
            <input
              type="text"
              id="conformidade-unidade-input"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
              placeholder="Ex: Filial Sul - Vendas"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded text-slate-800 outline-none focus:border-slate-800"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nome do Auditor / Engenheiro</label>
            <input
              type="text"
              id="conformidade-auditor-input"
              value={auditor}
              onChange={(e) => setAuditor(e.target.value)}
              placeholder="Ex: Engenheiro de Segurança"
              className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-slate-50 text-slate-500 rounded outline-none"
              disabled
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Data da Auditoria</label>
            <input
              type="date"
              id="conformidade-data-input"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded text-slate-800 outline-none focus:border-slate-800"
            />
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-6">
        {QUESTIONS.map((q) => {
          const resp = respostas[q.id];
          return (
            <div key={q.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4 hover:border-slate-300 transition-colors">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 mb-2">
                  {q.nrReference}
                </span>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {q.id}. {q.texto}
                </h3>
              </div>

              {/* Status Radio options */}
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
                      id={`btn-status-conf-${q.id}-${status}`}
                      onClick={() => handleStatusChange(q.id, status)}
                      className={`px-3 py-1.5 text-xs font-semibold border rounded cursor-pointer transition ${colorClass}`}
                    >
                      <span>{status}</span>
                    </button>
                  );
                })}
              </div>

              {/* Legal ref, certification details */}
              <div className="space-y-1">
                <label className="block text-[9px] font-bold text-slate-400 uppercase">Referência em Auditoria, validade ou detalhamento legal:</label>
                <input
                  type="text"
                  id={`legal-ref-${q.id}`}
                  value={resp.referenciaLegal}
                  onChange={(e) => handleRefSelectionChange(q.id, e.target.value)}
                  placeholder="Referência do documento, número de registro, validade ou plano de ação..."
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-800 outline-none focus:border-slate-800"
                />
              </div>

              {/* Photo Upload evidence block */}
              <div className="pt-2 space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase flex items-center">
                  <CheckSquare className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Evidências Documentais / Fotos (Máx. 5)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
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
                        ANEXO {fIdx + 1}
                      </div>
                    </div>
                  ))}

                  {resp.fotos.length < 5 && (
                    <label className="aspect-square border border-dashed border-slate-200 rounded-lg hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center group">
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-slate-600 mb-1" />
                      <span className="text-[10px] text-slate-400 font-bold group-hover:text-slate-600">ANEXAR FOTO</span>
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

      {/* Action panel footer */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
        <div className="text-xs text-slate-400 leading-normal">
          <p className="font-bold text-slate-500 uppercase tracking-wide">Garantia de Respaldo Legal (Auditoria do Trabalho)</p>
          <p>O preenchimento documenta que as normas e NR-Portarias federais estão em vigor.</p>
        </div>

        <div className="flex flex-col md:flex-row items-end justify-between gap-4 pt-4 border-t border-slate-100">
          
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
              id="btn-conformidade-imprimir-pdf"
              disabled={loading}
              onClick={handlePrint}
              className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded flex items-center cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              {loading ? 'Aguarde...' : 'Salvar formato .PDF'}
            </button>

            <button
              type="button"
              id="btn-conformidade-submit-gdrive"
              disabled={loading}
              onClick={() => handleSubmit(false, true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center cursor-pointer disabled:opacity-50"
            >
              <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
              {loading ? 'Aguarde...' : 'Enviar para GDrive'}
            </button>

            <button
              type="button"
              id="btn-conformidade-submit-email"
              disabled={loading}
              onClick={() => handleSubmit(true, false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded flex items-center cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              {loading ? 'Aguarde...' : 'Enviar para E-mail'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden printable view layout */}
      {isExporting && (
        <>
          <style type="text/css">
            {`
              @media print {
                body * {
                  visibility: hidden;
                }
                #conf-printable-pdf-document, #conf-printable-pdf-document * {
                  visibility: visible;
                }
                #conf-printable-pdf-document {
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

          <div className="fixed inset-0 bg-white z-[9999] p-8 overflow-y-auto" id="conf-printable-pdf-document">
            <div className="border border-gray-300 p-8 rounded-lg max-w-4xl mx-auto space-y-6">
              <div className="flex justify-between items-center pb-6 border-b border-gray-300">
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-indigo-900">RELATÓRIO DE CONFORMIDADE DOCUMENTAL</h1>
                  <p className="text-xs text-gray-500 uppercase font-mono tracking-wider">PneuBras - Auditoria Legal de Ativos e Normas Portaria do Trabalho</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">CÓDIGO: PB-CONF-{Date.now().toString().slice(-4)}</p>
                  <p className="text-xs text-gray-400">Gerado: {data}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 text-sm py-4 bg-indigo-50/50 p-4 rounded border border-indigo-100">
                <div>
                  <p className="text-xs font-semibold text-indigo-400">UNIDADE / LOJA:</p>
                  <p className="font-bold text-indigo-900">{unidade}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-400">AUDITOR RESPONSÁVEL:</p>
                  <p className="font-bold text-indigo-900">{auditor}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-indigo-400">DATA DA AUDITORIA:</p>
                  <p className="font-bold text-indigo-900">{data}</p>
                </div>
              </div>

              <div className="space-y-6 pt-4">
                {QUESTIONS.map((q) => (
                  <div key={q.id} className="pb-4 border-b border-gray-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">
                          {q.id}. {q.texto}
                        </p>
                        <p className="text-[10px] text-indigo-600 font-mono italic uppercase">REF: {q.nrReference}</p>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-black rounded border ${
                        respostas[q.id].status === 'Conforme' ? 'bg-green-100 text-green-800 border-green-300' :
                        respostas[q.id].status === 'Não Conforme' ? 'bg-red-100 text-red-800 border-red-300' :
                        'bg-yellow-100 text-yellow-800 border-yellow-300'
                      }`}>
                        {respostas[q.id].status.toUpperCase()}
                      </span>
                    </div>
                    {respostas[q.id].referenciaLegal && (
                      <p className="text-xs bg-gray-50 p-2 rounded text-gray-600 border-l-2 border-indigo-400">
                        <strong>Ficha / Vistoria:</strong> {respostas[q.id].referenciaLegal}
                      </p>
                    )}
                    {respostas[q.id].fotos.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {respostas[q.id].fotos.map((foto, idx) => (
                          <div key={idx} className="w-16 h-16 rounded border overflow-hidden">
                            <img src={foto.url} alt="anexo" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        <span className="text-[10px] text-gray-400 self-end">({respostas[q.id].fotos.length} comprovantes indexados)</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs">
                <div className="border-t border-gray-400 pt-4">
                  <p className="font-bold text-gray-800">{auditor}</p>
                  <p className="text-gray-400">Assinatura Certificada do Auditor</p>
                </div>
                <div className="border-t border-gray-400 pt-4">
                  <p className="font-bold text-gray-800">Diretoria Jurídica / SST PneuBras</p>
                  <p className="text-gray-400">Selo de Auditoria Federal NR</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}