import { ConflictException, Injectable } from '@nestjs/common';
import { Skill } from '../schemas/skill.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SkillService {
    private createdSkills: Skill[] = [];

    constructor(@InjectModel(Skill.name) private readonly skillModel: Model<Skill>) {}
    async create(skillData: Skill): Promise<Skill> {
      const existingSkill = await this.skillModel.findOne({ name: skillData.name });
      if (existingSkill) {
        throw new ConflictException('Skill with the same name already exists');
      }
      const createdSkill = new this.skillModel(skillData);
      return createdSkill.save();
    }
    async findAll(): Promise<any[]> {
      return this.skillModel.find().exec();
    }
    async deleteAll(): Promise<any> {
      return this.skillModel.deleteMany().exec();
    }   
}
