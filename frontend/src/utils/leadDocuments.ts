/**
 * Geração automática dos documentos do escritório a partir dos dados do lead.
 *
 * Preenche os campos <NOMESEGURADO>, <CPF>, <EMAIL>, <ENDERECO>, <BAIRRO>,
 * <CEP>, <CIDADE>, <ESTADO>, <CELULAR>, <NACIONALIDADE>, <ESTADOCIVIL> e
 * <PROFISSAO> com os dados cadastrados. Campos vazios viram "____________".
 *
 * Gera dois formatos: Word (.doc) e PDF.
 */
import { jsPDF } from 'jspdf';
import type { Lead } from '@/types';

interface DocPart {
  title: string;
  paragraphs: string[];
}

const BLANK = '____________';

function fill(template: string, lead: Lead): string {
  const map: Record<string, string> = {
    NOMESEGURADO: lead.name || BLANK,
    NACIONALIDADE: lead.nationality || BLANK,
    ESTADOCIVIL: lead.maritalStatus || BLANK,
    PROFISSAO: lead.profession || BLANK,
    CPF: lead.cpf || BLANK,
    EMAIL: lead.email || BLANK,
    ENDERECO: lead.address || BLANK,
    BAIRRO: lead.neighborhood || BLANK,
    CEP: lead.zipCode || BLANK,
    CIDADE: lead.city || BLANK,
    ESTADO: lead.state || BLANK,
    CELULAR: lead.phone || BLANK,
  };
  return template.replace(/<([A-Z]+)>/g, (match, key) => (key in map ? map[key] : match));
}

const QUALIFICACAO =
  '<NOMESEGURADO>, maior, <NACIONALIDADE>, <ESTADOCIVIL>, <PROFISSAO>, portador(a) do CPF/MF sob o nº <CPF>, e-mail <EMAIL>, residente e domiciliado na <ENDERECO>, <BAIRRO>, <CEP>, <CIDADE>/<ESTADO>, celular nº. <CELULAR>';

function buildDocuments(lead: Lead): DocPart[] {
  const contrato: DocPart = {
    title: 'CONTRATO DE HONORÁRIOS',
    paragraphs: [
      `${QUALIFICACAO}, Contrata os escritórios DIEGO PATRICIO SOCIEDADE INDIVIDUAL DE ADVOCACIA, CNPJ sob nº. 12.353.103/0001-14 e Diego Manoel Patricio Slu Ltda, CNPJ sob nº. 55.306.259/0001-57, ambos representados por seu sócio, advogado Diego Manoel Patricio, brasileiro, divorciado, inscrito na OAB/SP sob o n° 279.243, portador da CIRG nº 33.204.626-6 SSP-SP, inscrito no CPF/MF sob o nº 328.351.108-01, fone: (13) 99677 9549, e-mail: dr.diego.dp@gmail.com. Nos termos da procuração assinada para o ingresso e acompanhamento da minha demanda, conforme procuração anexa.`,
      'Para isso pagarei o valor fixado em 4 vezes o valor do salário de benefício (RMA), no caso de Aposentadoria, BPC/LOAS, Pensão por Morte e Auxílio Acidente, com deferimento do pedido, no final, mais, em todos os casos, o valor de 30% do saldo acumulado devido judicialmente e/ou em complemento positivo pago administrativamente, fixado no valor mínimo de 30% do salário-mínimo federal.',
      'Caso, após assinatura do contrato, o benefício seja deferido e a orientação sobre a causa tenha sido realizada, o contratante, após recebimento do benefício, deve acertar o valor de ½ salário-mínimo federal. Concordo que seja destacado o valor dos honorários aqui contratados em nome da sociedade de Advogados, em conformidade com o disposto no artigo 85, §15 da Lei n° 13.105/15, declarando, neste ato, que não adiantei nenhum valor a título de honorários, tampouco adiantarei no decorrer do processo.',
      'Em caso de desistência da ação por minha vontade ou pedido de substabelecimento/troca para outro Advogado (antes ou após a distribuição) pagarei ao CONTRATADO, além do percentual equivalente ao trabalho já realizado, o valor de multa de R$ 5.500,00 (cinco mil e quinhentos reais) a título de multa contratual. Em caso de deferimento do pedido no decorrer da ação judicial, bem como em caso de acordo ou pagamento no âmbito extrajudicial, pagarei os honorários contratados na mesma proporção aqui avençado.',
      'Todos os pagamentos serão realizados EXCLUSIVAMENTE mediante boleto bancário expedido pela empresa Diego Manoel Patricio Slu Ltda – CNPJ 55.306.259/0001-57. As despesas processuais, custas e demais, são de responsabilidade do contratante. Autorizo, sem custo adicional, o envio de correspondências, e-mail e mensagens eletrônicas (SMS/WhatsApp), com objetivo de me manter informado sobre questões relacionadas ao processo.',
      'Consulta mensal, sem custo, mediante atendimento das 08:00 às 17:00, EXCLUSIVAMENTE pelo e-mail dr.diego.dp@gmail.com e pelo número whatsapp verificado pelo META (+55 13 99677-9549). O atendimento por outro e-mail ou WhatsApp é irregular e provável tentativa de golpe. Não requisitamos pagamento em antecipação.',
      'A CONTRATANTE se responsabiliza pela autenticidade e veracidade dos documentos enviados/entregues ao CONTRATADO, bem como pelas informações fornecidas no ato do atendimento e por aquelas que forem prestadas no decorrer da ação judicial. Elegem, em conjunto, o Foro da Comarca da assinatura da presente, assinando em duas vias de igual teor e forma, escritas somente no anverso.',
    ],
  };

  const procuracao: DocPart = {
    title: 'PROCURAÇÃO',
    paragraphs: [
      `Eu, ${QUALIFICACAO},`,
      'Pelo presente instrumento de procuração, nomeio e constituo o escritório DIEGO PATRICIO SOCIEDADE INDIVIDUAL DE ADVOCACIA, CNPJ sob nº. 12.353.103/0001-14, na pessoa de seu sócio, como meu advogado, Diego Manoel Patricio, brasileiro, divorciado, inscrito na OAB/SP sob o n° 279.243, portador do RG nº 33.204.626-6 SSP-SP, inscrito no CPF sob o nº 328.351.108-01, estabelecido na Rua Rafael Costábile, 164, Centro, CEP 11250-258, Bertioga/SP, fone (11) 91131 6232, e-mail dr.diego.dp@gmail.com, podendo atuar em qualquer Juízo, Instância ou Tribunal, junta a administração pública municipal, estadual e federal, defender meus interesses, a quem confiro amplos, gerais e ilimitados poderes para o foro em geral, com a cláusula "ad judicia" e "et extra", a fim de que possa realizar todos os atos que se fizerem necessários ao bom e fiel cumprimento deste mandato, inclusive promover quaisquer medidas administrativas, especialmente para agendar e requerer benefícios, revisões administrativas, interpor pedidos e recursos no âmbito administrativo, requerer cópias, vistas, cargas de processos, retirar cópia perante qualquer juízo, instância ou Tribunal, repartição pública e órgãos da administração pública, conferindo, também, poderes específicos para receber citação, confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar valor excedente a 60 salários mínimos até a data da propositura da ação, para tramitação junta ao JEF, receber, dar quitação, firmar compromisso, com fim específico de defender-me, propondo ação pertinente em face do INSS.',
    ],
  };

  const declaracao: DocPart = {
    title: 'DECLARAÇÃO DE HIPOSSUFICIÊNCIA',
    paragraphs: [
      `Eu, ${QUALIFICACAO},`,
      'Venho, pelo presente instrumento, declarar, sob as penas da lei, que não possuo condições financeiras de arcar com os encargos processuais sem afetar o meu sustento e o da minha própria família.',
      'Por isso, requeiro a concessão dos benefícios da Gratuidade da Justiça, para o exercício de meus direitos e garantias fundamentais constitucionalmente assegurados.',
    ],
  };

  return [contrato, procuracao, declaracao].map((doc) => ({
    title: doc.title,
    paragraphs: doc.paragraphs.map((p) => fill(p, lead)),
  }));
}

