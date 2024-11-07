module.exports = class UserDto {
    email;
    id;
    isActivated;
    name;
    surName;
    avatar;
    role;
    constructor(model) {
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
        this.name = model.name;
        this.surName = model.surName;
        this.avatar = model.avatar;
        this.role = model.role; 
    }
}