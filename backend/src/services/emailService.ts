import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: Transporter | null = null;
  private emailMode: string;

  constructor() {
    this.emailMode = process.env.EMAIL_MODE || 'mock';
    
    // Only create transporter if not in mock mode
    if (this.emailMode !== 'mock') {
      this.initializeTransporter();
    } else {
      console.log('📧 EmailService running in MOCK mode (development)');
    }
  }

  private initializeTransporter(): void {
    try {
      // Use SendGrid as SMTP provider
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || 'apikey',
          pass: process.env.SMTP_PASSWORD || '',
        },
      });
      console.log('✅ EmailService initialized with SendGrid');
    } catch (error: any) {
      console.error('❌ Failed to initialize email transporter:', error.message);
    }
  }

  /**
   * Send email using template
   */
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      // Mock mode: just log the email
      if (this.emailMode === 'mock') {
        console.log('📧 MOCK EMAIL:', {
          to,
          subject: template.subject,
          timestamp: new Date().toISOString(),
        });
        return true;
      }

      // Real mode: send via SendGrid
      if (!this.transporter) {
        console.error('❌ Email transporter not initialized');
        return false;
      }

      const mailOptions: SendMailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@advgd.com.br',
        to,
        subject: template.subject,
        html: template.html,
        text: template.text || this.stripHtml(template.html),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✉️ Email sent successfully:', result.messageId);
      return true;
    } catch (error: any) {
      console.error('❌ Email send error:', error.message);
      return false;
    }
  }

  /**
   * Send lead conversion email to team
   */
  async sendLeadConversionEmail(leadName: string, leadEmail: string, phone: string): Promise<boolean> {
    const template = this.getLeadConversionTemplate(leadName, leadEmail, phone);
    
    // Send to team email
    const teamEmail = process.env.TEAM_EMAIL || 'team@advgd.com.br';
    return this.sendEmail(teamEmail, template);
  }

  /**
   * Send lead confirmation email
   */
  async sendLeadConfirmationEmail(leadName: string, leadEmail: string): Promise<boolean> {
    const template = this.getLeadConfirmationTemplate(leadName);
    return this.sendEmail(leadEmail, template);
  }

  /**
   * Send daily digest email
   */
  async sendDailyDigestEmail(email: string, stats: any): Promise<boolean> {
    const template = this.getDailyDigestTemplate(stats);
    return this.sendEmail(email, template);
  }

  /**
   * Get lead conversion email template
   */
  private getLeadConversionTemplate(leadName: string, leadEmail: string, phone: string): EmailTemplate {
    return {
      subject: `🎉 Novo Cliente Convertido: ${leadName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Lead Convertido!</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 16px; margin: 0 0 20px 0;">
              Excelentes notícias! Um novo lead foi convertido em cliente.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Nome:</strong> ${leadName}</p>
              <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${leadEmail}</p>
              <p style="margin: 0;"><strong>Telefone:</strong> ${phone}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center;">
              <a href="${process.env.APP_URL || 'http://localhost:5173'}/leads" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Ver Detalhes do Cliente
              </a>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
              ADVGD - Plataforma de Gestão para Escritórios de Advocacia<br>
              ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}
            </p>
          </div>
        </div>
      `,
      text: `NOVO CLIENTE CONVERTIDO!\n\nNome: ${leadName}\nEmail: ${leadEmail}\nTelefone: ${phone}`,
    };
  }

  /**
   * Get lead confirmation email template
   */
  private getLeadConfirmationTemplate(leadName: string): EmailTemplate {
    return {
      subject: '✅ Recebemos seu contato - ADVGD',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #667eea; color: white; padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Olá ${leadName}! ✅</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
            <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
              Obrigado por nos contactar! Recebemos seu cadastro e em breve um de nossos advogados entrará em contato com você.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;"><strong>Tempo de Resposta:</strong> até 24h úteis</p>
              <p style="margin: 0;"><strong>Suporte:</strong> contato@advgd.com.br</p>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
              ADVGD - Especialistas em Advocacia
            </p>
          </div>
        </div>
      `,
      text: `Olá ${leadName}! Obrigado por nos contactar. Em breve entraremos em contato.`,
    };
  }

  /**
   * Get daily digest email template
   */
  private getDailyDigestTemplate(stats: any): EmailTemplate {
    return {
      subject: `📊 Resumo do Dia - ${new Date().toLocaleDateString('pt-BR')}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #667eea; color: white; padding: 30px; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">📊 Resumo do Dia</h1>
          </div>
          
          <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
              <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                <p style="margin: 0 0 5px 0; font-size: 28px; font-weight: bold; color: #667eea;">${stats.newLeads || 0}</p>
                <p style="margin: 0; font-size: 12px; color: #999;">Novos Leads</p>
              </div>
              <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                <p style="margin: 0 0 5px 0; font-size: 28px; font-weight: bold; color: #10b981;">${stats.conversions || 0}</p>
                <p style="margin: 0; font-size: 12px; color: #999;">Conversões</p>
              </div>
            </div>
            
            <p style="font-size: 12px; color: #999; margin-top: 30px; text-align: center;">
              ADVGD - ${new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      `,
      text: `Resumo do Dia\nNovos Leads: ${stats.newLeads || 0}\nConversões: ${stats.conversions || 0}`,
    };
  }

  /**
   * Strip HTML tags from string
   */
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }
}

export const emailService = new EmailService();
