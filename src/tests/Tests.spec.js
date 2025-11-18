import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';
import http from 'k6/http';
import { check } from 'k6';
import { Trend, Rate } from 'k6/metrics';

export const getRequestDuration = new Trend('get_request_duration', true);
export const RateStatusOK = new Rate('status_OK');

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.25'],
    get_request_duration: ['p(90)<6800'],
    status_OK: ['rate>0.75']
  },

  stages: [
    { duration: '30s', target: 7 },
    { duration: '90s', target: 92 },
    { duration: '90s', target: 92 }
  ]
};

export function handleSummary(data) {
  return {
    './src/output/index.html': htmlReport(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true })
  };
}

export default function () {
  const url = 'https://dummyjson.com/carts';

  const res = http.get(url);

  getRequestDuration.add(res.timings.duration);
  RateStatusOK.add(res.status === 200);

  check(res, {
    'status is 200': () => res.status === 200
  });
}