function safeFileName(lead: Lead): string {
  return (lead.name || 'lead').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
}

/** Gera e baixa o Word (.doc) com os 3 documentos. */
export function generateLeadWord(lead: Lead): void {
  const docs = buildDocuments(lead);
  const body = docs
    .map((doc, i) => {
      const paras = doc.paragraphs
        .map((p) => `<p style="text-align:justify;margin:0 0 12px 0;">${escapeHtml(p)}</p>`)
        .join('');
      const pageBreak = i < docs.length - 1 ? '<br clear="all" style="page-break-before:always" />' : '';
      return `<h2 style="text-align:center;">${escapeHtml(doc.title)}</h2>${paras}${pageBreak}`;
    })
    .join('');

  const html = `<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"></head><body style="font-family:'Times New Roman',serif;font-size:12pt;">${body}</body></html>`;

  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  triggerDownload(blob, `Documentos_${safeFileName(lead)}.doc`);
}

/** Gera e baixa o PDF com os 3 documentos. */
export function generateLeadPDF(lead: Lead): void {
  const docs = buildDocuments(lead);
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const marginX = 20;
  const marginTop = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - marginX * 2;
  let y = marginTop;

  const addLine = (text: string, fontSize: number, bold: boolean, align: 'left' | 'center' | 'justify') => {
    pdf.setFont('times', bold ? 'bold' : 'normal');
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, usableWidth) as string[];
    for (const line of lines) {
      if (y > pageHeight - marginTop) {
        pdf.addPage();
        y = marginTop;
      }
      if (align === 'center') {
        pdf.text(line, pageWidth / 2, y, { align: 'center' });
      } else {
        pdf.text(line, marginX, y);
      }
      y += fontSize * 0.55;
    }
  };

  docs.forEach((doc, i) => {
    if (i > 0) {
      pdf.addPage();
      y = marginTop;
    }
    addLine(doc.title, 13, true, 'center');
    y += 4;
    doc.paragraphs.forEach((p) => {
      addLine(p, 11, false, 'left');
      y += 3;
    });
  });

  pdf.save(`Documentos_${safeFileName(lead)}.pdf`);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
