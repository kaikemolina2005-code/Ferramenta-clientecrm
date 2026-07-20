/**
 * Geração automática dos documentos do escritório a partir dos dados do lead.
 *
 * Preenche os campos <NOMESEGURADO>, <CPF>, <EMAIL>, <ENDERECO>, <BAIRRO>,
 * <CEP>, <CIDADE>, <ESTADO>, <CELULAR>, <NACIONALIDADE>, <ESTADOCIVIL> e
 * <PROFISSAO> com os dados cadastrados. Campos vazios viram "____________".
 *
 * Layout replica o papel timbrado do escritório: margens de página A4,
 * cabeçalho com a marca, título centralizado sublinhado e trechos em
 * negrito/sublinhado nas cláusulas de maior relevância jurídica (valores,
 * multas, renúncias), igual ao modelo usado pelo escritório.
 */
import { jsPDF } from 'jspdf';
import type { Lead } from '@/types';

// Um parágrafo é uma lista de trechos; cada trecho pode ser negrito e/ou sublinhado.
interface Segment {
  text: string;
  bold?: boolean;
  underline?: boolean;
}
type Paragraph = Segment[];

interface DocPart {
  title: string;
  paragraphs: Paragraph[];
  // Bloco de contato (caixa) exibido apenas no Contrato, após os parágrafos normais.
  contactBox?: Paragraph[];
  afterBox?: Paragraph[];
}

const BLANK = '____________';

function fillText(text: string, lead: Lead): string {
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
  return text.replace(/<([A-Z]+)>/g, (match, key) => (key in map ? map[key] : match));
}

function fillParagraph(p: Paragraph, lead: Lead): Paragraph {
  return p.map((seg) => ({ ...seg, text: fillText(seg.text, lead) }));
}

const QUALIFICACAO =
  '<NOMESEGURADO>, maior, <NACIONALIDADE>, <ESTADOCIVIL>, <PROFISSAO>, portador(a) do CPF/MF sob o nº <CPF>, e-mail <EMAIL>, residente e domiciliado na <ENDERECO>, <BAIRRO>, <CEP>, <CIDADE>/<ESTADO>, celular nº. <CELULAR>';

