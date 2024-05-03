import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Role } from "./Shemas/Roles.Shema";
import { CreateRoleDto } from "./dto/Roles.dto";
import { User } from "./Shemas/User.shema";

@Injectable()
export class Roleservice{
    constructor(@InjectModel('Role') private readonly roleModel: Model<Role>,
    @InjectModel('User') private readonly userModel: Model<User>,) {}

    async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
      const createdRole = new this.roleModel(createRoleDto);
      return createdRole.save();
    }
    async findRoleByName(roleName: Role): Promise<Role> {
      return this.roleModel.findOne({ name: roleName }).exec();
    }
    }
