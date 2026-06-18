import React, { useState } from 'react';
import { ShieldCheck, Mail, FolderOpen, Download, AlertTriangle, Plus, Trash2, CheckSquare, FileUp } from 'lucide-react';
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
  
  const [emailDestino, setEmailDestino] = useState(user?.email || '');

  const [respostas, setRespostas] = useState<{
    [perguntaId: number]: {
      status: 'Conforme' | 'Não Conforme' | 'Outros';
      referenciaLegal: string;
      fotos: { name: string; url: string; size: 'medium' | 'large' }[];
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

  const calcularPesoTotalMB = () => {
    let totalBytes = 0;
    Object.values(respostas).forEach((resp) => {
      resp.fotos.forEach((foto) => {
        const base64Data = foto.url.split(',')[1] || foto.url;
        const bytes = (base64Data.length * 3) / 4;
        totalBytes += bytes;
      });
    });
    return (totalBytes / (1024 * 1024)).toFixed(2);
  };

  const pesoTotal = calcularPesoTotalMB();

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

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800; 
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          resolve(canvas.toDataURL('image/png', 0.6)); 
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (qId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    triggerNotification('sucesso', 'A otimizar as imagens, aguarde um momento...');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressedBase64 = await compressImage(file);
        
        setRespostas(prev => {
          const currentPhotos = prev[qId].fotos;
          return {
            ...prev,
            [qId]: {
              ...prev[qId],
              fotos: [...currentPhotos, { name: file.name, url: compressedBase64, size: 'medium' }]
            }
          };
        });
      } catch (error) {
        console.error("Erro ao otimizar imagem:", error);
      }
    }
  };

  const togglePhotoSize = (qId: number, index: number) => {
    setRespostas(prev => {
      const novasFotos = [...prev[qId].fotos];
      novasFotos[index].size = novasFotos[index].size === 'large' ? 'medium' : 'large';
      return {
        ...prev,
        [qId]: {
          ...prev[qId],
          fotos: novasFotos
        }
      };
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
          pergunta: questionData ? `${questionData.nrReference} - ${questionData.texto}` : `Pergunta ${key}`,
          status: respostas[key].status,
          observacoes: respostas[key].referenciaLegal ? `Ref: ${respostas[key].referenciaLegal}` : '',
          fotos: respostas[key].fotos.map((f: any) => ({ url: f.url, size: f.size }))
        };
      });

      const payload = {
        tipoDoc: 'Conformidade', 
        unidade,
        inspetor: auditor, 
        data,
        respostas: mappedRespostas,
        enviarEmail,
        enviarGDrive,
        emailDestino: emailDestino,
        pastaDestinoUrl: config.gdriveFormsFolderUrl
      };

      const endpoint = 'https://script.google.com/macros/s/AKfycbyr9wA3Vp7Es0-LWn68oVrhhSLRHsrZ_7k9CF8JAJAeYVBvGxCb276SagUUAeygPpCwpQ/exec';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, 
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Falha na resposta do webhook');
      }

      let msg = "Auditoria de Conformidade salva com sucesso!";
      if (enviarEmail && enviarGDrive) {
        msg = `Conformidade registada! Documento PDF enviado para ${emailDestino} e arquivado no GDrive.`;
      } else if (enviarEmail) {
        msg = `Salvo com cópia enviada para o e-mail: ${emailDestino}`;
      } else if (enviarGDrive) {
        msg = `Salvo de forma legal e arquivado no Google Drive.`;
      }
      
      triggerNotification('sucesso', msg);
      onSaved();
    } catch (e) {
      triggerNotification('erro', 'Falha de comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!unidade.trim()) {
      triggerNotification('erro', 'Insira o nome da Unidade/Loja para gerar o documento PDF.');
      return;
    }
    setIsExporting(true);
    // Dá um tempo maior para as imagens renderizarem antes de abrir a janela de impressão
    setTimeout(() => {
      window.print();
      setIsExporting(false);
    }, 800);
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
              className="w-full px-3 py-1.5 text-xs border border-slate-200 bg-slate-50 text-slate-500 rounded outline-none block"
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
                    if (status === 'Conforme') colorClass = "bg-emerald-50 text-emerald-800 border-emerald-350 border-emerald-300";
                    else if (status === 'Não Conforme') colorClass = "bg-rose-50 text-rose-800 border-rose-355 border-rose-300";
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
                  placeholder="Referência do documento, número de registo, validade ou plano de ação..."
                  className="w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-800 outline-none focus:border-slate-800"
                />
              </div>

              {/* Photo Upload evidence block (Ilimitado) */}
              <div className="pt-2 space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase flex items-center">
                  <CheckSquare className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Evidências Documentais / Fotos
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {resp.fotos.map((foto, fIdx) => (
                    <div key={fIdx} className="relative aspect-square border border-slate-200 rounded overflow-hidden group">
                      <img src={foto.url} alt={foto.name} className="w-full h-full object-cover" />
                      
                      {/* Botão de Alternância de Tamanho */}
                      <button
                        type="button"
                        onClick={() => togglePhotoSize(q.id, fIdx)}
                        className={`absolute bottom-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded cursor-pointer z-10 ${foto.size === 'large' ? 'bg-emerald-600 text-white' : 'bg-slate-900/70 text-white hover:bg-slate-800'}`}
                      >
                        {foto.size === 'large' ? 'GRANDE' : 'MÉDIO'}
                      </button>

                      <button
                        type="button"
                        onClick={() => removePhoto(q.id, fIdx)}
                        className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white rounded cursor-pointer z-20"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                      </button>
                    </div>
                  ))}

                  <label className="aspect-square border border-dashed border-slate-200 rounded-lg hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center group">
                    <Plus className="w-5 h-5 text-slate-405 text-slate-450 text-slate-400 group-hover:text-slate-600 mb-1" />
                    <span className="text-[10px] text-slate-400 font-bold group-hover:text-slate-600">ANEXAR FOTO</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleFileUpload(q.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action panel footer */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
        <div className="text-xs text-slate-400 leading-normal">
          <p className="font-bold text-slate-500 uppercase tracking-wide">Opções Legais e Execução Técnica</p>
          <p>O preenchimento documenta que as normas e NR-Portarias federais estão em vigor.</p>
          
          {Number(pesoTotal) > 0 && (
            <p className="mt-2 inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded border border-emerald-200">
              <FileUp className="w-3.5 h-3.5 mr-1.5" />
              Peso Total dos Anexos: {pesoTotal} MB
            </p>
          )}
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
              {loading ? 'A processar...' : 'Salvar formato .PDF'}
            </button>

            <button
              type="button"
              id="btn-conformidade-submit-gdrive"
              disabled={loading}
              onClick={() => handleSubmit(false, true)}
              className="px-4 py-2 bg-slate-105 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center cursor-pointer disabled:opacity-50"
            >
              <FolderOpen className="w-3.5 h-3.5 mr-1.5" />
              {loading ? 'A processar...' : 'Enviar para GDrive'}
            </button>

            <button
              type="button"
              id="btn-conformidade-submit-email"
              disabled={loading}
              onClick={() => handleSubmit(true, false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded flex items-center cursor-pointer disabled:opacity-50"
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              {loading ? 'A processar...' : 'Enviar para E-mail'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden printable view layout - FIXED para não duplicar folhas */}
      {isExporting && (
        <>
          <style type="text/css">
            {`
              @media print {
                /* Esconde o formulário normal que causava o "fantasma" de folhas em branco */
                #full-conformidade-container > div:not(#conf-printable-pdf-document) {
                  display: none !important;
                }
                
                /* Remove as propriedades 'fixed' que causam a repetição tipo carimbo */
                #conf-printable-pdf-document {
                  position: relative !important;
                  display: block !important;
                  width: 100% !important;
                  height: auto !important;
                  overflow: visible !important;
                  padding: 0 !important;
                  margin: 0 !important;
                }

                /* Garante que o bloco da pergunta não é cortado ao meio na transição de folhas */
                .page-break-avoid {
                  page-break-inside: avoid !important;
                  break-inside: avoid !important;
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
                  <div key={q.id} className="pb-4 border-b border-gray-200 space-y-2 page-break-avoid">
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
                    
                    {/* Renderização condicional para PDF gerado via Print */}
                    {respostas[q.id].fotos.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {respostas[q.id].fotos.map((foto, idx) => (
                          <div key={idx} className={`rounded border overflow-hidden ${foto.size === 'large' ? 'w-full h-auto' : 'w-48 h-48'}`}>
                            <img src={foto.url} alt="anexo" className="w-full h-full object-contain" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-8 grid grid-cols-2 gap-12 text-center text-xs page-break-avoid">
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