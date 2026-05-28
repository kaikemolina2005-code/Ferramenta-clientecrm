import { useState } from 'react';
import { Modal, ConfirmDialog, ToastContainer } from '@/components/Modals';
import { useToast } from '@/hooks/useToast';
import { Card, Button, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';

export default function ComponentsDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '' });
  const { toasts, success, error, warning, info, removeToast } = useToast();

  const handleCreateItem = () => {
    if (!formData.name || !formData.email) {
      error('Preencha todos os campos');
      return;
    }
    success(`Item "${formData.name}" criado com sucesso!`);
    setFormData({ name: '', email: '' });
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    success('Item deletado com sucesso!');
    setIsConfirming(false);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: designSystem.colors.neutral.light, padding: '32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: designSystem.colors.primary.dark,
            margin: '0 0 8px 0'
          }}>
            🎨 Demonstração de Componentes
          </h1>
          <p style={{
            color: designSystem.colors.neutral.gray600,
            margin: '0'
          }}>
            Conheça os novos componentes e funcionalidades
          </p>
        </div>

        {/* Grid de Exemplos */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}>
          {/* Modal Example */}
          <Card title="Modal Component" icon="📦" hoverable>
            <p style={{ color: designSystem.colors.neutral.gray600, margin: '0 0 16px 0' }}>
              Abra um modal para coletar informações do usuário
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Abrir Modal
            </Button>
          </Card>

          {/* Confirm Dialog Example */}
          <Card title="Confirm Dialog" icon="❓" hoverable>
            <p style={{ color: designSystem.colors.neutral.gray600, margin: '0 0 16px 0' }}>
              Peça confirmação antes de ações irreversíveis
            </p>
            <Button variant="error" onClick={() => setIsConfirming(true)}>
              Deletar Item
            </Button>
          </Card>

          {/* Toast Examples */}
          <Card title="Toast Notifications" icon="🔔" hoverable>
            <p style={{ color: designSystem.colors.neutral.gray600, margin: '0 0 12px 0' }}>
              Notificações flutuantes para feedback
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button variant="success" onClick={() => success('Sucesso!')}>
                Sucesso
              </Button>
              <Button variant="error" onClick={() => error('Erro!')}>
                Erro
              </Button>
              <Button variant="primary" onClick={() => warning('Aviso!')}>
                Aviso
              </Button>
              <Button variant="secondary" onClick={() => info('Info!')}>
                Info
              </Button>
            </div>
          </Card>

          {/* Badge Examples */}
          <Card title="Status Badges" icon="🏷️" hoverable>
            <p style={{ color: designSystem.colors.neutral.gray600, margin: '0 0 12px 0' }}>
              Indicadores de status
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <Badge variant="success">Ativo</Badge>
              <Badge variant="error">Inativo</Badge>
              <Badge variant="warning">Pendente</Badge>
              <Badge variant="info">Info</Badge>
              <Badge variant="primary">Secundário</Badge>
            </div>
          </Card>

          {/* Button Variants */}
          <Card title="Button Variants" icon="🔘" hoverable>
            <p style={{ color: designSystem.colors.neutral.gray600, margin: '0 0 12px 0' }}>
              Diferentes estilos de botão
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="error">Error</Button>
              <Button variant="outline">Outline</Button>
            </div>
          </Card>

          {/* Button Sizes */}
          <Card title="Button Sizes" icon="📏" hoverable>
            <p style={{ color: designSystem.colors.neutral.gray600, margin: '0 0 12px 0' }}>
              Tamanhos disponíveis
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
          </Card>
        </div>

        {/* Features Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          <Card title="✨ Novos Componentes" icon="⭐" hoverable style={{
            borderLeft: `4px solid ${designSystem.colors.accent.gold}`
          }}>
            <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Modal com tamanhos ajustáveis</li>
              <li>Toast notifications com 4 tipos</li>
              <li>ConfirmDialog para confirmações</li>
              <li>Hook useToast para gerenciamento</li>
              <li>Totalmente responsivo</li>
              <li>Animações suaves</li>
            </ul>
          </Card>

          <Card title="📱 Responsividade" icon="📲" hoverable style={{
            borderLeft: `4px solid ${designSystem.colors.primary.light}`
          }}>
            <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Sidebar colapsável em mobile</li>
              <li>Hamburger menu automático</li>
              <li>Padding adaptativo</li>
              <li>Grid responsivo</li>
              <li>Touch-friendly buttons</li>
              <li>Overlay para mobile</li>
            </ul>
          </Card>

          <Card title="🧪 Testes Unitários" icon="✅" hoverable style={{
            borderLeft: `4px solid ${designSystem.colors.status.success}`
          }}>
            <ul style={{ margin: '0', paddingLeft: '20px', lineHeight: '1.8' }}>
              <li>Tests para Modal</li>
              <li>Tests para Toast</li>
              <li>Tests para ConfirmDialog</li>
              <li>Coverage completo</li>
              <li>Mock functions</li>
              <li>Ready to extend</li>
            </ul>
          </Card>
        </div>

        {/* Info Section */}
        <div style={{
          marginTop: '40px',
          padding: '24px',
          backgroundColor: designSystem.colors.primary.light + '20',
          borderRadius: '12px',
          borderLeft: `4px solid ${designSystem.colors.primary.dark}`
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: designSystem.colors.primary.dark,
            margin: '0 0 12px 0'
          }}>
            ℹ️ Como Usar
          </h3>
          <p style={{
            color: designSystem.colors.neutral.gray600,
            margin: '0'
          }}>
            Veja <strong>COMPONENTS_GUIDE.md</strong> na pasta frontend para documentação completa. 
            Os componentes estão em <strong>src/components/Modals.tsx</strong> e o hook em <strong>src/hooks/useToast.ts</strong>.
          </p>
        </div>
      </div>

      {/* Modal Example */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Criar Novo Item"
        size="medium"
        onConfirm={handleCreateItem}
        confirmText="Criar"
        cancelText="Cancelar"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: designSystem.colors.primary.dark,
              marginBottom: '8px'
            }}>
              Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Digite o nome"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${designSystem.colors.neutral.gray300}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: designSystem.colors.primary.dark,
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Digite o email"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: `1px solid ${designSystem.colors.neutral.gray300}`,
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit'
              }}
            />
          </div>
        </div>
      </Modal>

      {/* Confirm Dialog Example */}
      <ConfirmDialog
        isOpen={isConfirming}
        title="Confirmar Deleção"
        message="Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setIsConfirming(false)}
        isDangerous={true}
        confirmText="Deletar"
        cancelText="Cancelar"
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
