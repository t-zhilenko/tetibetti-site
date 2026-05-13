import { getPaymentProvider, getRequiredMonoEnv } from "@/lib/server/env";
import { createMonoPaymentProvider } from "@/lib/server/payments/providers/mono";

export type CreatePaymentInput = {
  orderId: string;
  productSlug: string;
  productName: string;
  amount: number;
  email: string;
  locale: "uk" | "en";
};

export type CreatePaymentResult = {
  provider: "mono";
  providerInvoiceId: string;
  paymentUrl: string;
};

export type PaymentProviderClient = {
  provider: "mono";
  createPayment: (input: CreatePaymentInput) => Promise<CreatePaymentResult>;
};

export class UnsupportedPaymentProviderError extends Error {
  constructor(provider: string) {
    super(`Unsupported payment provider: ${provider}`);
    this.name = "UnsupportedPaymentProviderError";
  }
}

export const getPaymentProviderClient = async (): Promise<PaymentProviderClient> => {
  const provider = await getPaymentProvider();
  if (provider !== "mono") {
    throw new UnsupportedPaymentProviderError(provider);
  }

  const env = await getRequiredMonoEnv();
  return createMonoPaymentProvider(env);
};
