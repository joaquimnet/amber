import axios, { AxiosInstance } from 'axios';
import { wakatime } from '../../../config';

class WakatimeClient {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: 'https://wakatime.com/api/v1',
      headers: {
        Authorization: `Basic ${Buffer.from(wakatime.WAKATIME_API_KEY).toString('base64')}`,
      },
    });
  }

  async getSummary7Days() {
    const { data } = await this.axios.get('/users/current/summaries', {
      params: {
        range: 'last_7_days',
      },
    });
    return data;
  }

  async getSummaryToday() {
    const { data } = await this.axios.get('/users/current/summaries', {
      params: {
        range: 'today',
      },
    });
    return data;
  }
}

export const wakatimeService = new WakatimeClient();
