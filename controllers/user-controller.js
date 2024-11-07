const userService = require('../service/user-service');
const { validationResult } = require('express-validator');
const ApiError = require('../exceptions/api-error');
const path = require('path');
const fs = require('fs');
const TokenService = require('../service/token-service')
const Course = require('../models/courses-model');
const Activite = require('../models/activites-models');
const Lecruter = require('../models/lecruter-model');

class UserController {

    async registration(req, res, next) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const { email, password, name, surName } = req.body;
            const userData = await userService.registration(email, password, name, surName);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }

    async reValidationMail(req, res, next) {
        try {

            const { email, isActivated } = req.body;
            if (!email) {
                throw next(ApiError.BadRequest('В запросе для активации передана пустая почта', errors.array()))
            }
            if (isActivated) {
                throw next(ApiError.BadRequest('Аккаунт уже активирован', errors.array()))
            }
            const userData = await userService.reValidationMail(email);
            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true })
            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }

    async logout(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken');
            return res.json(token);
        } catch (error) {
            next(error);
        }
    }

    async activate(req, res, next) {
        try {
            const activationLink = req.params.link;
            await userService.activate(activationLink);
            return res.redirect(`${process.env.CLIENT_URL}/authorization/`)
        } catch (error) {
            next(error);
        }
    }

    async refresh(req, res, next) {
        try {
            const { refreshToken } = req.cookies;
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }

    async getUser(req, res, next) {
        try {
            const users = await userService.getAllUsers();
            res.json(users);
        } catch (error) {
            next(error);
        }
    }

    async uploadAvatar(req, res, next) {
        try {
            const { image, tokenData } = req.body
            const userData = TokenService.validateAccessToken(tokenData)
            let fileName = 'default.jpg';
            if (userData) {
                const userMail = userData.email;
                fileName = `${userMail}-${Date.now()}.jpg`;
                const filePath = path.join(__dirname, '..', 'uploads', 'avatars', fileName);
                const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
                const imageBuffer = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(filePath, imageBuffer);
                userService.refreshAvatarLink(userMail, fileName);
            }
            return res.json(fileName)
        } catch (error) {
            next(error);
        }
    }

    async getPrivateImage(req, res, next) {
        const accessDenied = 'accessDenied.jpg';
        const defaultImagePath = path.join(__dirname, '..', 'uploads', 'avatars', accessDenied);
        try {
            const token = req.headers.authorization;
            const imageName = req.params.imageName;
            let successfulVerification = true;
            const userData = TokenService.validateAccessToken(token);
            if (!userData) {
                successfulVerification = false;
            }

            const imagePath = path.join(__dirname, '..', 'uploads', 'avatars', successfulVerification ? imageName : accessDenied);
            const statusCode = successfulVerification ? 200 : 403;
            if (fs.existsSync(imagePath)) {
                res.status(statusCode).sendFile(imagePath);
            } else {
                res.status(403).sendFile(defaultImagePath);
            }
        } catch (error) {
            res.status(404).sendFile(defaultImagePath);
            next(error);
        }
    }

    async getCourses(req, res, next) {
        try {
            const { requiredFields } = req.query;
            const courses = await Course.find().select(requiredFields);
            return res.json({ courses });
        } catch (error) {
            next(error);
        }
    }

    async getLecturer(req, res, next) {
        try {
            const { userId } = req.query;
            const lecruter = await Lecruter.findOne({ userId: userId }).populate('userId');
            const { subjects, sumScore, totalScore, education } = lecruter;
            const { name, surName, avatar } = lecruter.userId;
            return res.json({ subjects, sumScore, totalScore, education, name, surName, avatar });
        } catch (error) {
            next(error);
        }
    }

    async getCourse(req, res, next) {
        try {
            const { courseId } = req.query;
            try {
                const course = await Course.findById(courseId);
                if (course) {
                    const { name, description, discount } = course;
                    return res.json({ name, description, discount });
                } else {
                    console.log('Курс не найден');
                }
            } catch (error) {
                console.error('Ошибка при поиске курса:', error);
            }

        } catch (error) {
            next(error);
        }
    }



    async getLessonsData(req, res, next) {
        try {
            const  token  = req.headers.authorization;
            const userData = TokenService.validateAccessToken(token);
            const userId = userData.id;
            Activite.find({
                $or: [
                    { lecturer: userId },
                    { students: userId }
                ]
            }).then(foundActivites => {
                const result = {};
                foundActivites.forEach(activite => {
                    const year = activite.date.getFullYear();
                    const month = activite.date.getMonth();
                    const day = activite.date.getDate();
                    const { signature, typeActivites, subject, lecturer, title, students } = activite;
                    if (!result[year]) result[year] = {};
                    if (!result[year][month]) result[year][month] = {};
                    if (!result[year][month][day]) result[year][month][day] = [];

                    result[year][month][day].push({
                        signature, typeActivites, subject, lecturer, title, students
                    });
                });
                res.json({ ...result });
            })
                .catch(error => {
                    console.error('Ошибка при поиске активностей:', error);
                });
        } catch (e) {
            console.log(e);
        }

    }
}

module.exports = new UserController();