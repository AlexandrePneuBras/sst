import React, { useState, useRef } from 'react';
import { FileText, Mail, FileUp, Folder, Download, Plus, Trash2, CheckCircle, AlertTriangle, Image, ChevronDown, ChevronUp } from 'lucide-react';

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

// ─── Valores padrão das dimensões de foto no relatório ───────────────────────
const DEFAULT_PHOTO_WIDTH = 120;   // px no PDF/HTML enviado
const DEFAULT_PHOTO_HEIGHT = 120;  // px no PDF/HTML enviado
const MIN_DIM = 60;
const MAX_DIM = 300;

export default function InspecaoFormulario({ user, config, onSaved }: InspecaoFormProps) {
  const [unidade, setUnidade] = useState('');
  const [inspetor, setInspetor] = useState(user?.nome || '');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [emailDestino, setEmailDestino] = useState(user?.email || '');

  // ─── Estado do painel de dimensões ──────────────────────────────────────────
  const [fotoDimsPanelOpen, setFotoDimsPanelOpen] = useState(false);
  const [fotoLargura, setFotoLargura] = useState(DEFAULT_PHOTO_WIDTH);
  const [fotoAltura, setFotoAltura] = useState(DEFAULT_PHOTO_HEIGHT);
  const [manterProporcao, setManterProporcao] = useState(true);
  // Razão inicial para manter proporção (largura / altura)
  const proporcaoRef = useRef(DEFAULT_PHOTO_WIDTH / DEFAULT_PHOTO_HEIGHT);

  const handleLarguraChange = (val: number) => {
    setFotoLargura(val);
    if (manterProporcao) {
      setFotoAltura(Math.round(val / proporcaoRef.current));
    }
  };

  const handleAlturaChange = (val: number) => {
    setFotoAltura(val);
    if (manterProporcao) {
      setFotoLargura(Math.round(val * proporcaoRef.current));
    }
  };

  const resetDims = () => {
    setFotoLargura(DEFAULT_PHOTO_WIDTH);
    setFotoAltura(DEFAULT_PHOTO_HEIGHT);
    proporcaoRef.current = DEFAULT_PHOTO_WIDTH / DEFAULT_PHOTO_HEIGHT;
  };

  // ─── Respostas ───────────────────────────────────────────────────────────────
  const [respostas, setRespostas] = useState<{
    [perguntaId: number]: {
      status: 'Conforme' | 'Não Conforme' | 'Outros';
      observacoes: string;
      fotos: { name: string; url: string }[];
    }
  }>(() => {
    const initial: any = {};
    QUESTIONS.forEach(q => {
      initial[q.id] = { status: 'Conforme', observacoes: '', fotos: [] };
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
        totalBytes += (base64Data.length * 3) / 4;
      });
    });
    return (totalBytes / (1024 * 1024)).toFixed(2);
  };

  const pesoTotal = calcularPesoTotalMB();

  const handleStatusChange = (qId: number, status: 'Conforme' | 'Não Conforme' | 'Outros') => {
    setRespostas(prev => ({ ...prev, [qId]: { ...prev[qId], status } }));
  };

  const handleObservacoesChange = (qId: number, value: string) => {
    setRespostas(prev => ({ ...prev, [qId]: { ...prev[qId], observacoes: value } }));
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
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.6));
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileUpload = async (qId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (respostas[qId].fotos.length + files.length > 5) {
      alert("Máximo de 5 fotos por pergunta.");
      return;
    }

    triggerNotification('sucesso', 'A otimizar as imagens, aguarde um momento...');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const compressedBase64 = await compressImage(file);
        setRespostas(prev => {
          const currentPhotos = prev[qId].fotos;
          if (currentPhotos.length >= 5) return prev;
          return { ...prev, [qId]: { ...prev[qId], fotos: [...currentPhotos, { name: file.name, url: compressedBase64 }] } };
        });
      } catch (error) {
        console.error("Erro ao otimizar imagem:", error);
      }
    }
  };

  const removePhoto = (qId: number, index: number) => {
    setRespostas(prev => ({ ...prev, [qId]: { ...prev[qId], fotos: prev[qId].fotos.filter((_, idx) => idx !== index) } }));
  };

  const triggerNotification = (tipo: 'sucesso' | 'erro', msg: string) => {
    setNotificacao({ tipo, msg });
    setTimeout(() => setNotificacao(null), 5000);
  };

  const handleSubmit = async (enviarEmail: boolean, enviarGDrive: boolean) => {
    if (!unidade.trim()) {
      triggerNotification('erro', 'Por favor, informe a Unidade/Loja.');
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
          pergunta: questionData ? questionData.texto : `Pergunta ${key}`,
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
        emailDestino,
        pastaDestinoUrl: config.gdriveFormsFolderUrl,
        // ── Dimensões de foto enviadas ao Apps Script ──────────────────────
        fotoLarguraPx: fotoLargura,
        fotoAlturaPx: fotoAltura
      };

      const endpoint = 'https://script.google.com/macros/s/AKfycbyr9wA3Vp7Es0-LWn68oVrhhSLRHsrZ_7k9CF8JAJAeYVBvGxCb276SagUUAeygPpCwpQ/exec';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Falha na resposta do webhook');

      let msg = "Relatório de Inspeção processado com sucesso!";
      if (enviarEmail && enviarGDrive) {
        msg = `Inspeção salva! PDF gerado e enviado por e-mail para ${emailDestino} e arquivado no GDrive.`;
      } else if (enviarEmail) {
        msg = `Inspeção salva! PDF gerado e enviado com sucesso para ${emailDestino}.`;
      } else if (enviarGDrive) {
        msg = `Inspeção salva! PDF oficial gerado e arquivado no GDrive.`;
      }

      triggerNotification('sucesso', msg);
      onSaved();
    } catch (e) {
      triggerNotification('erro', 'Erro de conexão com o integrador. O envio falhou.');
    } finally {
      setLoading(false);
    }
  };

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

      {notificacao && (
        <div className={`p-4 rounded-lg flex items-center shadow-sm animate-fade-in text-xs ${
          notificacao.tipo === 'sucesso'
            ? 'bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 font-medium'
            : 'bg-rose-50 text-rose-800 border-l-4 border-rose-500 font-medium'
        }`}>
          {notificacao.tipo === 'sucesso'
            ? <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0 text-emerald-600" />
            : <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0 text-rose-650" />}
          <span>{notificacao.msg}</span>
        </div>
      )}

      {/* ── Cabeçalho ──────────────────────────────────────────────────────── */}
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
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded text-slate-800 outline-none focus:border-slate-800"
            />
          </div>
        </div>
      </div>

      {/* ── PAINEL DE DIMENSÕES DE FOTO ────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <button
          type="button"
          onClick={() => setFotoDimsPanelOpen(prev => !prev)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg">
              <Image className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-800">Tamanho das fotos no relatório</p>
              <p className="text-[11px] text-slate-400">
                Atual: {fotoLargura} × {fotoAltura} px
                &nbsp;·&nbsp;
                <span className="text-slate-500">qualidade da imagem preservada</span>
              </p>
            </div>
          </div>
          {fotoDimsPanelOpen
            ? <ChevronUp className="w-4 h-4 text-slate-400" />
            : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {fotoDimsPanelOpen && (
          <div className="px-6 pb-6 border-t border-slate-100 pt-5 space-y-5">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Ajuste as dimensões de exibição das fotos <strong>apenas no relatório PDF</strong>.
              A qualidade e a resolução original das imagens não são alteradas — somente o tamanho
              de renderização no documento impresso ou enviado por e-mail.
            </p>

            {/* Largura */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Largura</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={MIN_DIM}
                    max={MAX_DIM}
                    value={fotoLargura}
                    onChange={(e) => handleLarguraChange(Math.min(MAX_DIM, Math.max(MIN_DIM, Number(e.target.value))))}
                    className="w-16 px-2 py-1 text-xs border border-slate-200 rounded text-slate-800 outline-none focus:border-slate-800 text-right"
                  />
                  <span className="text-[10px] text-slate-400">px</span>
                </div>
              </div>
              <input
                type="range"
                min={MIN_DIM}
                max={MAX_DIM}
                value={fotoLargura}
                onChange={(e) => handleLarguraChange(Number(e.target.value))}
                className="w-full accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-300">
                <span>{MIN_DIM}px</span>
                <span>{MAX_DIM}px</span>
              </div>
            </div>

            {/* Altura */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Altura</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min={MIN_DIM}
                    max={MAX_DIM}
                    value={fotoAltura}
                    onChange={(e) => handleAlturaChange(Math.min(MAX_DIM, Math.max(MIN_DIM, Number(e.target.value))))}
                    className="w-16 px-2 py-1 text-xs border border-slate-200 rounded text-slate-800 outline-none focus:border-slate-800 text-right"
                  />
                  <span className="text-[10px] text-slate-400">px</span>
                </div>
              </div>
              <input
                type="range"
                min={MIN_DIM}
                max={MAX_DIM}
                value={fotoAltura}
                onChange={(e) => handleAlturaChange(Number(e.target.value))}
                className="w-full accent-slate-800"
              />
              <div className="flex justify-between text-[10px] text-slate-300">
                <span>{MIN_DIM}px</span>
                <span>{MAX_DIM}px</span>
              </div>
            </div>

            {/* Opções e preview */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={manterProporcao}
                  onChange={(e) => {
                    setManterProporcao(e.target.checked);
                    if (e.target.checked) {
                      proporcaoRef.current = fotoLargura / fotoAltura;
                    }
                  }}
                  className="accent-slate-800 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-600">Manter proporção</span>
              </label>

              <button
                type="button"
                onClick={resetDims}
                className="text-[11px] text-slate-400 hover:text-slate-700 underline underline-offset-2 transition-colors"
              >
                Restaurar padrão ({DEFAULT_PHOTO_WIDTH}×{DEFAULT_PHOTO_HEIGHT}px)
              </button>
            </div>

            {/* Preview visual do tamanho */}
            <div className="pt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Pré-visualização do tamanho</p>
              <div className="flex items-end gap-3">
                <div
                  style={{
                    width: Math.min(fotoLargura, 300),
                    height: Math.min(fotoAltura, 300),
                    maxWidth: '100%'
                  }}
                  className="bg-slate-100 border border-dashed border-slate-300 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200"
                >
                  <div className="text-center">
                    <Image className="w-5 h-5 text-slate-300 mx-auto mb-1" />
                    <span className="text-[9px] text-slate-400 font-mono">{fotoLargura}×{fotoAltura}</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 space-y-0.5">
                  <p>→ este é o tamanho</p>
                  <p>que a foto vai ocupar</p>
                  <p>no relatório PDF</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Perguntas ──────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {QUESTIONS.map((q) => {
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
                      onClick={() => handleStatusChange(q.id, status)}
                      className={`px-3 py-1.5 text-xs font-semibold border rounded cursor-pointer transition ${colorClass}`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={resp.observacoes}
                onChange={(e) => handleObservacoesChange(q.id, e.target.value)}
                placeholder="Observações, medidas corretivas urgentes ou justificativas..."
                className="w-full px-3 py-2 border border-slate-200 rounded text-xs text-slate-800 outline-none focus:border-slate-800"
              />

              <div className="pt-2 space-y-2">
                <span className="block text-[10px] font-bold text-slate-400 uppercase flex items-center">
                  <FileUp className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Evidências Fotográficas / Fotos (Máx. 5)
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
                    </div>
                  ))}
                  {resp.fotos.length < 5 && (
                    <label className="aspect-square border border-dashed border-slate-200 rounded-lg hover:border-slate-400 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center group">
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-slate-650 mb-1" />
                      <span className="text-[10px] text-slate-400 font-bold group-hover:text-slate-650">ANEXAR FOTO</span>
                      <input type="file" accept="image/*" multiple onChange={(e) => handleFileUpload(q.id, e)} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Rodapé / Ações ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col gap-5">
        <div className="text-xs text-slate-400 leading-normal">
          <p className="font-bold text-slate-500 uppercase tracking-wide">Opções Legais e Execução Técnica</p>
          <p>O preenchimento gera arquivamento instantâneo do histórico.</p>
          <p className="mt-1 text-slate-400">
            Peso total das fotos: <strong className="text-slate-600">{pesoTotal} MB</strong>
            &nbsp;·&nbsp;
            Dimensão no PDF: <strong className="text-slate-600">{fotoLargura}×{fotoAltura}px</strong>
          </p>
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
              disabled={loading}
              onClick={handlePrint}
              className="px-4 py-2 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold rounded flex items-center cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              {loading ? 'A processar...' : 'Salvar formato .PDF'}
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleSubmit(false, true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded flex items-center cursor-pointer disabled:opacity-50"
            >
              <Folder className="w-3.5 h-3.5 mr-1.5" />
              {loading ? 'A processar...' : 'Enviar para GDrive'}
            </button>

            <button
              type="button"
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

      {/* ── PDF para impressão ─────────────────────────────────────────────── */}
      {isExporting && (
        <>
          <style type="text/css">{`
            @media print {
              body * { visibility: hidden; }
              #inspecao-printable-pdf-document, #inspecao-printable-pdf-document * { visibility: visible; }
              #inspecao-printable-pdf-document {
                position: absolute; left: 0; top: 0;
                width: 100%; background: white; padding: 20px;
              }
            }
          `}</style>

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
                      <p className="font-bold text-gray-800 text-sm">{q.id}. {q.texto}</p>
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
                      <div className="flex flex-wrap gap-2 pt-1">
                        {respostas[q.id].fotos.map((foto, idx) => (
                          <div
                            key={idx}
                            style={{ width: fotoLargura, height: fotoAltura }}
                            className="rounded border overflow-hidden flex-shrink-0"
                          >
                            {/* largura/altura definidas pelo slider — qualidade preservada */}
                            <img
                              src={foto.url}
                              alt="anexo"
                              style={{ width: fotoLargura, height: fotoAltura, objectFit: 'cover' }}
                            />
                          </div>
                        ))}
                        <span className="text-[10px] text-gray-400 self-end">
                          ({respostas[q.id].fotos.length} fotos · {fotoLargura}×{fotoAltura}px no relatório)
                        </span>
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