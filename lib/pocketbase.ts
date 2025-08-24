import PocketBase from 'pocketbase';

const pb = new PocketBase('http://103.174.191.70:8090');

pb.autoCancellation(false);

export default pb;
