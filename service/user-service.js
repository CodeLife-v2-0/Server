const UserModel = require('../models/user-model');
const uuid = require('uuid');
const MailService = require('./mail-service');
const TokenService = require('./token-service')
const UserDto = require('../dtos/user-dto');
const bcrypt = require('bcrypt');
const ApiError = require('../exceptions/api-error');
const tokenService = require('./token-service');


class UserService {



    async registration(email, password, name, surName) {

        const candidate = await UserModel.findOne({ email });
        if (candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адрессом ${email} уже существует`)
        }

        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4();
        const role = 'user';
        const avatar = 'default';
        await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
        const userDto = new UserDto({ email, name, surName, avatar, role });
        const tokens = TokenService.generateTokens({ ...userDto });
        const userData = { ...userDto, password: hashPassword, activationLink };
        await UserModel.create(userData);
        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
    }

    async reValidationMail(email) {
        const candidate = await UserModel.findOne({ email });
        if (!candidate) {
            throw ApiError.BadRequest(`Пользователь с почтовым адрессом ${email} не существует`)
        }
        const activationLink = uuid.v4();
        const user = await UserModel.findOneAndUpdate({ email }, { activationLink }, { new: true });
        await MailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`);
        return new UserDto(user);
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({ activationLink });
        if (!user) {
            throw ApiError.BadRequest('Неккоректная ссылка активации');
        }
        user.isActivated = true;
        await user.save();
    }
    async login(email, password) {
        const user = await UserModel.findOne({ email });
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не был найден');
        }
        const isPasEquals = await bcrypt.compare(password, user.password);
        if (!isPasEquals) {
            throw ApiError.BadRequest('Неверный пароль');
        }
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({ ...userDto });

        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
    }

    async logout(refreshToken) {
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken) {
        if (!refreshToken) {
            throw ApiError.UnauthorizedError();
        }
        const userData = tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = tokenService.findToken(refreshToken);
        if (!userData || !tokenFromDb) {
            throw ApiError.UnauthorizedError();
        }
        const user = await UserModel.findById(userData.id);
        const userDto = new UserDto(user);
        const tokens = TokenService.generateTokens({ ...userDto });
        await TokenService.saveToken(userDto.id, tokens.refreshToken);
        return {
            ...tokens,
            user: userDto
        }
    }

    async getAllUsers() {
        const users = await UserModel.find();
        return users;
    }

    async refreshAvatarLink(email, avatar){
        const user = await UserModel.findOneAndUpdate({ email }, { avatar }, { new: true });
        console.log(user);
        return;
    }

}

module.exports = new UserService();