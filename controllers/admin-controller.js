const ApiError = require('../exceptions/api-error');
const TokenService = require('../service/token-service')
const Activite = require('../models/activites-models')
const Lecruter = require('../models/lecruter-model');
const User = require('../models/user-model')

class AdminController {
    async getActivites(req, res, next) {
        try {
            const activites = await Activite.find();
            return res.json({ activites });
        } catch (error) {
            next(error);
        }
    }

    async getLecruters(req, res, next) {
        try {
            const { requiredFields } = req.query;
            const lecruters = await Lecruter.find().select(requiredFields);
            return res.json({ lecruters });
        } catch (error) {
            next(error);
        }
    }


    async getUsers(req, res, next) {
        try {
            const { requiredFields, skip, limit, serchQueryName } = req.query;
            const searchTerms = serchQueryName ? serchQueryName.split(' ') : '';

            const firstName = searchTerms[0];
            const lastName = searchTerms.length > 1 ? searchTerms[1] : '';

            let query;
            if (firstName && lastName) {
                query = { name: { $regex: firstName, $options: 'i' }, surName: { $regex: lastName, $options: 'i' } };
            } else if (!firstName && !lastName) {
                query = {};
            } else {
                query = {
                    $or: [
                        { name: { $regex: firstName, $options: 'i' } },
                        { surName: { $regex: firstName, $options: 'i' } }
                    ]
                };
            }
            if (!skip && !limit)
                return res.json({
                    users: await User.find(query).select(requiredFields)
                })
            let skipValue = skip | null;
            let nextValue = next | null;
            return res.json({
                users: await User.find(query).select(requiredFields).skip(skipValue).limit(nextValue)
            })



        } catch (error) {
            next(error);
        }
    }

    async getUser(req, res, next) {
        try {
            const {  userId, requiredFields } = req.query;
            const user = await User.findById(userId).select(requiredFields);
            return res.json({ user });
        } catch (error) {
            next(error);
        }
    }
    async createNewRecordActivities(req, res, next) {
        try {
            const { inputData, dateData } = req.query;
            const [signature, lecturer, title, students, subject, typeActivites] = inputData;
            await Promise.all(dateData.map(async date => {
                const [day, month, year] = date.split('.').map(el => Number(el));
                const dateObject = new Date(year, month, day);
                await Activite.create({
                    title,
                    signature,
                    typeActivites,
                    subject,
                    lecturer,
                    date: dateObject,
                    students: students.split(' '),
                });
            }));
        } catch (error) {
            console.log(error)
            return res.json({ result: false });
        }
        return res.json({ result: true });
    }
}

module.exports = new AdminController();