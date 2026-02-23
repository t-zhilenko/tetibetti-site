import { handleSubscribe } from "../../lib/subscribe";

export interface Env {
  BREVO_API_KEY: string;
}

type PagesContext<EnvVars> = {
  request: Request;
  env: EnvVars;
};

export const onRequestPost = async ({ request, env }: PagesContext<Env>) => {
  return handleSubscribe(request, env?.BREVO_API_KEY);
};