function buildDocuments(lead: Lead): DocPart[] {
  const contrato: DocPart = {
    title: 'CONTRATO DE HONORÁRIOS',
    paragraphs: [
      [
        { text: `${QUALIFICACAO}, Contrata os escritórios ` },
        { text: 'DIEGO PATRICIO SOCIEDADE INDIVIDUAL DE ADVOCACIA', bold: true },
        { text: ', CNPJ sob nº. 12.353.103/0001-14 e ' },
        { text: 'Diego Manoel Patricio Slu Ltda', bold: true },
        {
          text: ', CNPJ sob nº. 55.306.259/0001-57, ambos representados por seu sócio, advogado Diego Manoel Patricio, brasileiro, divorciado, inscrito na OAB/SP sob o n° 279.243, portador da CIRG nº 33.204.626-6 SSP-SP, inscrito no CPF/MF sob o nº 328.351.108-01, fone: (13) 99677 9549, e-mail: ',
        },
        { text: 'dr.diego.dp@gmail.com', underline: true },
        { text: '. Nos termos da procuração assinada para o ingresso e acompanhamento da minha demanda, conforme procuração anexa.' },
      ],
      [
        {
          text: 'Para isso pagarei o valor fixado em 4 vezes o valor do salário de benefício (RMA), no caso de Aposentadoria, BPC/LOAS, Pensão por Morte e Auxílio Acidente, com deferimento do pedido, no final, mais, em todos os casos, o valor de 30% do saldo acumulado devido judicialmente e/ou em complemento positivo pago administrativamente, fixado no valor mínimo de 30% do salário-mínimo federal.',
          bold: true,
          underline: true,
        },
      ],
      [
        {
          text: 'Caso, após assinatura do contrato, o benefício seja deferido e a orientação sobre a causa tenha sido realizada, o contratante, após recebimento do benefício, deve acertar o valor de ½ salário-mínimo federal. ',
        },
        {
          text: 'Concordo que seja destacado o valor dos honorários aqui contratados em nome da sociedade de Advogados, em conformidade com o disposto no artigo 85, §15 da Lei n° 13.105/15, declarando, neste ato, que não adiantei nenhum valor a título de honorários, tampouco adiantarei no decorrer do processo.',
          bold: true,
          underline: true,
        },
      ],
      [
        { text: 'Em caso de desistência da ação por minha vontade ou pedido de substabelecimento/troca para outro Advogado (antes ou após a distribuição) pagarei ao CONTRATADO, ' },
        {
          text: 'além do percentual equivalente ao trabalho já realizado, o valor de multa de R$ 5.500,00 (cinco mil e quinhentos reais) a título de multa contratual.',
          bold: true,
          underline: true,
        },
        { text: ' Em caso de deferimento do pedido no decorrer da ação judicial, bem como em caso de acordo ou pagamento no âmbito extrajudicial, pagarei os honorários contratados na mesma proporção aqui avençado.' },
      ],
      [
        { text: 'Todos os pagamentos serão realizados EXCLUSIVAMENTE mediante boleto bancário expedido pela empresa ' },
        { text: 'Diego Manoel Patricio Slu Ltda', bold: true },
        {
          text: ' – CNPJ 55.306.259/0001-57. As despesas processuais, custas e demais, são de responsabilidade do contratante. Autorizo, sem custo adicional, o envio de correspondências, e-mail e mensagens eletrônicas (SMS/WhatsApp), com objetivo de me manter informado sobre questões relacionadas ao processo.',
        },
      ],
    ],
    contactBox: [
      [
        { text: 'Consulta mensal, sem custo, mediante atendimento das 08:00 às 17:00, EXCLUSIVAMENTE pelo e-mail ', underline: true },
        { text: 'dr.diego.dp@gmail.com', underline: true },
        { text: ' e pelo número whatsapp verificado pelo META.', underline: true },
      ],
      [
        { text: '📞 +55 13 99677-9549   ✅ Diego Patrício', bold: true },
      ],
      [
        {
          text: 'O atendimento por outro e-mail ou WhatsApp é irregular e provável tentativa de golpe. Não requisitamos pagamento em antecipação.',
          underline: true,
        },
      ],
    ],
    afterBox: [
      [
        {
          text: 'A CONTRATANTE se responsabiliza pela autenticidade e veracidade dos documentos enviados/entregues ao CONTRATADO, bem como pelas informações fornecidas no ato do atendimento e por aquelas que forem prestadas no decorrer da ação judicial. Elegem, em conjunto, o Foro da Comarca da assinatura da presente, assinando em duas vias de igual teor e forma, escritas somente no anverso.',
        },
      ],
    ],
  };

  const procuracao: DocPart = {
    title: 'PROCURAÇÃO',
    paragraphs: [
      [{ text: `Eu, ${QUALIFICACAO},` }],
      [
        {
          text: 'Pelo presente instrumento de procuração, nomeio e constituo o escritório DIEGO PATRICIO SOCIEDADE INDIVIDUAL DE ADVOCACIA, CNPJ sob nº. 12.353.103/0001-14, na pessoa de seu sócio, como meu advogado, Diego Manoel Patricio, brasileiro, divorciado, inscrito na OAB/SP sob o n° 279.243, portador do RG nº 33.204.626-6 SSP-SP, inscrito no CPF sob o nº 328.351.108-01, estabelecido na Rua Rafael Costábile, 164, Centro, CEP 11250-258, Bertioga/SP, fone (11) 91131 6232, e-mail dr.diego.dp@gmail.com, podendo atuar em qualquer Juízo, Instância ou Tribunal, junta a administração pública municipal, estadual e federal, defender meus interesses, a quem confiro amplos, gerais e ilimitados poderes para o foro em geral, com a cláusula "ad judicia" e "et extra", a fim de que possa realizar todos os atos que se fizerem necessários ao bom e fiel cumprimento deste mandato, inclusive promover quaisquer medidas administrativas, especialmente para agendar e requerer benefícios, revisões administrativas, interpor pedidos e recursos no âmbito administrativo, requerer cópias, vistas, cargas de processos, retirar cópia perante qualquer juízo, instância ou Tribunal, repartição pública e órgãos da administração pública, conferindo, também, poderes específicos para receber citação, confessar, reconhecer a procedência do pedido, transigir, desistir, ',
        },
        {
          text: 'renunciar valor excedente a 60 salários mínimos até a data da propositura da ação, para tramitação junta ao JEF,',
          bold: true,
          underline: true,
        },
        {
          text: ' receber, dar quitação, firmar compromisso, com fim específico de defender-me, propondo ação pertinente em face do INSS.',
        },
      ],
    ],
  };

  const declaracao: DocPart = {
    title: 'DECLARAÇÃO DE HIPOSSUFICIÊNCIA',
    paragraphs: [
      [{ text: `Eu, ${QUALIFICACAO},` }],
      [
        {
          text: 'Venho, pelo presente instrumento, declarar, sob as penas da lei, que não possuo condições financeiras de arcar com os encargos processuais sem afetar o meu sustento e o da minha própria família.',
        },
      ],
      [
        { text: 'Por isso, requeiro a concessão dos benefícios da ' },
        { text: 'Gratuidade da Justiça', underline: true },
        { text: ', para o exercício de meus direitos e garantias fundamentais constitucionalmente assegurados.' },
      ],
    ],
  };

  return [contrato, procuracao, declaracao].map((doc) => ({
    ...doc,
    paragraphs: doc.paragraphs.map((p) => fillParagraph(p, lead)),
    contactBox: doc.contactBox?.map((p) => fillParagraph(p, lead)),
    afterBox: doc.afterBox?.map((p) => fillParagraph(p, lead)),
  }));
}

