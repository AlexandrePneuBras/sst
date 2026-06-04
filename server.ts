import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Colaborador, Noticia, InspecaoForm, ConformidadeForm, PilulaTreinamento, QuizRespostum, AppConfig } from "./src/types";

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(process.cwd(), "server_db.json");

// Helper structure for DB
interface DatabaseSchema {
  colaboradores: Colaborador[];
  noticias: Noticia[];
  inspecoes: InspecaoForm[];
  conformidades: ConformidadeForm[];
  pilulas: PilulaTreinamento[];
  respostasQuiz: QuizRespostum[];
  config: AppConfig;
}

// Default Data Initializer
const DEFAULT_DB: DatabaseSchema = {
  colaboradores: [
    {
      id: "1",
      nome: "Alexandre Rêgo",
      email: "alexandrencrego@gmail.com",
      loja: "Matriz Centro",
      empresa: "PneuBras - Matriz",
      status: "Ativo"
    },
    {
      id: "2",
      nome: "Carlos Eduardo Silva",
      email: "silva@pneubras.com.br",
      loja: "Filial Sul - Vendas",
      empresa: "PneuBras - Vendas",
      status: "Ativo"
    },
    {
      id: "3",
      nome: "Maria Aparecida Souza",
      email: "maria@pneubras.com.br",
      loja: "Filial Serviços Centro",
      empresa: "PneuDrive - Serviços",
      status: "Ativo"
    },
    {
      id: "4",
      nome: "Ana Costa Rodrigues",
      email: "financeiro@pneubras.com.br",
      loja: "Filial Administrativa Oeste",
      empresa: "PneuBras - Administrativo",
      status: "Ativo"
    },
    {
      id: "5",
      nome: "Lucas Mendes Santos",
      email: "lucas@pneubras.com.br",
      loja: "Filial Sul - Vendas",
      empresa: "PneuBras - Vendas",
      status: "Bloqueado"
    },
    {
      id: "6",
      nome: "Roberto Oliveira Lima",
      email: "roberto@pneubras.com.br",
      loja: "Filial Serviços Centro",
      empresa: "PneuDrive - Serviços",
      status: "Inativo",
      inativoAte: "2026-06-15"
    }
  ],
  noticias: [
    {
      id: "n1",
      titulo: "Uso correto de EPIs no manuseio de pneus pesados",
      descricao: "A importância de utilizar calçados de proteção com biqueira de aço, luvas de raspa de couro de alta densidade e óculos durante o alinhamento e montagem de pneus pesados.",
      linkOriginal: "https://www.fundacentro.gov.br",
      imageUrl: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60",
      dataCriacao: "2026-05-28"
    },
    {
      id: "n2",
      titulo: "Prevenção de acidentes com Elevadores e Compressores",
      descricao: "Checklist diário de inspeção visual, travas mecânicas ativas e purga do compressor de ar são requisitos legais cruciais para a segurança de toda a equipe de pista.",
      linkOriginal: "https://www.gov.br/trabalho-e-emprego/pt-br",
      imageUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=500&auto=format&fit=crop&q=60",
      dataCriacao: "2026-05-25"
    },
    {
      id: "n3",
      titulo: "Campanha de Saúde NR-07: Exames Periódicos em Dia",
      descricao: "Lançamento do novo cronograma integrado para realização de exames audiométricos e acuidade visual para mecânicos e alinhadores das filiais PneuDrive.",
      linkOriginal: "https://www.gov.br/trabalho-e-emprego/pt-br",
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=500&auto=format&fit=crop&q=60",
      dataCriacao: "2026-05-20"
    }
  ],
  inspecoes: [
    {
      id: "insp-1",
      unidade: "Filial Serviços Centro",
      inspetor: "Auditor Engenheiro Principal",
      data: "2026-05-29",
      respostas: {
        1: { status: "Conforme", observacoes: "Elevadores lubrificados e com travas testadas.", fotos: [] },
        2: { status: "Conforme", observacoes: "Compressores purgados hoje pela manhã.", fotos: [] },
        3: { status: "Não Conforme", observacoes: "Máquina balanceadora sem aterramento correto.", fotos: [] },
        4: { status: "Conforme", observacoes: "Todos utilizando óculos e botinas.", fotos: [] },
        5: { status: "Conforme", observacoes: "Sem vazamentos aparentes.", fotos: [] },
        6: { status: "Conforme", observacoes: "Área limpa e desobstruída.", fotos: [] },
        7: { status: "Conforme", observacoes: "Extintores dentro da validade (Set/2026).", fotos: [] }
      },
      enviadoEmail: true,
      enviadoGDrive: true,
      dataCriacao: "2026-05-29T14:30:00Z"
    }
  ],
  conformidades: [
    {
      id: "conf-1",
      unidade: "Filial Sul - Vendas",
      auditor: "Engenheiro de SST",
      data: "2026-05-28",
      respostas: {
        1: { status: "Conforme", referenciaLegal: "NR-01 item 1.5", fotos: [] },
        2: { status: "Conforme", referenciaLegal: "NR-06 item 6.1", fotos: [] },
        3: { status: "Conforme", referenciaLegal: "NR-13 item 13.4", fotos: [] },
        4: { status: "Conforme", referenciaLegal: "NR-11 item 11.1", fotos: [] },
        5: { status: "Não Conforme", referenciaLegal: "NR-26 item 26.2", fotos: [] },
        6: { status: "Conforme", referenciaLegal: "NR-23 item 23.1", fotos: [] },
        7: { status: "Conforme", referenciaLegal: "NR-12 item 12.3", fotos: [] }
      },
      enviadoEmail: true,
      enviadoGDrive: true,
      dataCriacao: "2026-05-28T16:00:00Z"
    }
  ],
  pilulas: [
    {
      id: "p1",
      titulo: "NR-06: O uso indispensável de EPIs em Oficinas de Alinhamento",
      descricao: "Assista a este vídeo rápido com as principais práticas de proteção auricular e ocular essenciais para quem opera desmontadoras de pneus.",
      videoUrl: "https://www.youtube.com/embed/5D34B8m4qX0",
      quiz: {
        pergunta: "Qual o EPI indispensável para atenuar ruídos acima de 85dB na área de alinhamento?",
        opcoes: [
          "Óculos de proteção",
          "Protetor auricular (tipo concha ou inserção)",
          "Sapato com biqueira de PVC",
          "Máscara de solda"
        ],
        respostaCorreta: 1
      },
      dataInicio: "2026-05-01",
      dataFim: "2026-06-15"
    },
    {
      id: "p2",
      titulo: "SST PneuBras: Manuseio seguro de elevadores pneumáticos",
      descricao: "Instruções cruciais de segurança para operar calços de borracha e travas mecânicas antes de elevar qualquer veículo de passeio.",
      videoUrl: "https://www.youtube.com/embed/F4G6e8M2N9E",
      quiz: {
        pergunta: "O que deve ser verificado em elevadores antes de elevar o veículo?",
        opcoes: [
          "Se o rádio da oficina está ligado",
          "O estado do compressor apenas",
          "As travas mecânicas e integridade das sapatas de borracha",
          "Se a cor do elevador está bonita"
        ],
        respostaCorreta: 2
      },
      dataInicio: "2026-05-15",
      dataFim: "2026-06-10"
    },
    {
      id: "p3",
      titulo: "Ergonomia Geral no Administrativo e Vendas",
      descricao: "Regulagem correta da altura do monitor, apoio para os pés e pausas programadas para evitar o estresse osteomuscular.",
      videoUrl: "https://www.youtube.com/embed/SOfv2O-X5I0",
      quiz: {
        pergunta: "A que altura aproximada deve ficar a borda superior da tela do computador?",
        opcoes: [
          "Na altura dos olhos do colaborador",
          "Bem abaixo da linha do queixo",
          "Acima do topo da cabeça",
          "Tanto faz, depende do monitor"
        ],
        respostaCorreta: 0
      },
      dataInicio: "2026-04-10",
      dataFim: "2026-05-20" // Expired!
    }
  ],
  respostasQuiz: [
    {
      id: "r1",
      pilulaId: "p1",
      colaboradorEmail: "silva@pneubras.com.br",
      colaboradorNome: "Carlos Eduardo Silva",
      assistiuVideo: true,
      respondeuQuiz: true,
      acertou: true,
      dataResposta: "2026-05-27",
      status: "Concluido"
    },
    {
      id: "r2",
      pilulaId: "p1",
      colaboradorEmail: "maria@pneubras.com.br",
      colaboradorNome: "Maria Aparecida Souza",
      assistiuVideo: true,
      respondeuQuiz: true,
      acertou: true,
      dataResposta: "2026-05-29",
      status: "Concluido"
    },
    {
      id: "r3",
      pilulaId: "p2",
      colaboradorEmail: "silva@pneubras.com.br",
      colaboradorNome: "Carlos Eduardo Silva",
      assistiuVideo: true,
      respondeuQuiz: true,
      acertou: false,
      dataResposta: "2026-05-28",
      status: "Concluido"
    }
  ],
  config: {
    pbiDashboardUrl: "https://playground.powerbi.com/sampleReportActiveDirectory",
    lookerStudioUrl: "https://lookerstudio.google.com/embed/reporting/0B-qp70_26YcYN1Z2S3A5V29YMEU/page/1M",
    gdriveFormsFolderUrl: "https://drive.google.com/drive/folders/1SST_Forms_PneuBras_MockUrl",
    gdrivePhotosFolderUrl: "https://drive.google.com/drive/folders/2SST_Photos_PneuBras_MockUrl"
  }
};

