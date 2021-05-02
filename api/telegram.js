const axios = require('axios');

const districtId = '<DISTRICT-ID>'; // Replace value here
const yourAge = 27  //Replace age with your age.
const appointmentsListLimit = 2 //Increase/Decrease it based on the amount of information you want in the notification.

function getDate() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const dd = tomorrow.getDate();
    const mm = tomorrow.getMonth() + 1;
    const yyyy = tomorrow.getFullYear();
    return `${dd < 10 ? '0' + dd : dd}-${mm < 10 ? '0' + mm : mm}-${yyyy}`
}
const date = getDate();

module.exports = async (req, res) => {
    const date = new Date().toString();
    //const response = await sendToTelegram();
    res.status(200).send(JSON.stringify(process.env));
};


async function sendToTelegram(text="",chat_id=process.env.TGUSER_ID) {
    const uri = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;
  
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
    const httpResponse = await axios.get(uri, options);
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
    const httpResponse = await axios.get(uri, options);
    return httpResponse;
  }


  function pingCowin() {
    axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districtId}&date=${date}`).then((result) => {
        const { centers }= result.data;
        let isSlotAvailable = false;
        let dataOfSlot = "";
        let appointmentsAvailableCount = 0;
        if(centers.length) {
            centers.forEach(center => {
                center.sessions.forEach((session => {
                    if(session.min_age_limit < yourAge && session.available_capacity > 0) {
                        isSlotAvailable = true
                        appointmentsAvailableCount++;
                        if(appointmentsAvailableCount <= appointmentsListLimit) {
                            dataOfSlot = `${dataOfSlot}\nSlot for ${session.available_capacity} is available: ${center.name} on ${session.date}`;
                        }
                    }
                }))
            });
        }
        if(isSlotAvailable) {
            axios.post(`https://maker.ifttt.com/trigger/${iftttWebhookName}/with/key/${iftttWebhookKey}`, { value1: dataOfSlot }).then(() => {
                console.log('Sent Notification to Phone \nStopping Pinger...')
                clearInterval(timer);
            });
        }
    }).catch((err) => {
        console.log("Error: " + err.message);
    });
}