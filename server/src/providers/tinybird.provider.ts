import { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class TinybirdClient {
  constructor(
    private readonly apiEndpoint: string,
    private readonly apiToken: string,
  ) {}

  /**
   * Publish multiple events to Tinybird using NDJSON format
   * @param eventName - The name of the Data Source
   * @param events - Array of events to publish
   * @param options - Optional parameters (wait, compression)
   */
  async publishEvents(
    eventName: string,
    events: Record<string, any>[],
    options: {
      wait?: boolean;
      compress?: boolean;
    } = {},
  ) {
    if (!events.length) {
      throw new Error('No events provided');
    }

    // Convert events array to NDJSON format
    const ndjsonData = events.map((event) => JSON.stringify(event)).join('\n');

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
    };

    // If compression is requested, compress the data
    const body = options.compress
      ? (() => {
          // TODO: Implement compression
          return ndjsonData;
        })()
      : ndjsonData;

    const queryParams = new URLSearchParams({
      name: eventName,
      ...(options.wait ? { wait: 'true' } : {}),
    });

    const response = await fetch(
      `${this.apiEndpoint}/v0/events?${queryParams.toString()}`,
      {
        method: 'POST',
        body,
        headers,
      },
    );

    if (!response.ok) {
      throw new Error(`Tinybird API error: ${response.statusText}`);
    }

    return response.json();
  }
}

export const TINYBIRD_CLIENT = 'TINYBIRD_CLIENT';

export const TinybirdProvider: Provider = {
  provide: TINYBIRD_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const apiEndpoint = configService.getOrThrow<string>(
      'tinybird.apiEndpoint',
    );
    const apiToken = configService.getOrThrow<string>('tinybird.apiToken');

    return new TinybirdClient(apiEndpoint, apiToken);
  },
};
