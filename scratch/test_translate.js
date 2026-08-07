const fetch = require('node-fetch'); // wait, standard node-fetch might not be installed, let's use dynamic import or just standard https module

const https = require('https');

function translateKoToEn(text) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed && parsed[0]) {
            const translated = parsed[0].map(item => item[0]).join('').trim();
            resolve(translated);
          } else {
            resolve("");
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

translateKoToEn("에스라. B.C. 458년에 제2차 포로 귀환을 이끌었습니다.")
  .then(res => console.log("Result:", res))
  .catch(err => console.error("Error:", err));
