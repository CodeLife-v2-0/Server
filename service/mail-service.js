const nodemailer = require('nodemailer');
const path = require('path');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendActivationMail(to, link) {
        const imagePath = path.join(__dirname, '../public-source/img/sky_background.jpeg');
        const htmlContent = `
            <div style="width: 600px; margin: 90px auto; padding: 30px; background: linear-gradient(to right, black, #009aad); background-image: url(cid:image_cid); background-size: cover; font-family: Arial, sans-serif; box-sizing: border-box">
                <div style="text-align: center; color: white; line-height: 1.5;">
                    <h1 style="font-size: 28px; margin-bottom: 20px;">Добро пожаловать в <i>Code Life!</i></h1>
                    <p style="font-size: 18px; text-align: justify; margin-bottom: 20px; margin-top: 20px; text-indent: 20px;">Приветствуем тебя, юный падаван, в этой захватывающей виртуальной реальности, где возможности безграничны! Мы радостно открываем перед тобой нашу сокровищницу, полную нулей и единиц, раскрывая тайны цифрового мира. Здесь ты отправляешься в увлекательное путешествие, требующее силы, мудрости и отваги, но помни: вместе мы преодолеем все преграды!</p>
                    <p style="font-size: 18px; text-align: justify; margin-bottom: 20px; text-indent: 20px;">С нами ты сможешь расширить свои знания в программировании до невероятных границ! Здесь ты окунешься в захватывающую среду разработки веб-сайтов, программирования и множества передовых технологий. Наша миссия заключается в том, чтобы предоставить тебе курсы, практические задания и бесценные ресурсы, которые будут тебе путеводителями на пути к достижению твоих целей и превращению тебя в истинного мастера в выбранной области. Готов ли ты принять вызов и стать непревзойденным профессионалом? Это твой шанс!</p>
                    <a href="${link}" style="display: inline-block; background:  #009aad; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 40px; text-align: center; font-size: 16px;">Активировать аккаунт</a>
                    <p style="font-size: 16px; margin-top: 40px;">Да прибудет с тобой сила!</p>
                </div>
            </div>
        `;

        const message = {
            from: process.env.SMTP_USER,
            to,
            subject: `Активация аккаунта на ${process.env.API_URL}`,
            text: '',
            html: htmlContent,
            attachments: [
                {
                    filename: 'sky_background.jpeg',
                    path: imagePath,
                    cid: 'image_cid'
                }
            ]
        };

        await this.transporter.sendMail(message);
    }
}

module.exports = new MailService();
