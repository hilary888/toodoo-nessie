import {Model, DataTypes} from "../deps.ts";

export class User extends Model {
    static table = "users";
    static timestamps = true;

    static fields = {
        id: {
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            length: 255,
        },
        email: {
            type: DataTypes.STRING, 
            allowNull: false,
            length: 255,
        },
        password: {
            allowNull: false,
            type: DataTypes.STRING,
            length: 255,
        }
    }
}