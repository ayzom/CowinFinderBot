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
    
    const cowinData = await getState();
    const response = await sendToTelegram(cowinData);
    res.status(200).send(JSON.stringify(response));
};


async function sendToTelegram(text="",chat_id=process.env.TGUSER_ID) {
        const uri = `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`;

        const data = JSON.stringify({
            "chat_id": "198940317",
            "text": JSON.stringify(text)
        });
      
      const config = {
        method: 'post',
        url: uri,
        headers: { 
          'Content-Type': 'application/json', 
          'Cache-Control': 'no-cache'
        },
        data : data
      };
      
      const response = await axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        return JSON.stringify(response.data);
      })
      .catch(function (error) {
        console.log(error);
        return JSON.stringify(error);
      });
}

async function getState() {
    var config = {
        method: 'get',
        url: 'https://cdn-api.co-vin.in/api/v2/admin/location/states',
        headers: { 
            'Content-Type': 'application/json', 
            'Cache-Control': 'no-cache'
        }
    };

    const response = await axios(config)
        .then(function (response) {
            console.log(JSON.stringify(response.data));
            return response.data;
        })
        .catch(function (error) {
            console.log(error);
            return error;
        });
    return response;
}

async function pingCowin(pincode, date) {
    const response = await axios.get(`https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${pincode}&date=${date}`).then((result) => {
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
        return JSON.stringify(result.data);
        if(isSlotAvailable) {
            axios.post(`https://maker.ifttt.com/trigger/${iftttWebhookName}/with/key/${iftttWebhookKey}`, { value1: dataOfSlot }).then(() => {
                console.log('Sent Notification to Phone \nStopping Pinger...')
                clearInterval(timer);
            });
        }
    }).catch((err) => {
        console.log("Error: " + err.message);
    });

    return response;
}