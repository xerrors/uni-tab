import OSS from 'ali-oss';
export let oss = new OSS({
    region: 'oss-cn-hangzhou',
    accessKeyId: '***',
    accessKeySecret: '***',
    bucket: 'chuan-crx',
});