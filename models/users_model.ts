import {Model, DataTypes} from "../deps.ts";

export class Users extends Model {
    static table = 'users';
    static timestamps = true;

    static fields = {
        id: {
            primaryKey: true,
            autoIncrement: true,
        },
        username: DataTypes.STRING,
        email: DataTypes.STRING,
        password: DataTypes.STRING,
    }
}