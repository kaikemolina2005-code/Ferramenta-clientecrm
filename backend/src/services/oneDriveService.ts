// Integração com OneDrive (Microsoft Graph API) via Azure AD App Registration
// Requer conta Microsoft 365 empresarial (Azure AD) com permissão de aplicativo Files.ReadWrite.All
import axios from 'axios';

const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';

class OneDriveService {
  private accessToken = '';
  private tokenExpiry = 0;

  isConfigured(): boolean {
    return !!(
      process.env.ONEDRIVE_CLIENT_ID &&
      process.env.ONEDRIVE_CLIENT_SECRET &&
      process.env.ONEDRIVE_TENANT_ID &&
      process.env.ONEDRIVE_USER_EMAIL
    );
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const response = await axios.post(
      `https://login.microsoftonline.com/${process.env.ONEDRIVE_TENANT_ID}/oauth2/v2.0/token`,
      new URLSearchParams({
        client_id: process.env.ONEDRIVE_CLIENT_ID || '',
        client_secret: process.env.ONEDRIVE_CLIENT_SECRET || '',
        scope: 'https://graph.microsoft.com/.default',
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    this.accessToken = response.data.access_token;
    this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

    return this.accessToken;
  }

  /**
   * Envia o conteúdo de um arquivo para o OneDrive do usuário configurado
   * (ONEDRIVE_USER_EMAIL), dentro da pasta ONEDRIVE_FOLDER_NAME.
   * As pastas do caminho são criadas automaticamente pelo Graph API.
   */
  async uploadFile(buffer: Buffer, fileName: string, mimeType: string): Promise<{ id: string; webUrl: string }> {
    const token = await this.getAccessToken();
    const userEmail = process.env.ONEDRIVE_USER_EMAIL;
    const folder = process.env.ONEDRIVE_FOLDER_NAME || 'CRM Documentos';

    const response = await axios.put(
      `${GRAPH_API_URL}/users/${userEmail}/drive/root:/${folder}/${encodeURIComponent(fileName)}:/content`,
      buffer,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': mimeType || 'application/octet-stream',
        },
      }
    );

    return { id: response.data.id, webUrl: response.data.webUrl };
  }
}

export const oneDriveService = new OneDriveService();
export default oneDriveService;
