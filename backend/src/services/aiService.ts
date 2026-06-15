import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

interface DocumentAnalysisResult {
  success: boolean;
  documentType?: string;
  extractedText?: string;
  extractedData?: Record<string, string>;
  summary?: string;
  keyPoints?: string[];
  classification?: string;
  confidence?: number;
  error?: string;
}

const MODEL = 'gemini-2.0-flash';

export class AIService {
  private genAI: GoogleGenerativeAI;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.genAI = new GoogleGenerativeAI(this.apiKey);
  }

  /**
   * Verifica se a API está configurada
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== '';
  }

  /**
   * Chama o Gemini com um system prompt e um user prompt
   */
  private async generate(systemPrompt: string, userPrompt: string): Promise<string> {
    const model = this.genAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);
    return result.response.text();
  }

  /**
   * Processa um documento com IA
   */
  async analyzeDocument(
    filePath: string,
    documentType?: string
  ): Promise<DocumentAnalysisResult> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Gemini API não configurada. Configure GEMINI_API_KEY no .env',
        };
      }

      // Ler arquivo
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          error: `Arquivo não encontrado: ${filePath}`,
        };
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const fileName = path.basename(filePath);
      const extension = path.extname(filePath).toLowerCase();

      // Detectar tipo de documento
      const detectedType = documentType || this.detectDocumentType(fileName, extension);

      // Preparar sistema de prompt baseado no tipo
      let systemPrompt = this.getSystemPrompt(detectedType);
      let userPrompt = this.getUserPrompt(fileContent, detectedType);

      // Chamar Gemini
      const content = await this.generate(systemPrompt, userPrompt);

      if (!content) {
        return {
          success: false,
          error: 'Resposta vazia do Gemini',
        };
      }

      // Parsear resposta JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsedContent = jsonMatch ? JSON.parse(jsonMatch[0]) : this.parseTextResponse(content);

      return {
        success: true,
        documentType: detectedType,
        extractedText: fileContent.substring(0, 500),
        extractedData: parsedContent.extractedData,
        summary: parsedContent.summary,
        keyPoints: parsedContent.keyPoints,
        classification: parsedContent.classification,
        confidence: parsedContent.confidence || 0.85,
      };
    } catch (error) {
      console.error('Erro ao analisar documento:', error);
      return {
        success: false,
        error: `Erro ao processar documento: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      };
    }
  }

  /**
   * Extrai dados estruturados de um documento
   */
  async extractStructuredData(
    filePath: string,
    dataSchema: Record<string, string>
  ): Promise<DocumentAnalysisResult> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Gemini API não configurada',
        };
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const schemaDescription = Object.entries(dataSchema)
        .map(([key, description]) => `- ${key}: ${description}`)
        .join('\n');

      const content = await this.generate(
        'Você é um assistente especializado em extração de dados de documentos.',
        `Extraia os seguintes dados do documento abaixo e retorne em formato JSON:
${schemaDescription}

Documento:
${fileContent}

Retorne APENAS um JSON válido com os dados extraídos, sem explicações adicionais.`
      );

      if (!content) {
        return { success: false, error: 'Resposta vazia' };
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        success: true,
        extractedData,
      };
    } catch (error) {
      console.error('Erro ao extrair dados:', error);
      return {
        success: false,
        error: `Erro na extração: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      };
    }
  }

  /**
   * Gera resumo de um documento
   */
  async summarizeDocument(filePath: string): Promise<DocumentAnalysisResult> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          error: 'Gemini API não configurada',
        };
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');

      const content = await this.generate(
        'Você é um assistente especializado em criar resumos concisos de documentos jurídicos.',
        `Crie um resumo conciso (máximo 5 pontos) deste documento:

${fileContent}

Retorne em formato JSON com: { "summary": "...", "keyPoints": [...] }`
      );

      if (!content) {
        return { success: false, error: 'Resposta vazia' };
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return {
        success: true,
        summary: parsed.summary,
        keyPoints: parsed.keyPoints,
      };
    } catch (error) {
      console.error('Erro ao resumir documento:', error);
      return {
        success: false,
        error: `Erro no resumo: ${error instanceof Error ? error.message : 'Desconhecido'}`,
      };
    }
  }

  /**
   * Preenche campos de um formulário com dados do documento
   */
  async fillDocumentFields(documentText: string, leadData: any): Promise<string> {
    try {
      if (!this.isConfigured()) {
        throw new Error('Gemini API não configurada');
      }

      return await this.generate(
        'Você é um especialista em preenchimento de formulários jurídicos. Complete o formulário com os dados fornecidos.',
        `Complete o seguinte formulário com os dados do cliente:

Formulário:
${documentText}

Dados do Cliente:
${JSON.stringify(leadData, null, 2)}

Retorne o formulário preenchido com todos os campos completados.`
      );
    } catch (error) {
      console.error('Erro ao preencher campos:', error);
      throw error;
    }
  }

  /**
   * Detecta tipo de documento pelo nome/extensão
   */
  private detectDocumentType(fileName: string, _extension: string): string {
    const lowerName = fileName.toLowerCase();

    if (lowerName.includes('contrato') || lowerName.includes('contract')) {
      return 'contract';
    }
    if (
      lowerName.includes('rg') ||
      lowerName.includes('cpf') ||
      lowerName.includes('carteira') ||
      lowerName.includes('identity')
    ) {
      return 'identity';
    }
    if (
      lowerName.includes('recibo') ||
      lowerName.includes('nota') ||
      lowerName.includes('invoice') ||
      lowerName.includes('financial')
    ) {
      return 'financial';
    }
    if (
      lowerName.includes('receita') ||
      lowerName.includes('medical') ||
      lowerName.includes('prescription')
    ) {
      return 'medical';
    }
    if (lowerName.includes('processo') || lowerName.includes('legal')) {
      return 'legal';
    }

    return 'generic';
  }

  /**
   * Retorna o system prompt apropriado para cada tipo
   */
  private getSystemPrompt(documentType: string): string {
    const prompts: Record<string, string> = {
      legal: 'Você é um assistente jurídico especializado em análise de documentos legais. Analise o documento e extraia informações relevantes.',
      contract:
        'Você é um especialista em análise de contratos. Identifique termos, cláusulas, obrigações e condições importantes.',
      identity: 'Você é um assistente especializado em leitura e extração de documentos de identidade.',
      financial:
        'Você é um assistente de análise financeira especializado em documentos comerciais e financeiros.',
      medical: 'Você é um assistente especializado em documentos médicos e receitas.',
      generic: 'Você é um assistente de análise de documentos genéricos.',
    };

    return prompts[documentType] || prompts.generic;
  }

  /**
   * Retorna o user prompt apropriado para cada tipo
   */
  private getUserPrompt(content: string, documentType: string): string {
    const jsonSchema = {
      extractedData: '{}',
      summary: 'string com resumo de 2-3 linhas',
      keyPoints: ['array com pontos-chave'],
      classification: 'classificação do documento',
      confidence: 0.9,
    };

    const templates: Record<string, string> = {
      legal: `Analise este documento jurídico e retorne em JSON:
${JSON.stringify(jsonSchema, null, 2)}
Extraia: partes envolvidas, data, assunto, valor (se houver), vigência.

Documento:
${content.substring(0, 3000)}`,

      contract: `Analise este contrato e retorne em JSON:
${JSON.stringify(jsonSchema, null, 2)}
Extraia: partes, data de início/fim, valor, condições principais.

Contrato:
${content.substring(0, 3000)}`,

      identity: `Extraia os dados de identidade e retorne em JSON:
${JSON.stringify(jsonSchema, null, 2)}
Extraia: nome, documento, data emissão, validade, filiação.

Documento:
${content.substring(0, 2000)}`,

      financial: `Analise este documento financeiro e retorne em JSON:
${JSON.stringify(jsonSchema, null, 2)}
Extraia: data, valor, descrição, beneficiário, moeda.

Documento:
${content.substring(0, 2000)}`,

      medical: `Analise este documento médico e retorne em JSON:
${JSON.stringify(jsonSchema, null, 2)}
Extraia: paciente, data, diagnóstico, medicações, médico.

Documento:
${content.substring(0, 2000)}`,

      generic: `Analise este documento e retorne em JSON:
${JSON.stringify(jsonSchema, null, 2)}
Extraia informações principais relevantes.

Documento:
${content.substring(0, 2000)}`,
    };

    return templates[documentType] || templates.generic;
  }

  /**
   * Parse manual de resposta em texto (fallback)
   */
  private parseTextResponse(text: string): Record<string, any> {
    return {
      extractedData: {},
      summary: text.split('\n')[0],
      keyPoints: text.split('\n').slice(1, 4),
      classification: 'generic',
      confidence: 0.5,
    };
  }
}

export const aiService = new AIService();
export default aiService;
