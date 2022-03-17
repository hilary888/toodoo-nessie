import {Model, DataTypes} from "../deps.ts";

export class Users extends Model {
    static table = 'users';
    static timestamps = true;

    static fields = {
        id: {
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING, 
            allowNull: false,
        },
        password: {
            allowNull: false,
            type: DataTypes.STRING,
        },
    }
}