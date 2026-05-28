import { useState, useEffect } from 'react';
import { Document as DocumentType } from '@/types';
import { documentService } from '@/services/documentService';
import { GlassCard } from '@/components/Common';

export function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      // Nota: Será implementado com seleção de lead
      // const docs = await documentService.getLeadDocuments(leadId);
      // setDocuments(docs);
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (máx 4MB)
      if (file.size > 4 * 1024 * 1024) {
        alert('Arquivo muito grande. Máximo 4MB');
        return;
      }

      // Validar tipo
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'image/jpeg',
        'image/png',
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('Tipo de arquivo não permitido');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsLoading(true);
      setUploadProgress(0);

      // Simular progresso
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload será implementado com seleção de lead
      // await documentService.uploadDocument(leadId, selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setSelectedFile(null);
      await loadDocuments();

      setTimeout(() => setUploadProgress(0), 1000);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (window.confirm('Tem certeza que deseja deletar este documento?')) {
      try {
        await documentService.deleteDocument(documentId);
        setDocuments(documents.filter((doc) => doc.id !== documentId));
      } catch (error) {
        console.error('Erro ao deletar documento:', error);
      }
    }
  };

  const handleDownload = async (documentId: string) => {
    try {
      await documentService.downloadDocument(documentId);
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-dark-blue font-poppins">Documentos</h1>
      </div>

      {/* Upload Area */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-dark-blue mb-4">📤 Upload de Documento</h2>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-dark-blue rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors">
            <label htmlFor="file-input" className="cursor-pointer block">
              <p className="text-lg font-semibold text-dark-blue">Selecione um arquivo</p>
              <p className="text-sm text-gray-600 mt-1">PDF, DOC, DOCX, JPG ou PNG (máx 4MB)</p>
              <input
                id="file-input"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
            </label>
          </div>

          {selectedFile && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-semibold text-dark-blue">Arquivo selecionado:</p>
              <p className="text-sm text-gray-600 mt-1">{selectedFile.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="space-y-2">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-dark-blue h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-600">{uploadProgress}% concluído</p>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isLoading}
            className="w-full px-4 py-2 bg-dark-blue text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
          >
            {isLoading ? 'Enviando...' : 'Fazer Upload'}
          </button>
        </div>
      </GlassCard>

      {/* Documents List */}
      <GlassCard className="p-6">
        <h2 className="text-xl font-bold text-dark-blue mb-4">📄 Meus Documentos</h2>

        {isLoading && !documents.length ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-dark-blue mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando documentos...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum documento enviado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 bg-light-gray rounded-lg hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">
                    {doc.type?.includes('pdf') ? '📕' : doc.type?.includes('word') ? '📗' : '📄'}
                  </div>
                  <div>
                    <p className="font-semibold text-dark-blue">{doc.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload(doc.id)}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
                  >
                    ⬇️ Download
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200 transition-colors"
                  >
                    🗑️ Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      {/* Info Box */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          ℹ️ <strong>Nota:</strong> Os documentos serão automaticamente salvos no OneDrive após configurar as credenciais do Microsoft Azure.
        </p>
      </div>
    </div>
  );
}
