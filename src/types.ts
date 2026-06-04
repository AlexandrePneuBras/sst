/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AllowedEmail {
  id: string;
  email: string;
  name: string;
  employeeId: string;
  company: string;
  companyType: 'servicos' | 'adm_vendas' | 'matriz';
  companyCode: string;
  addedAt: string;
  role: 'admin' | 'user';
}

export interface Colaborador {
  id: string;
  nome: string;
  email: string;
  loja: string;
  empresa: 'PneuBras - Vendas' | 'PneuBras - Administrativo' | 'PneuBras - Matriz' | 'PneuDrive - Serviços';
  status: 'Ativo' | 'Inativo' | 'Bloqueado';
  inativoAte?: string; // Scheduled inactivation
}

export interface Noticia {
  id: string;
  titulo: string;
  descricao: string;
  linkOriginal: string;
  imageUrl: string;
  dataCriacao: string;
}

export interface InspecaoForm {
  id: string;
  unidade: string;
  inspetor: string;
  data: string;
  respostas: {
    [perguntaId: number]: {
      status: 'Conforme' | 'Não Conforme' | 'Outros';
      observacoes: string;
      fotos: string[]; // Base64 or object URLs
    };
  };
  enviadoEmail: boolean;
  enviadoGDrive: boolean;
  dataCriacao: string;
}

export interface ConformidadeForm {
  id: string;
  unidade: string;
  auditor: string;
  data: string;
  respostas: {
    [perguntaId: number]: {
      status: 'Conforme' | 'Não Conforme' | 'Outros';
      referenciaLegal: string;
      fotos: string[]; // Base64 or object URLs
    };
  };
  enviadoEmail: boolean;
  enviadoGDrive: boolean;
  dataCriacao: string;
}

export interface PilulaTreinamento {
  id: string;
  titulo: string;
  descricao: string;
  videoUrl: string; // YouTube or simple URL
  quiz: {
    pergunta: string;
    opcoes: string[];
    respostaCorreta: number; // Index
  };
  dataInicio: string;
  dataFim: string;
}

export interface QuizRespostum {
  id: string;
  pilulaId: string;
  colaboradorEmail: string;
  colaboradorNome: string;
  assistiuVideo: boolean;
  respondeuQuiz: boolean;
  acertou: boolean;
  dataResposta: string;
  status: 'Concluido' | 'Pendente' | 'Expirado';
}

export interface AppConfig {
  pbiDashboardUrl: string;
  lookerStudioUrl: string;
  gdriveFormsFolderUrl: string;
  gdrivePhotosFolderUrl: string;
}

export interface NewsItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  addedBy: string;
  createdAt: string;
}

export interface VideoCapsule {
  id: string;
  title: string;
  youtubeId: string;
  availableFrom: string; // YYYY-MM-DD
  availableTo: string;   // YYYY-MM-DD
  duration: string;
  category: string;
  formsLink: string;     // Google Forms link
}

export interface UserAccessLog {
  email: string;
  firstAccessAt: string;
  formAccessTimes: { [formKey: string]: string }; // Map key (e.g., 'filial_servicos') to access ISO timestamp
  videoAnswers: { [videoId: string]: { answered: boolean; answeredAt: string; score?: number } };
}

export interface SSMAIncidentReport {
  id: string;
  email: string;
  companyType: 'servicos' | 'adm_vendas' | 'matriz';
  location: string;
  incidentType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  status: 'Pendente' | 'Analisado' | 'Concluído';
  auditorComments?: string;
}

export interface SSMAComplianceForm {
  id: string;
  email: string;
  date: string;
  score: number; // e.g., 0 to 100
  itemsCheck: {
    epiUsage: boolean; // EPIs corretos?
    machinerySafety: boolean; // Máquinas protegidas?
    signageVisible: boolean; // Sinalização adequada?
    fireExtinguishers: boolean; // Extintores em dia?
    ergonomics: boolean; // Posturas corretas?
  };
  notes: string;
}
