import { Request, Response } from 'express';
import axios from 'axios';
import { leadService } from '../services/leadService.js';
import { socketService } from '../socket/service.js';
import { leadScoringService } from '../services/leadScoringService.js';
import { autoAssignmentService } from '../services/autoAssignmentService.js';

/**
 * Integração com Facebook Lead Ads (Meta)
 *
 * Fluxo:
 * 1. Você cadastra o Webhook no app da Meta apontando para
 *    GET/POST https://SEU_BACKEND/api/facebook/webhook
 * 2. A Meta valida com GET (hub.verify_token) -> validateFacebookWebhook
 * 3. Quando alguém preenche um formulário de Lead Ad, a Meta envia um POST
 *    com o leadgen_id -> handleFacebookWebhook
 * 4. Buscamos os dados do lead na Graph API usando o Page Access Token
 * 5. Criamos o lead no CRM
 *
 * Variáveis de ambiente necessárias:
 * - FACEBOOK_WEBHOOK_VERIFY_TOKEN  (um texto secreto que VOCÊ inventa)
 * - FACEBOOK_PAGE_ACCESS_TOKEN     (o token de API da sua Página do Facebook)
 */

const GRAPH_API_VERSION = process.env.FACEBOOK_GRAPH_VERSION || 'v21.0';

interface FacebookFieldData {
  name: string;
  values: string[];
}

/**
 * GET /api/facebook/webhook
 * Validação do webhook exigida pela Meta ao cadastrar a URL.
 */
export function validateFacebookWebhook(req: Request, res: Response): void {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifyToken =
    process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'seu_token_secreto_aqui';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('✅ Webhook Facebook validado');
    res.status(200).send(challenge);
  } else {
    console.error('❌ Falha na validação do webhook Facebook (token inválido)');
    res.status(403).json({ error: 'Token de verificação inválido' });
  }
}

/**
 * Mapeia os campos retornados pela Meta para os campos do lead.
 */
function mapFieldData(fieldData: FacebookFieldData[]): {
  name: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  message?: string;
} {
  const get = (...keys: string[]): string => {
    for (const key of keys) {
      const field = fieldData.find((f) => f.name === key);
      if (field && field.values?.[0]) return field.values[0];
    }
    return '';
  };

  const fullName =
    get('full_name', 'name') ||
    `${get('first_name')} ${get('last_name')}`.trim();

  return {
    name: fullName || 'Lead do Facebook',
    email: get('email'),
    phone: get('phone_number', 'phone'),
    city: get('city') || undefined,
    state: get('state', 'province') || undefined,
    message: get('message', 'mensagem') || undefined,
  };
}

/**
 * Busca os dados completos do lead na Graph API a partir do leadgen_id.
 */
async function fetchLeadDetails(leadgenId: string): Promise<FacebookFieldData[]> {
  const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;

  if (!pageAccessToken) {
    throw new Error(
      'FACEBOOK_PAGE_ACCESS_TOKEN não configurado nas variáveis de ambiente'
    );
  }

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${leadgenId}`;
  const response = await axios.get(url, {
    params: {
      access_token: pageAccessToken,
      fields: 'field_data,created_time,ad_id,form_id',
    },
  });

  return response.data?.field_data || [];
}

/**
 * POST /api/facebook/webhook
 * Recebe a notificação de novo lead e cria o lead no CRM.
 */
export async function handleFacebookWebhook(
  req: Request,
  res: Response
): Promise<void> {
  // A Meta exige resposta 200 rápida, senão reenvia o evento.
  res.status(200).json({ received: true });

  try {
    const payload = req.body;

    if (payload.object !== 'page' || !Array.isArray(payload.entry)) {
      return;
    }

    for (const entry of payload.entry) {
      const changes = entry.changes || [];

      for (const change of changes) {
        if (change.field !== 'leadgen') continue;

        const leadgenId = change.value?.leadgen_id;
        if (!leadgenId) continue;

        console.log(`\n📥 Novo lead do Facebook recebido (leadgen_id: ${leadgenId})`);

        // 1. Buscar dados completos do lead na Graph API
        const fieldData = await fetchLeadDetails(leadgenId);
        const data = mapFieldData(fieldData);

        if (!data.email && !data.phone) {
          console.warn('⚠️ Lead sem email e sem telefone, ignorado');
          continue;
        }

        // 2. Criar lead no CRM
        const phoneNumbers = (data.phone || '').replace(/\D/g, '');
        const newLead = await leadService.createLead({
          name: data.name,
          email: (data.email || `${leadgenId}@facebook-lead.local`).toLowerCase(),
          phone: phoneNumbers || '00000000000',
          city: data.city,
          state: data.state,
          source: 'FACEBOOK_ADS',
        });

        console.log(`✅ Lead criado: ${newLead.name} (${newLead.id})`);

        // 3. Emitir evento em tempo real para o painel
        socketService.emitLeadCreated({
          id: newLead.id,
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          category: newLead.category,
          status: newLead.status,
          source: newLead.source,
          createdAt: newLead.createdAt,
        });

        // 4. Calcular score e atribuir automaticamente se for quente
        await leadScoringService.calculateLeadScore(newLead.id).catch(() => null);
        if (newLead.score && newLead.score > 70) {
          await autoAssignmentService.autoAssignLead(newLead.id).catch(() => null);
        }
      }
    }
  } catch (error: any) {
    console.error(
      '❌ Erro ao processar webhook do Facebook:',
      error?.response?.data || error.message
    );
  }
}

/**
 * GET /api/facebook/status
 * Mostra se o token e o verify token estão configurados (sem expor segredos).
 */
export function getFacebookStatus(_req: Request, res: Response): void {
  res.json({
    success: true,
    pageAccessTokenConfigured: Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN),
    verifyTokenConfigured: Boolean(process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN),
    graphVersion: GRAPH_API_VERSION,
  });
}
