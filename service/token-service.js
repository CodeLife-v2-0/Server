const jwt = require('jsonwebtoken');
const tokenModel = require('../models/token-model');

const startsWith = (str, prefix) => str.slice(0, prefix.length) === prefix;

class TokenService {

    validateAccessToken(token){
        try{
            const tokenData = startsWith(token, 'Bearer ')? token.split(' ')[1] : token;
            const userData = jwt.verify(tokenData, process.env.JWT_ACCESS_SECRET);
            return userData;
        }catch(e){
            return null;
        }
    
    }
    validateRefreshToken(token){
        try{
            const tokenData = startsWith(token, 'Bearer ')? token.split(' ')[1] : token;
            const userData = jwt.verify(tokenData, process.env.JWT_REFRESH_SECRET);
            return userData;
        }catch(e){
            return null;
        }
    }

    generateTokens(payload){
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn:'10h'})
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn:'30d'})
        return{
            accessToken,
            refreshToken
        }
    }
    async saveToken(userId, refreshToken){
        
        const tokenData = await tokenModel.findOne({user: userId});

        if(tokenData){
            tokenData.refreshToken = refreshToken;
            return tokenData.save()
        }
        const token = await tokenModel.create({user: userId, refreshToken})
        return token;
    }
    async removeToken(refreshToken){
        const tokenData = await tokenModel.deleteOne({refreshToken});
        return tokenData;
    }

    async findToken(refreshToken){
        const tokenData = await tokenModel.findOne({refreshToken});
        return tokenData;
    }

}


module.exports = new TokenService();