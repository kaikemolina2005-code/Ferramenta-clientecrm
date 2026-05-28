# 📚 Guia de Componentes Avançados

## Modal Component

### Uso Básico
```tsx
import { useState } from 'react';
import { Modal } from '@/components/Modals';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Abrir Modal</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Meu Modal"
      >
        <p>Conteúdo do modal aqui</p>
      </Modal>
    </>
  );
}
```

### Modal com Confirmação
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Deletar Item"
  onConfirm={handleDelete}
  confirmText="Deletar"
  cancelText="Cancelar"
  isDangerous={true}
>
  <p>Tem certeza que deseja deletar este item? Esta ação não pode ser desfeita.</p>
</Modal>
```

### Props do Modal
| Prop | Tipo | Descrição |
|------|------|-----------|
| `isOpen` | boolean | Controla se o modal está aberto |
| `onClose` | () => void | Callback quando modal é fechado |
| `title` | string | Título do modal |
| `children` | ReactNode | Conteúdo do modal |
| `size` | 'small' \| 'medium' \| 'large' | Tamanho do modal (padrão: 'medium') |
| `showCloseButton` | boolean | Mostra botão de fechar (padrão: true) |
| `onConfirm` | () => void | Callback ao confirmar |
| `confirmText` | string | Texto do botão confirmar (padrão: 'Confirmar') |
| `cancelText` | string | Texto do botão cancelar (padrão: 'Cancelar') |
| `isDangerous` | boolean | Estiliza botão como ação perigosa (padrão: false) |

---

## Toast/Notification Component

### Uso com Hook useToast
```tsx
import { useToast } from '@/hooks/useToast';
import { ToastContainer } from '@/components/Modals';

function MyComponent() {
  const { toasts, success, error, warning, removeToast } = useToast();

  const handleAction = async () => {
    try {
      // fazer algo
      success('Ação concluída com sucesso!');
    } catch (err) {
      error('Erro ao realizar ação');
    }
  };

  return (
    <>
      <button onClick={handleAction}>Executar Ação</button>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
```

### Tipos de Toast
```tsx
const { success, error, warning, info, addToast } = useToast();

// Sucesso (verde)
success('Operação concluída!');

// Erro (vermelho)
error('Algo deu errado');

// Aviso (laranja)
warning('Atenção: Esta ação pode ter consequências');

// Info (azul)
info('Informação importante');

// Custom
addToast('Mensagem customizada', 'info', 3000);
```

### Props do Toast
| Prop | Tipo | Descrição |
|------|------|-----------|
| `message` | string | Mensagem a exibir |
| `type` | 'success' \| 'error' \| 'warning' \| 'info' | Tipo de toast (padrão: 'info') |
| `duration` | number | Tempo em ms antes de desaparecer (padrão: 4000) |
| `onClose` | () => void | Callback ao fechar |

---

## ConfirmDialog Component

### Uso Simples
```tsx
import { useState } from 'react';
import { ConfirmDialog } from '@/components/Modals';

function MyComponent() {
  const [showDialog, setShowDialog] = useState(false);

  const handleDelete = () => {
    // deletar item
    setShowDialog(false);
  };

  return (
    <>
      <button onClick={() => setShowDialog(true)}>Deletar</button>
      
      <ConfirmDialog
        isOpen={showDialog}
        title="Confirmar Deleção"
        message="Tem certeza que deseja deletar este item?"
        onConfirm={handleDelete}
        onCancel={() => setShowDialog(false)}
        isDangerous={true}
      />
    </>
  );
}
```

---

## Responsividade Mobile

Layout agora é responsivo com:
- **Desktop**: Sidebar fixo de 256px
- **Mobile**: Sidebar colapsável com hamburger menu
- **Padding**: Ajustado automaticamente (p-4 mobile, p-8 desktop)

### Breakpoints Tailwind
- `md`: 768px (ponto de mudança de mobile para desktop)

---

## Padrão de Uso Completo

```tsx
import { useState } from 'react';
import { Modal, ConfirmDialog, ToastContainer } from '@/components/Modals';
import { useToast } from '@/hooks/useToast';
import { Card, Button } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';

export default function CompleteExample() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const { toasts, success, error, removeToast } = useToast();

  const handleCreate = () => {
    try {
      // logica de criar
      success('Item criado com sucesso!');
      setIsModalOpen(false);
    } catch (err) {
      error('Erro ao criar item');
    }
  };

  const handleDelete = () => {
    try {
      // logica de deletar
      success('Item deletado com sucesso!');
      setIsConfirming(false);
    } catch (err) {
      error('Erro ao deletar item');
    }
  };

  return (
    <div style={{ padding: '32px' }}>
      <Card title="Exemplo Completo" icon="📋" hoverable>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
            Criar Novo
          </Button>
          <Button variant="error" onClick={() => setIsConfirming(true)}>
            Deletar
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Criar Novo Item"
        onConfirm={handleCreate}
        confirmText="Criar"
      >
        <p>Preencha o formulário para criar um novo item...</p>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirming}
        title="Confirmar Deleção"
        message="Tem certeza que deseja deletar? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
        onCancel={() => setIsConfirming(false)}
        isDangerous={true}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
```

---

## Performance Tips

1. **Mantenha toasts em locais altos da hierarquia**
   - Use um contexto global se usar toasts em muitos lugares

2. **Limpe timeouts corretamente**
   - O hook `useToast` já cuida disso

3. **Use Modal para ações importantes**
   - Não abuse de modals para tudo
   - Use confirmação apenas quando necessário

4. **Responsividade**
   - Todos os componentes já são responsivos
   - Teste em diferentes tamanhos de tela

---

## Cores do Design System

Todos os componentes usam:
- **Primária**: `#003f7f` (Azul Marinho)
- **Accent**: `#c9a961` (Ouro)
- **Sucesso**: `#27ae60` (Verde)
- **Erro**: `#c0392b` (Vermelho)
- **Aviso**: `#e67e22` (Laranja)

Veja `designSystem.ts` para todos os tokens.
