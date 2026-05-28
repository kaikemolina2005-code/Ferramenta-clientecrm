// OneDrive/Microsoft Graph API integration service
import axios from 'axios';
import fs from 'fs';

const GRAPH_API_URL = 'https://graph.microsoft.com/v1.0';

class OneDriveService {
  private accessToken: string = '';
  private tokenExpiry: number = 0;

  /**
   * Obter token de acesso via OAuth 2.0 Client Credentials
   */
  async getAccessToken(): Promise<string> {
    // Se token ainda é válido, reutilizar
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
        new URLSearchParams({
          client_id: process.env.MICROSOFT_CLIENT_ID || '',
          client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
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
      // Expirar 5 minutos antes
      this.tokenExpiry = Date.now() + (response.data.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Error getting OneDrive access token:', error);
      throw error;
    }
  }

  /**
   * Fazer upload de arquivo para OneDrive
   */
  async uploadFile(filePath: string, fileName: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      // Validar arquivo
      if (!fs.existsSync(filePath)) {
        throw new Error(`Arquivo não encontrado: ${filePath}`);
      }

      const fileBuffer = fs.readFileSync(filePath);
      const fileSize = fileBuffer.length;

      // Usar upload simples para arquivos < 4MB
      if (fileSize < 4 * 1024 * 1024) {
        const response = await axios.put(
          `${GRAPH_API_URL}/me/drive/items/${process.env.ONEDRIVE_FOLDER_ID}:/${fileName}:/content`,
          fileBuffer,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': this.getMimeType(fileName),
            },
          }
        );
        return response.data;
      } else {
        throw new Error('Arquivo muito grande. Máximo 4MB');
      }
    } catch (error) {
      console.error('Erro ao fazer upload para OneDrive:', error);
      throw error;
    }
  }

  /**
   * Listar arquivos da pasta
   */
  async listFiles(): Promise<any[]> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(
        `${GRAPH_API_URL}/me/drive/items/${process.env.ONEDRIVE_FOLDER_ID}/children`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data.value || [];
    } catch (error) {
      console.error('Erro ao listar arquivos do OneDrive:', error);
      throw error;
    }
  }

  /**
   * Deletar arquivo do OneDrive
   */
  async deleteFile(fileId: string): Promise<void> {
    try {
      const token = await this.getAccessToken();

      await axios.delete(`${GRAPH_API_URL}/me/drive/items/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Erro ao deletar arquivo do OneDrive:', error);
      throw error;
    }
  }

  /**
   * Obter informações do arquivo
   */
  async getFileInfo(fileId: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.get(`${GRAPH_API_URL}/me/drive/items/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao obter informações do arquivo:', error);
      throw error;
    }
  }

  /**
   * Criar pasta no OneDrive
   */
  async createFolder(folderName: string): Promise<any> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${GRAPH_API_URL}/me/drive/root/children`,
        {
          name: folderName,
          folder: {},
          '@microsoft.graph.conflictBehavior': 'rename',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Erro ao criar pasta no OneDrive:', error);
      throw error;
    }
  }

  /**
   * Obter MIME type baseado na extensão
   */
  private getMimeType(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      txt: 'text/plain',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}

export default new OneDriveService();
