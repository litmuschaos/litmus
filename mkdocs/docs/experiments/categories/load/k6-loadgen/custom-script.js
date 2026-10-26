import http from 'k6/http';
import { sleep } from 'k6';
export const options = {
    vus: 100,
    duration: '30s',
};
export default function () {
    http.get('http://<<target_domain_name>>/');
    sleep(1);
}
