/**
 * Integração com If Then Pay
 * SDK/API client para processamento de pagamentos
 */

export interface IfThenPayConfig {
  apiKey: string;
  apiSecret: string;
  sandbox?: boolean;
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  reference?: string;
}

export interface PaymentResponse {
  paymentId: string;
  paymentLink: string;
  status: "pending" | "processing" | "paid" | "failed" | "cancelled";
}

class IfThenPayClient {
  private config: IfThenPayConfig;
  private baseUrl: string;

  constructor(config: IfThenPayConfig) {
    this.config = config;
    this.baseUrl = config.sandbox
      ? "https://sandbox.if-then-pay.com/api"
      : "https://api.if-then-pay.com/api";
  }

  /**
   * Criar uma transação de pagamento
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.config.apiKey}`,
          "X-API-Secret": this.config.apiSecret,
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency,
          description: request.description,
          return_url: request.returnUrl,
          cancel_url: request.cancelUrl,
          reference: request.reference,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: "Erro desconhecido" }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      
      return {
        paymentId: data.payment_id || data.id,
        paymentLink: data.payment_link || data.url,
        status: "pending",
      };
    } catch (error: any) {
      console.error("Erro ao criar pagamento If Then Pay:", error);
      throw error;
    }
  }

  /**
   * Verificar status de um pagamento
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/payments/${paymentId}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${this.config.apiKey}`,
          "X-API-Secret": this.config.apiSecret,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      return {
        paymentId: data.payment_id || data.id,
        paymentLink: data.payment_link || data.url,
        status: this.mapStatus(data.status),
      };
    } catch (error: any) {
      console.error("Erro ao verificar status do pagamento:", error);
      throw error;
    }
  }

  /**
   * Verificar webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // TODO: Implementar verificação de assinatura HMAC
    // Por enquanto, retornar true (em produção, implementar verificação real)
    return true;
  }

  private mapStatus(status: string): PaymentResponse["status"] {
    const statusMap: Record<string, PaymentResponse["status"]> = {
      pending: "pending",
      processing: "processing",
      paid: "paid",
      completed: "paid",
      failed: "failed",
      cancelled: "cancelled",
      canceled: "cancelled",
    };
    return statusMap[status.toLowerCase()] || "pending";
  }
}

// Singleton instance
let ifThenPayClient: IfThenPayClient | null = null;

export function getIfThenPayClient(): IfThenPayClient {
  if (!ifThenPayClient) {
    const config: IfThenPayConfig = {
      apiKey: process.env.IF_THEN_PAY_API_KEY || "",
      apiSecret: process.env.IF_THEN_PAY_API_SECRET || "",
      sandbox: process.env.IF_THEN_PAY_SANDBOX === "true",
    };

    if (!config.apiKey || !config.apiSecret) {
      console.warn("If Then Pay credentials not configured. Using mock client.");
    }

    ifThenPayClient = new IfThenPayClient(config);
  }

  return ifThenPayClient;
}



