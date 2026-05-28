import { automationEngine } from '../services/automationEngine.js';

interface SchedulerConfig {
  intervalMinutes: number;
}

class AutomationScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private config: SchedulerConfig;

  constructor(config: SchedulerConfig = { intervalMinutes: 5 }) {
    this.config = config;
  }

  /**
   * Inicia o scheduler de automação
   */
  start(): void {
    if (this.isRunning) {
      console.warn('⚠️ Automation Scheduler já está rodando');
      return;
    }

    this.isRunning = true;
    console.log(`⚙️ Automation Scheduler iniciado (intervalo: ${this.config.intervalMinutes}min)`);

    // Executa imediatamente
    this.processAutomations();

    // Define intervalo (padrão: 5 minutos)
    this.intervalId = setInterval(() => {
      this.processAutomations();
    }, this.config.intervalMinutes * 60 * 1000);
  }

  /**
   * Para o scheduler
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.isRunning = false;
    console.log('⏹️  Automation Scheduler parado');
  }

  /**
   * Processa automações agendadas
   */
  private async processAutomations(): Promise<void> {
    try {
      const timestamp = new Date().toLocaleTimeString('pt-BR');
      console.log(`\n[${timestamp}] ⚙️ Processando automações agendadas...`);

      const result = await automationEngine.executeScheduledAutomations();

      console.log(
        `✅ Automações processadas: ${result.executed}/${result.processed} leads, ${result.errors} erros`
      );
    } catch (error) {
      console.error('❌ Erro ao processar automações em scheduler:', error);
    }
  }
}

// Exporta como singleton
export const automationScheduler = new AutomationScheduler({
  intervalMinutes: 5  // Processa a cada 5 minutos
});
