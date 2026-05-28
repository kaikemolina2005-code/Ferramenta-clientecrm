import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, Badge } from '@/components/TopBar';
import { designSystem } from '@/theme/designSystem';

export function DashboardPage() {
  // Mock data
  const leadsData = [
    { month: 'Jan', leads: 45, conversions: 12 },
    { month: 'Fev', leads: 52, conversions: 18 },
    { month: 'Mar', leads: 48, conversions: 15 },
    { month: 'Abr', leads: 61, conversions: 22 },
  ];

  const originData = [
    { name: 'WhatsApp', value: 45, fill: designSystem.colors.primary.dark },
    { name: 'Site', value: 25, fill: designSystem.colors.primary.light },
    { name: 'Indicação', value: 30, fill: designSystem.colors.accent.gold },
  ];

  const metrics = [
    { label: 'Leads Recebidos', value: '206', change: '+12%', icon: '👥' },
    { label: 'Clientes Convertidos', value: '67', change: '+8%', icon: '✅' },
    { label: 'Taxa de Conversão', value: '32.5%', change: '+2%', icon: '📊' },
    { label: 'CPC', value: 'R$ 45.50', change: '-5%', icon: '💰' },
  ];

  return (
    <div style={{ 
      padding: '32px',
      backgroundColor: designSystem.colors.neutral.light,
      minHeight: '100vh'
    }}>
      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        color: designSystem.colors.primary.dark,
        marginBottom: '32px',
        fontFamily: 'Segoe UI, sans-serif'
      }}>
        📊 Dashboard
      </h1>

      {/* Metrics Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {metrics.map((metric, idx) => (
          <Card key={idx} title={metric.label} icon={metric.icon} hoverable>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <p style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: designSystem.colors.primary.dark
              }}>
                {metric.value}
              </p>
              <Badge variant="success">{metric.change}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px'
      }}>
        {/* Leads vs Conversions Chart */}
        <Card title="Leads x Conversões" icon="📈" hoverable style={{ gridColumn: '1 / -1' }}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={leadsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={designSystem.colors.neutral.gray300} />
              <XAxis dataKey="month" stroke={designSystem.colors.neutral.gray500} />
              <YAxis stroke={designSystem.colors.neutral.gray500} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: designSystem.colors.neutral.white,
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="leads" stroke={designSystem.colors.primary.dark} strokeWidth={2} dot={{ fill: designSystem.colors.primary.dark }} />
              <Line type="monotone" dataKey="conversions" stroke={designSystem.colors.accent.gold} strokeWidth={2} dot={{ fill: designSystem.colors.accent.gold }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Origin Chart */}
        <Card title="Origem dos Leads" icon="🌍" hoverable>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={originData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill={designSystem.colors.primary.dark}
                dataKey="value"
              >
                {originData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: designSystem.colors.neutral.white,
                  border: `1px solid ${designSystem.colors.neutral.gray300}`,
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
