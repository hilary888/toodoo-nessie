import {Model, DataTypes} from "../deps.ts";
import { User } from "./user_model.ts";

export class Todo extends Model {
    static table = "todo";
    static timestamps = true;

    static fields = {
        id: {
            primaryKey: true,
            autoIncrement: true,
            type: DataTypes.INTEGER,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            length: 255
        },
        body: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }

    static user() {
        return this.hasOne(User);
    }
}