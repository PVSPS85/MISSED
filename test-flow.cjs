const fs = require('fs');
const http = require('http');

const text = fs.readFileSync('test-chat.txt', 'utf8');

const postData = JSON.stringify({ rawText: text, sourceType: 'paste' });

const options = {
  hostname: '127.0.0.1',
  port: 3001,
  path: '/api/analyze',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const { jobId } = JSON.parse(data);
    console.log('Started job:', jobId);
    
    if (!jobId) {
      console.error('Failed to get jobId:', data);
      return;
    }

    const poll = setInterval(() => {
      http.get(`http://127.0.0.1:3001/api/status/${jobId}`, (res2) => {
        let sdata = '';
        res2.on('data', chunk => sdata += chunk);
        res2.on('end', () => {
          const status = JSON.parse(sdata);
          console.log('Status:', status.currentStage);
          if (status.isCompleted || status.isFailed) {
            clearInterval(poll);
            if (status.isFailed) {
              console.error('Job failed:', status);
            } else {
              http.get(`http://127.0.0.1:3001/api/result/${jobId}`, (res3) => {
                let rdata = '';
                res3.on('data', chunk => rdata += chunk);
                res3.on('end', () => {
                  console.log('Final Result:\n', JSON.stringify(JSON.parse(rdata), null, 2));
                });
              });
            }
          }
        });
      });
    }, 1000);
  });
});

req.write(postData);
req.end();
