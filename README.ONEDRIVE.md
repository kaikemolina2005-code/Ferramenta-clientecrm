# Integração OneDrive - Guia de Configuração

## 🔐 Configuração do Microsoft Azure

### 1. Criar Aplicação no Azure AD

1. Acesse [Azure Portal](https://portal.azure.com)
2. Vá para **Azure Active Directory → App registrations**
3. Clique em **New registration**
4. Preencha os dados:
   - **Name**: Advocacia CRM
   - **Supported account types**: Accounts in this organizational directory only
5. Clique em **Register**

### 2. Obter Credenciais

Após registrar, você verá:

- **Application (client) ID** → Copiar e salvar como `MICROSOFT_CLIENT_ID`
- **Directory (tenant) ID** → Copiar e salvar como `MICROSOFT_TENANT_ID`

### 3. Criar Client Secret

1. Vá para **Certificates & secrets**
2. Clique em **New client secret**
3. Defina a expiração (mínimo 1 ano recomendado)
4. Copie o **Value** e salve como `MICROSOFT_CLIENT_SECRET`

⚠️ **Importante**: Este valor só aparecerá uma vez. Salve em local seguro!

### 4. Configurar Permissões de API

1. Vá para **API permissions**
2. Clique em **Add a permission**
3. Selecione **Microsoft Graph**
4. Escolha **Application permissions**
5. Procure e marque:
   - `Files.ReadWrite.All`
   - `Sites.ReadWrite.All`
6. Clique em **Add permissions**
7. Clique em **Grant admin consent for [Org Name]**

### 5. Obter Folder ID do OneDrive

1. Abra [OneDrive](https://onedrive.live.com) ou SharePoint
2. Crie uma pasta chamada "Advocacia CRM Docs" (ou outro nome)
3. Copie a URL: `https://contoso-my.sharepoint.com/personal/user_contoso_com/Documents/Advocacia%20CRM%20Docs`
4. Para obter o ID, você pode:
   - Usar o Microsoft Graph Explorer
   - Ou fazer uma chamada GET a: `https://graph.microsoft.com/v1.0/me/drive/root/children`
5. Procure pela pasta e copie o `id`

### 6. Configurar Variáveis de Ambiente

Adicione ao arquivo `.env` do backend:

```env
# Microsoft OneDrive
MICROSOFT_TENANT_ID="seu-tenant-id"
MICROSOFT_CLIENT_ID="seu-client-id"
MICROSOFT_CLIENT_SECRET="seu-client-secret"
ONEDRIVE_FOLDER_ID="seu-folder-id"
```

Substitua os valores pelos obtidos nos passos anteriores.

## 🧪 Testar a Integração

### 1. Verificar Token

```bash
curl -X POST https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token \
  -d "client_id={CLIENT_ID}" \
  -d "client_secret={CLIENT_SECRET}" \
  -d "scope=https://graph.microsoft.com/.default" \
  -d "grant_type=client_credentials"
```

Deve retornar um `access_token`.

### 2. Listar Arquivos da Pasta

```bash
curl -H "Authorization: Bearer {ACCESS_TOKEN}" \
  https://graph.microsoft.com/v1.0/me/drive/items/{FOLDER_ID}/children
```

## 📤 Upload de Documentos na API

### Endpoint

```
POST /api/documents/lead/:leadId
Content-Type: multipart/form-data

Body: 
- file: (arquivo binário, máx 4MB)
```

### Exemplo com cURL

```bash
curl -X POST http://localhost:3000/api/documents/lead/lead-123 \
  -H "Authorization: Bearer seu-jwt-token" \
  -F "file=@documento.pdf"
```

### Resposta Sucesso

```json
{
  "success": true,
  "data": {
    "id": "doc-123",
    "leadId": "lead-123",
    "name": "documento.pdf",
    "type": "application/pdf",
    "fileUrl": "uploads/1234567890-documento.pdf",
    "oneDriveId": "b!_xyz123...",
    "isProcessed": false,
    "createdAt": "2026-05-27T19:50:00.000Z"
  },
  "message": "Documento enviado com sucesso"
}
```

## 📋 Listar Documentos de um Lead

```
GET /api/documents/lead/:leadId
```

### Resposta

```json
{
  "success": true,
  "data": [...],
  "total": 5
}
```

## 🗑️ Deletar Documento

```
DELETE /api/documents/:documentId
```

## ⬇️ Baixar Documento

```
GET /api/documents/:documentId/download
```

## ⚙️ Troubleshooting

### Erro: "Invalid Tenant ID"

- Verifique o `MICROSOFT_TENANT_ID` (formato: uuid ou "common")
- Confirme que a aplicação existe no Azure AD

### Erro: "Insufficient Privileges"

- Vai para **API permissions** no Azure
- Clique **Grant admin consent**
- Aguarde alguns minutos para propagação

### Arquivo não aparece no OneDrive

- Verifique o `ONEDRIVE_FOLDER_ID`
- Confirme que a pasta existe e acessível
- Teste o token manualmente no Microsoft Graph Explorer

### Limite de arquivo excedido

- Máximo: 4MB por arquivo
- Para arquivos maiores, altere em `backend/.env`:

```env
MAX_FILE_SIZE=52428800  # 50MB
```

## 🔗 Recursos Úteis

- [Microsoft Graph Documentation](https://docs.microsoft.com/en-us/graph/api/overview)
- [Microsoft Graph Explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)
- [Azure AD Permissions](https://docs.microsoft.com/en-us/graph/permissions-reference)
- [OneDrive API Reference](https://docs.microsoft.com/en-us/onedrive/developer/rest-api/)