// Database helper functions
const getDB = (): DatabaseSchema => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf8");
    return DEFAULT_DB;
  }
  try {
    const content = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Erro ao ler banco de dados:", error);
    return DEFAULT_DB;
  }
};

const saveDB = (data: DatabaseSchema) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Erro ao gravar banco de dados:", error);
  }
};

// Launch custom server with Express
async function startServer() {
  const app = express();
  app.use(express.json({ limit: "20mb" }));

  // API Endpoints

  // Get full db state (needed for bootstrap/sync)
  app.get("/api/db", (req, res) => {
    res.json(getDB());
  });

  // Access check & login endpoint
  app.post("/api/auth/login", (req, res) => {
    const { email, password, isAdminMode } = req.body;
    const db = getDB();

    if (isAdminMode) {
      // Admin check: Requires general login for adm plus password
      // For this app, any administrator login should match configured password
      // Default admin password will be "admin123"
      if (email === "alexandrencrego@gmail.com" || email === "admin@pneubras.com.br") {
        if (password === "admin123" || password === "admin") {
          // Admin found and valid password
          res.json({
            success: true,
            user: {
              id: "admin",
              nome: email === "alexandrencrego@gmail.com" ? "Alexandre Rêgo (Admin)" : "Administrador SST",
              email: email,
              loja: "Matriz Centro",
              empresa: "PneuBras - Matriz",
              status: "Ativo",
              isAdmin: true
            }
          });
          return;
        } else {
          res.status(401).json({ success: false, message: "Senha de Administrador incorreta." });
          return;
        }
      } else {
        res.status(401).json({ success: false, message: "E-mail não autorizado para acesso Administrativo." });
        return;
      }
    }

    // Normal Employee Mode (By Email only)
    const colaborador = db.colaboradores.find(c => c.email.toLowerCase() === email.toLowerCase());

    if (!colaborador) {
      res.status(404).json({ success: false, message: "E-mail de colaborador não cadastrado no banco 'Base Colaboradores'." });
      return;
    }

    if (colaborador.status === "Bloqueado") {
      res.status(403).json({ success: false, message: "Acesso bloqueado. Entre em contato com a equipe de SST." });
      return;
    }

    if (colaborador.status === "Inativo") {
      res.status(403).json({ 
        success: false, 
        message: `Acesso temporariamente inativado até ${colaborador.inativoAte || 'prazo indefinido'} pelo administrador.` 
      });
      return;
    }

    res.json({
      success: true,
      user: {
        ...colaborador,
        isAdmin: false
      }
    });
  });

  // Register state syncs
  app.post("/api/colaboradores", (req, res) => {
    const db = getDB();
    const newColaborador = req.body;
    
    // Check if email already registered
    const exists = db.colaboradores.some(c => c.email.toLowerCase() === newColaborador.email.toLowerCase());
    if (exists) {
      res.status(400).json({ success: false, message: "E-mail já registrado no banco de dados." });
      return;
    }

    const item: Colaborador = {
      id: "col-" + Date.now(),
      nome: newColaborador.nome,
      email: newColaborador.email,
      loja: newColaborador.loja,
      empresa: newColaborador.empresa,
      status: newColaborador.status || "Ativo",
      inativoAte: newColaborador.inativoAte
    };

    db.colaboradores.push(item);
    saveDB(db);
    res.json({ success: true, colaborador: item });
  });

  app.put("/api/colaboradores/:id", (req, res) => {
    const db = getDB();
    const { id } = req.params;
    const index = db.colaboradores.findIndex(c => c.id === id);
    if (index !== -1) {
      db.colaboradores[index] = { ...db.colaboradores[index], ...req.body };
      saveDB(db);
      res.json({ success: true, colaborador: db.colaboradores[index] });
    } else {
      res.status(404).json({ success: false, message: "Colaborador não encontrado." });
    }
  });

  app.delete("/api/colaboradores/:id", (req, res) => {
    const db = getDB();
    const { id } = req.params;
    db.colaboradores = db.colaboradores.filter(c => c.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  app.post("/api/noticias", (req, res) => {
    const db = getDB();
    const { titulo, descricao, linkOriginal, imageUrl } = req.body;
    const newNoticia: Noticia = {
      id: "not-" + Date.now(),
      titulo,
      descricao,
      linkOriginal: linkOriginal || "https://www.google.com",
      imageUrl: imageUrl || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=500&auto=format&fit=crop&q=60",
      dataCriacao: new Date().toISOString().split("T")[0]
    };
    db.noticias.unshift(newNoticia);
    saveDB(db);
    res.json({ success: true, noticia: newNoticia });
  });

  app.delete("/api/noticias/:id", (req, res) => {
    const db = getDB();
    const { id } = req.params;
    db.noticias = db.noticias.filter(n => n.id !== id);
    saveDB(db);
    res.json({ success: true });
  });

  // Save inspection from App
  app.post("/api/inspecoes", (req, res) => {
    const db = getDB();
    const { unidade, inspetor, data, respostas, enviadoEmail, enviadoGDrive } = req.body;
    
    const newInspecao: InspecaoForm = {
      id: "insp-" + Date.now(),
      unidade,
      inspetor,
      data,
      respostas,
      enviadoEmail: !!enviadoEmail,
      enviadoGDrive: !!enviadoGDrive,
      dataCriacao: new Date().toISOString()
    };
    
    db.inspecoes.unshift(newInspecao);
    saveDB(db);
    res.json({ success: true, inspecao: newInspecao });
  });

  // Save compliance from App
  app.post("/api/conformidades", (req, res) => {
    const db = getDB();
    const { unidade, auditor, data, respostas, enviadoEmail, enviadoGDrive } = req.body;
    
    const newConformidade: ConformidadeForm = {
      id: "conf-" + Date.now(),
      unidade,
      auditor,
      data,
      respostas,
      enviadoEmail: !!enviadoEmail,
      enviadoGDrive: !!enviadoGDrive,
      dataCriacao: new Date().toISOString()
    };
    
    db.conformidades.unshift(newConformidade);
    saveDB(db);
    res.json({ success: true, conformidade: newConformidade });
  });

  // Quiz submission & Pill management
  app.post("/api/pilulas", (req, res) => {
    const db = getDB();
    const { titulo, descricao, videoUrl, quiz, dataInicio, dataFim } = req.body;
    const newPill: PilulaTreinamento = {
      id: "pill-" + Date.now(),
      titulo,
      descricao,
      videoUrl,
      quiz,
      dataInicio,
      dataFim
    };
    db.pilulas.push(newPill);
    saveDB(db);
    res.json({ success: true, pilula: newPill });
  });

  app.delete("/api/pilulas/:id", (req, res) => {
    const db = getDB();
    const { id } = req.params;
    db.pilulas = db.pilulas.filter(p => p.id !== id);
    // Also remove responses associated with it
    db.respostasQuiz = db.respostasQuiz.filter(r => r.pilulaId !== id);
    saveDB(db);
    res.json({ success: true });
  });

  app.post("/api/respostas-quiz", (req, res) => {
    const db = getDB();
    const { pilulaId, colaboradorEmail, colaboradorNome, assistiuVideo, respondeuQuiz, acertou, status } = req.body;
    
    const id = "res-" + Date.now();
    const newResponse: QuizRespostum = {
      id,
      pilulaId,
      colaboradorEmail,
      colaboradorNome,
      assistiuVideo,
      respondeuQuiz,
      acertou,
      dataResposta: new Date().toISOString().split("T")[0],
      status: status || "Concluido"
    };

    // Remove any previous response by same employee for this same pill to avoid duplicates
    db.respostasQuiz = db.respostasQuiz.filter(r => !(r.pilulaId === pilulaId && r.colaboradorEmail.toLowerCase() === colaboradorEmail.toLowerCase()));

    db.respostasQuiz.push(newResponse);
    saveDB(db);
    res.json({ success: true, resposta: newResponse });
  });

  // Edit dashboard global configurations
  app.post("/api/config", (req, res) => {
    const db = getDB();
    db.config = { ...db.config, ...req.body };
    saveDB(db);
    res.json({ success: true, config: db.config });
  });


  // Host Vite static build or middleware code
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT as number, "0.0.0.0", () => {
    console.log(`[SST Server] Servidor escutando na porta http://localhost:${PORT}`);
  });
}

startServer();