function safeFileName(lead: Lead): string {
  return (lead.name || 'lead').replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
}

function segmentsToHtml(segments: Paragraph): string {
  return segments
    .map((seg) => {
      let inner = escapeHtml(seg.text);
      if (seg.bold) inner = `<strong>${inner}</strong>`;
      if (seg.underline) inner = `<u>${inner}</u>`;
      return inner;
    })
    .join('');
}

function letterheadHtml(): string {
  return `
    <div style="text-align:center;margin-bottom:14pt;">
      <div style="font-size:15pt;font-weight:bold;color:#003f7f;letter-spacing:1pt;">DIEGO PATRÍCIO</div>
      <div style="font-size:9pt;font-weight:600;color:#a9822f;letter-spacing:3pt;">ADVOGADO</div>
      <div style="border-bottom:1.5pt solid #a9822f;width:100%;margin-top:6pt;"></div>
    </div>`;
}

/** Gera e baixa o Word (.doc) com os 3 documentos, no layout de papel timbrado do escritório. */
export function generateLeadWord(lead: Lead): void {
  const docs = buildDocuments(lead);

  const sections = docs
    .map((doc, i) => {
      const paras = doc.paragraphs
        .map((p) => `<p align="justify" style="text-align:justify;margin:0 0 12pt 0;">${segmentsToHtml(p)}</p>`)
        .join('');

      const box = doc.contactBox
        ? `<table style="width:100%;border:1pt solid #999;border-collapse:collapse;margin:14pt 0;">
             <tr><td style="padding:10pt 14pt;">
               ${doc.contactBox.map((p) => `<p align="center" style="text-align:center;margin:0 0 8pt 0;">${segmentsToHtml(p)}</p>`).join('')}
             </td></tr>
           </table>`
        : '';

      const afterBox = doc.afterBox
        ? doc.afterBox.map((p) => `<p align="justify" style="text-align:justify;margin:0 0 12pt 0;">${segmentsToHtml(p)}</p>`).join('')
        : '';

      const pageBreak = i > 0 ? 'style="page-break-before:always;padding-top:1pt;"' : '';

      return `<div ${pageBreak}>
        ${letterheadHtml()}
        <h2 style="text-align:center;font-size:13pt;font-weight:bold;text-decoration:underline;margin:0 0 16pt 0;">${escapeHtml(doc.title)}</h2>
        ${paras}${box}${afterBox}
      </div>`;
    })
    .join('');

  const html = `<!DOCTYPE html>
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page {
          size: 21cm 29.7cm;
          margin: 2.8cm 2.3cm 2.8cm 2.3cm;
          mso-page-orientation: portrait;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 12pt;
          line-height: 1.4;
          color: #1a1a1a;
        }
      </style>
    </head>
    <body>${sections}</body>
    </html>`;

  const blob = new Blob(['﻿', html], { type: 'application/msword' });
  triggerDownload(blob, `Documentos_${safeFileName(lead)}.doc`);
}

/** Gera e baixa o PDF com os 3 documentos (versão simplificada, sem negrito/sublinhado por trecho). */
export function generateLeadPDF(lead: Lead): void {
  const docs = buildDocuments(lead);
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const marginX = 20;
  const marginTop = 20;
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - marginX * 2;
  let y = marginTop;

  const addLine = (text: string, fontSize: number, bold: boolean, align: 'left' | 'center') => {
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

  const paragraphToText = (p: Paragraph) => p.map((s) => s.text).join('');

  docs.forEach((doc, i) => {
    if (i > 0) {
      pdf.addPage();
      y = marginTop;
    }
    addLine(doc.title, 13, true, 'center');
    y += 4;
    doc.paragraphs.forEach((p) => {
      addLine(paragraphToText(p), 11, false, 'left');
      y += 3;
    });
    if (doc.contactBox) {
      y += 2;
      doc.contactBox.forEach((p) => {
        addLine(paragraphToText(p), 10, false, 'center');
        y += 2;
      });
      y += 2;
    }
    if (doc.afterBox) {
      doc.afterBox.forEach((p) => {
        addLine(paragraphToText(p), 11, false, 'left');
        y += 3;
      });
    }
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
