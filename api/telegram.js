module.exports = async (req, res) => {
    const date = new Date().toString();
    const response = await sendToTelegram();
    res.status(200).send(JSON.stringify(response));
};


async function sendToTelegram(text="",chat_id=TGUSER_ID) {
    const uri = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  
    const options = {
      'method': 'POST',
      'headers': {
        'Content-type': 'application/json',
        "Cache-Control": "no-cache"
      },
      'body': JSON.stringify({
        'chat_id': chat_id,
        'text': text
      })
    }
    //return options; //to debug;
    const httpResponse = await fetch(uri, options);
    return httpResponse;
  }
  
  async function getCovid() {
    let date = '31-03-2021';
    let pincode = '400097';
    const uri = `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pincode}&date=${date}`;
  
    const options = {
      'method': 'GET',
      'headers': {
        'Content-type': 'application/json',
        "Cache-Control": "no-cache"
      }
    }
    //return options; //to debug;
    const httpResponse = await fetch(uri, options);
    return httpResponse;
  }