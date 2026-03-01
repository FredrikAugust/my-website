import { init } from "@dash0/sdk-web";

const serviceName = process.env.NEXT_PUBLIC_DASH0_WEBSITE_MONITORING_SERVICE_NAME ?? "fredrik-homepage";
const environment = process.env.NEXT_PUBLIC_DASH0_WEBSITE_MONITORING_ENVIRONMENT ?? "development";
const endpointUrl =
  process.env.NEXT_PUBLIC_DASH0_WEBSITE_MONITORING_ENDPOINT_URL ??
  "https://ingress.europe-west4.gcp.dash0.com";
const authToken = process.env.NEXT_PUBLIC_DASH0_WEBSITE_MONITORING_INGEST_TOKEN;

if (authToken) {
  init({
    serviceName,
    environment,
    endpoint: {
      url: endpointUrl,
      authToken,
    },
  });
}
