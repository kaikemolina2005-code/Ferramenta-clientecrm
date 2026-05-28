import { emailSequenceService } from '../services/emailSequenceService.js';

interface SchedulerConfig {
  intervalMinutes: number;
}

class SequenceScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private config: SchedulerConfig;

  constructor(config: SchedulerConfig = { intervalMinutes: 1 }) {
    this.config = config;
  }

  /**
   * Inicia o scheduler
   */
  start(): void {
    if (this.isRunning) {
      console.warn('⚠️ Scheduler já está rodando');
      return;
    }

    this.isRunning = true;
    console.log(`🕐 Sequence Scheduler iniciado (intervalo: ${this.config.intervalMinutes}min)`);

    // Executa imediatamente
    this.processEmails();

    // Define intervalo
    this.intervalId = setInterval(() => {
      this.processEmails();
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
    console.log('⏹️  Sequence Scheduler parado');
  }

  /**
   * Processa emails agendados
   */
  private async processEmails(): Promise<void> {
    try {
      const timestamp = new Date().toLocaleTimeString('pt-BR');
      console.log(`\n[${timestamp}] 📧 Processando emails agendados...`);

      const count = await emailSequenceService.processScheduledEmails();

      if (count > 0) {
        console.log(`✅ ${count} emails de sequência processados`);
      } else {
        console.log(`ℹ️ Nenhum email agendado no momento`);
      }
    } catch (error) {
      console.error('❌ Erro ao processar emails em scheduler:', error);
    }
  }
}

// Exporta como singleton
export const sequenceScheduler = new SequenceScheduler({
  intervalMinutes: 1  // Processa a cada minuto
});
