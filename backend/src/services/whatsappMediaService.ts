import axios from 'axios';

const GRAPH_API = 'https://graph.facebook.com/v18.0';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/gif': '.gif',
  'image/webp': '.webp',
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'application/vnd.ms-excel': '.xls',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'audio/ogg': '.ogg',
  'audio/mpeg': '.mp3',
  'video/mp4': '.mp4',
  'text/plain': '.txt',
};

const MEDIA_TYPE_LABEL: Record<string, string> = {
  'image/jpeg': 'imagem',
  'image/png': 'imagem',
  'image/webp': 'imagem',
  'image/gif': 'imagem',
  'application/pdf': 'PDF',
  'application/msword': 'documento Word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documento Word',
  'application/vnd.ms-excel': 'planilha',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'planilha',
  'audio/ogg': 'áudio',
  'audio/mpeg': 'áudio',
  'video/mp4': 'vídeo',
  'text/plain': 'documento',
};

export function mimeToExt(mimeType: string): string {
  return MIME_TO_EXT[mimeType] || '.bin';
}

export function mimeToLabel(mimeType: string): string {
  return MEDIA_TYPE_LABEL[mimeType] || 'arquivo';
}

/**
 * Baixa a mídia do WhatsApp (imagem, documento, áudio, vídeo)
 * usando a API do Meta Graph.
 */
export async function downloadWhatsAppMedia(mediaId: string): Promise<{
  buffer: Buffer;
  mimeType: string;
  fileName: string;
}> {
  const token = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN;
  if (!token) throw new Error('WHATSAPP_BUSINESS_ACCESS_TOKEN não configurado');

  // 1. Obter a URL temporária de download
  const metaRes = await axios.get(`${GRAPH_API}/${mediaId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const { url, mime_type } = metaRes.data;

  // 2. Baixar o arquivo binário
  const fileRes = await axios.get(url, {
    headers: { Authorization: `Bearer ${token}` },
    responseType: 'arraybuffer',
  });

  const buffer = Buffer.from(fileRes.data);
  const ext = mimeToExt(mime_type);
  const fileName = `whatsapp_${mediaId}${ext}`;

  return { buffer, mimeType: mime_type, fileName };
}

/**
 * Envia uma mensagem de texto simples via WhatsApp Business API.
 */
export async function sendWhatsAppText(to: string, text: string): Promise<void> {
  const token = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_ID;
  if (!token || !phoneNumberId) {
    console.warn('WhatsApp não configurado — mensagem não enviada');
    return;
  }

  try {
    await axios.post(
      `${GRAPH_API}/${phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Erro ao enviar mensagem WhatsApp:', error?.response?.data || error.message);
  }
}
